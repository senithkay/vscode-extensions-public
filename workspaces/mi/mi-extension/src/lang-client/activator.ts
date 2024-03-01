/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    commands,
    ExtensionContext,
    extensions,
    IndentAction,
    LanguageConfiguration,
    languages,
    Position,
    TextDocument,
    window,
    workspace
} from 'vscode';
import * as path from 'path';
import {
    LanguageClientOptions
} from 'vscode-languageclient';
import { ServerOptions } from "vscode-languageclient/node";
import { DidChangeConfigurationNotification, RequestType, TextDocumentPositionParams } from 'vscode-languageserver-protocol';

import { activateTagClosing, AutoCloseResult } from './tagClosing';
import { ExtendedLanguageClient } from './ExtendedLanguageClient';
import { GoToDefinitionProvider } from './DefinitionProvider';

export interface ScopeInfo {
    scope: "default" | "global" | "workspace" | "folder";
    configurationTarget: boolean | undefined;
}

namespace TagCloseRequest {
    export const method: string = 'xml/closeTag';
}

let ignoreAutoCloseTags = false;
let vmArgsCache: any;
let ignoreVMArgs = false;
const main: string = 'org.eclipse.lemminx.XMLServerLauncher';

export class MILanguageClient {
    private static _instance: MILanguageClient;
    public languageClient: ExtendedLanguageClient | undefined;

    constructor(private context: ExtensionContext) { }

    public static async getInstance(context: ExtensionContext) {
        if (!this._instance) {
            this._instance = new MILanguageClient(context);
            await this._instance.launch();
        }
        return this._instance;
    }

    private async launch() {
        try {
            const { JAVA_HOME } = process.env;

            if (JAVA_HOME) {
                let executable: string = path.join(JAVA_HOME, 'bin', 'java');
                let schemaPath = this.context.asAbsolutePath(path.join("synapse-schemas", "synapse_config.xsd"));
                let langServerCP = this.context.asAbsolutePath(path.join('ls', '*'));                

                let schemaPathArg = '-DSCHEMA_PATH=' + schemaPath;
                const args: string[] = [schemaPathArg, '-cp', langServerCP];

                if (process.env.LSDEBUG === "true") {
                    console.log('LSDEBUG is set to "true". Services will run on debug mode');
                    args.push('-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=5005,quiet=y');
                }

                let serverOptions: ServerOptions = {
                    command: executable,
                    args: [...args, main],
                    options: {},
                };

                // Options to control the language client
                let clientOptions: LanguageClientOptions = {
                    initializationOptions: { "settings": getXMLSettings() },
                    synchronize: {
                        //preferences starting with these will trigger didChangeConfiguration
                        configurationSection: ['xml', '[SynapseXml]']
                    },
                    // Register the server for synapse xml documents
                    documentSelector: [{ scheme: 'file', language: 'SynapseXml' }],
                    middleware: {
                        workspace: {
                            didChangeConfiguration: async () => {
                                this.languageClient!.sendNotification(DidChangeConfigurationNotification.method,
                                    { settings: getXMLSettings() });
                                if (!ignoreAutoCloseTags) {
                                    verifyAutoClosing();
                                }
                                !ignoreVMArgs ? verifyVMArgs() : undefined;
                            }
                        }
                    },
                    outputChannelName: 'Synapse Language Server',
                    initializationFailedHandler: (error) => {
                        console.log(error);
                        window.showErrorMessage("Could not start the Synapse Language Server.");
                        return false;
                    }
                };

                // Create the language client and start the client.
                this.languageClient = new ExtendedLanguageClient('synapseXML', 'Synapse Language Server',
                    serverOptions, clientOptions);
                await this.languageClient.start();

                //Setup autoCloseTags
                let tagProvider: (document: TextDocument, position: Position) => Thenable<AutoCloseResult> = (document: TextDocument, position: Position) => {
                    let param = this.languageClient!.code2ProtocolConverter.asTextDocumentPositionParams(document, position);
                    return this.languageClient!.sendRequest(TagCloseRequest.method, param);
                };

                activateTagClosing(tagProvider, { synapseXml: true, xsl: true },
                    'xml.completion.autoCloseTags');
                languages.setLanguageConfiguration('SynapseXml', getIndentationRules());
                registerDefinitionProvider(this.context, this.languageClient);
            } else {
                throw new Error("JAVA_HOME is not set");
            }
        } catch (error) {
            console.error("Failed to launch the language client: ", error);
            window.showErrorMessage("Failed to launch the language client. Please check the console for more details.");
        }

        function getXMLSettings(): JSON {
            let configXML = workspace.getConfiguration().get('xml');
            let xml: any;
            if (!configXML) { //Set default preferences if not provided
                xml =
                {
                    xml: {
                        trace: {
                            server: 'verbose'
                        },
                        logs: {
                            client: true
                        },
                        format: {
                            enabled: true,
                            splitAttributes: false
                        },
                        completion: {
                            autoCloseTags: false
                        }
                    }
                };
            } else {
                let x: string = JSON.stringify(configXML); //configXML is not a JSON type
                JSON.parse(x);
                xml = { xml: JSON.parse(x) };

            }
            let extensionPath = extensions.getExtension("wso2.micro-integrator")!.extensionPath;
            xml['xml']['extensionPath'] = [`${extensionPath}`];
            xml['xml']['catalogs'] = [`${extensionPath}/synapse-schemas/catalog.xml`];
            xml['xml']['useCache'] = true;
            return xml;
        }

        function verifyAutoClosing() {
            let configXML = workspace.getConfiguration();
            let closeTags = configXML.get("xml.completion.autoCloseTags");
            let x: any = configXML.get("[SynapseXml]");
            if (x) {
                let closeBrackets: any = x["editor.autoClosingBrackets"];
                if (closeTags && closeBrackets !== "never") {
                    window.showWarningMessage(
                        "The [SynapseXml].editor.autoClosingBrackets setting conflicts with " +
                        "xml.completion.autoCloseTags. It's recommended to disable it.",
                        "Disable", "Ignore")
                        .then((selection) => {
                            if (selection === "Disable") {
                                let scopeInfo: ScopeInfo = getScopeLevel("", "[SynapseXml]");
                                workspace.getConfiguration().update("[SynapseXml]",
                                    { "editor.autoClosingBrackets": "never" },
                                    scopeInfo.configurationTarget).then(
                                        () => console.log('[SynapseXml].editor.autoClosingBrackets globally set to never'),
                                        (error) => console.log(error)
                                    );
                            } else if (selection === "Ignore") {
                                ignoreAutoCloseTags = true;
                            }
                        });
                }
            }
        }

        function verifyVMArgs() {
            let currentVMArgs = workspace.getConfiguration("xml.server").get("vmargs");
            if (vmArgsCache !== undefined) {
                if (vmArgsCache !== currentVMArgs) {
                    window.showWarningMessage(
                        "XML Language Server configuration changed, please restart VS Code.",
                        "Restart",
                        "Ignore").then((selection: string | undefined) => {
                            if (selection === "Restart") {
                                commands.executeCommand("workbench.action.reloadWindow");
                            } else if (selection === "Ignore") {
                                ignoreVMArgs = true;
                            }
                        });
                }
            } else {
                vmArgsCache = currentVMArgs;
            }
        }

        function getScopeLevel(configurationKey: string, key: string): ScopeInfo {
            let configXML = workspace.getConfiguration(configurationKey);
            let result = configXML.inspect(key);
            let scope: "default" | "global" | "workspace" | "folder", configurationTarget;
            if (result && result.workspaceFolderValue === undefined) {
                if (result.workspaceValue === undefined) {
                    if (result.globalValue === undefined) {
                        scope = "default";
                        configurationTarget = true;
                    } else {
                        scope = "global";
                        configurationTarget = true;
                    }
                } else {
                    scope = "workspace";
                    configurationTarget = false;
                }
            } else {
                scope = "folder";
                configurationTarget = undefined;
            }
            return { "scope": scope, "configurationTarget": configurationTarget };
        }

        function getIndentationRules(): LanguageConfiguration {
            return {
                onEnterRules: [
                    {
                        beforeText: new RegExp(`<([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                        afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
                        action: { indentAction: IndentAction.IndentOutdent }
                    },
                    {
                        beforeText: new RegExp(`<(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                        action: { indentAction: IndentAction.Indent }
                    }
                ],
            };
        }

        function registerDefinitionProvider(context: ExtensionContext, langClient: ExtendedLanguageClient) {
            const gotoDefinitionProvider = new GoToDefinitionProvider(langClient);
            context.subscriptions.push(languages.registerDefinitionProvider("SynapseXml", gotoDefinitionProvider));
        }
    }
}
