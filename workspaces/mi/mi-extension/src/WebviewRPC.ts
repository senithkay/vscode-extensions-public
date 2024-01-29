/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { commands, WebviewPanel, window, WebviewView, workspace, Range, WorkspaceEdit, Uri, Position, ExtensionContext } from "vscode";
import { Messenger } from "vscode-messenger";
import * as os from 'os';
import {
    ApplyEdit,
    ApplyEditParams,
    CreateAPI,
    CreateAPIParams,
    ExecuteCommandRequest,
    GetAPIDirectory,
    GetConnectorRequest,
    GetConnectorsRequest,
    GetConnectorsResponse,
    GetSyntaxTreeRequest,
    ShowErrorMessage,
    GetProjectStructureRequest,
    CloseWebViewNotification,
    OpenDiagram,
    CreateEndpoint,
    CreateEndpointParams,
    GetEndpointDirectory,
    OpenFile,
    GetEndpointsAndSequences,
    CreateSequenceParams,
    CreateSequence,
    GetSequenceDirectory,
    AskProjectDirPath,
    GetProjectRoot
} from "@wso2-enterprise/mi-core";
import { MILanguageClient } from "./lang-client/activator";
import * as fs from "fs";
import path = require("path");
const { XMLParser } = require("fast-xml-parser");

const connectorsPath = path.join(".metadata", ".Connectors");

// Register handlers
export function registerWebviewRPCHandlers(messenger: Messenger, view: WebviewPanel | WebviewView, context: ExtensionContext) {
    messenger.onRequest(ExecuteCommandRequest, async (args: string[]) => {
        if (args.length >= 1) {
            const cmdArgs = args.length > 1 ? args.slice(1) : [];
            const result = await commands.executeCommand(args[0], ...cmdArgs);
            return result;
        }
    });

    messenger.onRequest(GetSyntaxTreeRequest, async (documentUri: string) => {
        return (await MILanguageClient.getInstance(context)).languageClient!.getSyntaxTree({
            documentIdentifier: {
                uri: documentUri,
            },
        });
    });

    messenger.onRequest(GetProjectStructureRequest, async (documentUri: string) => {
        return (await MILanguageClient.getInstance(context)).languageClient!.getProjectStructure(documentUri);
    });

    messenger.onRequest(GetConnectorsRequest, async () => {
        const connectorNames: GetConnectorsResponse[] = [];
        const workspaceFolders = workspace.workspaceFolders;

        if (!workspaceFolders) {
            return connectorNames;
        }

        if (!fs.existsSync(path.join(workspaceFolders[0].uri.path, connectorsPath))) {
            return connectorNames;
        }

        const connectorsRoot = path.join(workspaceFolders[0].uri.path, connectorsPath);
        const connectors = fs.readdirSync(connectorsRoot, {withFileTypes: true});
        connectors.filter(dirent => dirent.isDirectory()).forEach(connectorDir => {
            const connectorPath = path.join(connectorsRoot, connectorDir.name);
            const connectorInfoFile = path.join(connectorPath, `connector.xml`);
            const connectorIconFile = path.join(connectorPath, "icon", `icon-large.png`);
            if (fs.existsSync(connectorInfoFile)) {
                const connectorDefinition = fs.readFileSync(connectorInfoFile, "utf8");
                const options = {
                    ignoreAttributes: false,
                    attributeNamePrefix: "@_"
                };
                const parser = new XMLParser(options);
                const connectorInfo = parser.parse(connectorDefinition);
                const connectorName = connectorInfo["connector"]["component"]["@_name"];
                const connectorDescription = connectorInfo["connector"]["component"]["description"];
                const connectorIcon = Buffer.from(fs.readFileSync(connectorIconFile)).toString('base64');
                connectorNames.push({ path: connectorPath, name: connectorName, description: connectorDescription, icon: connectorIcon });
            }
        });

        return connectorNames;
    });

    messenger.onRequest(GetConnectorRequest, async (connectorPath: string): Promise<string[]> => {
        const connectorFiles: string[] = [];
        const uiSchemas = path.join(connectorPath, "uischema");
        if (fs.existsSync(uiSchemas)) {
            const connectorFilesList = fs.readdirSync(uiSchemas);
            connectorFilesList.forEach(file => {
                const connectorFile = fs.readFileSync(path.join(uiSchemas, file), "utf8");
                connectorFiles.push(connectorFile);
            });
        }
        return connectorFiles;
    });

    messenger.onNotification(ShowErrorMessage, (error: string) => {
        window.showErrorMessage(error);
    });

    messenger.onNotification(ApplyEdit, async (params: ApplyEditParams) => {
        const edit = new WorkspaceEdit();
        let document = workspace.textDocuments.find(doc => doc.uri.fsPath === params.documentUri);

        if (!document) {
            document = await workspace.openTextDocument(Uri.parse(params.documentUri));
        }

        const range = new Range(new Position(params.range.start.line, params.range.start.character),
            new Position(params.range.end.line, params.range.end.character));
        const startLine = document.lineAt(range.start.line).text;
        const startLineIndentation = startLine.match(/^\s*/);
        const endLine = document.lineAt(range.end.line).text;
        const endLineIndentation = endLine.match(/^\s*/);

        const sIndentation = startLineIndentation ? startLineIndentation[0] : "";
        const eIndentation = endLineIndentation ? endLineIndentation[0] : "";
        const textEmpty = params.text.trim().length === 0;
        const textBefore = startLine.substring(0, range.start.character).trim();
        const textAfter = endLine.substring(range.end.character).trim();
        let text = params.text;
        if (!textEmpty) {
            text = `${textBefore.length > 0 ? "\n" + sIndentation : ""}${params.text.replace(/\n/g, "\n" + sIndentation)}${textAfter.length > 0 ? "\n" + eIndentation : ""}`;
        }
        edit.replace(Uri.parse(params.documentUri), range, text);
        await workspace.applyEdit(edit);
    });
    
    messenger.onRequest(GetProjectRoot, async () => {
        const workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders) {
            return workspaceFolders[0].uri.fsPath;
        }
        return "";
    });

    messenger.onRequest(AskProjectDirPath, async () => {
        const selectedDir = await askProjectClonePath();
        if (!selectedDir || selectedDir.length === 0) {
            window.showErrorMessage('A folder must be selected to start cloning');
            return;
        } else {
            const parentDir = selectedDir[0].fsPath;
            return parentDir;
        }
    });

    messenger.onRequest(CreateAPI, async (params: CreateAPIParams): Promise<string> => {
        const { directory, name, context, swaggerDef, type, version } = params;
        let versionAttributes = '';
        let swaggerAttributes = '';
        if (version && type !== 'none') {
            versionAttributes = ` version="${version}" version-type="${type}"`;
        }

        if (swaggerDef) {
            swaggerAttributes = ` publishSwagger="${swaggerDef}"`;
        }

        const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
    <api context="${context}" name="${name}" ${swaggerAttributes}${versionAttributes} xmlns="http://ws.apache.org/ns/synapse">
        <resource methods="GET">
            <inSequence>
            </inSequence>
            <outSequence>
            </outSequence>
            <faultSequence>
            </faultSequence>
        </resource>
    </api>`;

        const filePath = path.join(directory, `${name}.xml`);
        fs.writeFileSync(filePath, xmlData);
        return filePath;
    });

    messenger.onRequest(CreateEndpoint, async (params: CreateEndpointParams): Promise<string> => {
        const { directory, name, address, configuration, method, type, uriTemplate } = params;
        const endpointType = type.split(" ")[0].toLowerCase();

        let endpointAttributes = `${endpointType}`;
        let otherAttributes = '';
        let closingAttributes = `</${endpointType}>`;
        if (endpointType === 'http') {
            endpointAttributes = `${endpointAttributes} method="${method.toLowerCase()}" uri-template="${uriTemplate}"`;
        } else if (endpointType === 'address') {
            endpointAttributes = `${endpointAttributes} uri="${address}"`;
        } else if (endpointType === 'fail') {
            endpointAttributes = `failover`;
            otherAttributes = `<endpoint name="endpoint_urn_uuid">
            <address uri="http://localhost">`;
            closingAttributes = `       </address>
        </endpoint>
    </failover>`;
        } else if (endpointType === 'load') {
            endpointAttributes = `loadbalance algorithm="org.apache.synapse.endpoints.algorithms.RoundRobin"`;
            otherAttributes = `<endpoint name="endpoint_urn_uuid">
            <address uri="http://localhost">`;
            closingAttributes = `       </address>
        </endpoint>
    </loadbalance>`;
        } else if (endpointType === 'recipient') {
            endpointAttributes = `recipientlist`;
            otherAttributes = `<endpoint>
            <default>`;
            closingAttributes = `       </default>
        </endpoint>
    </recipientlist>`;
        }

        const xmlData =  `<?xml version="1.0" encoding="UTF-8"?>
<endpoint name="${name}" xmlns="http://ws.apache.org/ns/synapse">
    <${endpointAttributes}>
        ${otherAttributes}
        <suspendOnFailure>
            <initialDuration>-1</initialDuration>
            <progressionFactor>1.0</progressionFactor>
        </suspendOnFailure>
        <markForSuspension>
            <retriesBeforeSuspension>0</retriesBeforeSuspension>
        </markForSuspension>
    ${closingAttributes}
</endpoint>`;

        const filePath = path.join(directory, `${name}.xml`);
        fs.writeFileSync(filePath, xmlData);
        return filePath;
    });

    messenger.onRequest(CreateSequence, async (params: CreateSequenceParams): Promise<string> => {
        const { directory, name, endpoint, onErrorSequence } = params;

        let endpointAttributes = ``;
        let errorSequence = ``;
        if (endpoint) {
            endpointAttributes = `<send>
            <endpoint key="${endpoint.replace(".xml", "")}"/>
        </send>`;
        }

        if (onErrorSequence) {
            errorSequence = `onError="${onErrorSequence}"`;
        }

        const xmlData =  `<?xml version="1.0" encoding="UTF-8"?>
<sequence name="${name}" ${errorSequence} trace="disable" xmlns="http://ws.apache.org/ns/synapse">
    ${endpointAttributes}
</sequence>`;

        const filePath = path.join(directory, `${name}.xml`);
        fs.writeFileSync(filePath, xmlData);
        return filePath;
    });

    messenger.onRequest(GetAPIDirectory, async (): Promise<string> => {
        let result = '';
        const findSynapseAPIPath = (startPath: string) => {
            const files = fs.readdirSync(startPath);
            for (let i = 0; i < files.length; i++) {
                const filename = path.join(startPath, files[i]);
                const stat = fs.lstatSync(filename);
                if (stat.isDirectory()) {
                    if (filename.includes('synapse-config/api')) {
                        result = filename;
                        return result;
                    } else {
                        result = findSynapseAPIPath(filename);
                    }
                }
            }
            return result;
        };

        const workspaceFolder = workspace.workspaceFolders;
        if (workspaceFolder) {
            const workspaceFolderPath = workspaceFolder[0].uri.fsPath;
            const synapseAPIPath = findSynapseAPIPath(workspaceFolderPath);
            return synapseAPIPath;
        }
        return "";
    });

    messenger.onRequest(GetEndpointDirectory, async (): Promise<string> => {
        let result = '';
        const findSynapseEndpointPath = (startPath: string) => {
            const files = fs.readdirSync(startPath);
            for(let i = 0; i < files.length; i++){
                const filename = path.join(startPath, files[i]);
                const stat = fs.lstatSync(filename);
                if (stat.isDirectory()){
                    if(filename.includes('synapse-config/endpoints')) {
                        result = filename;
                        return result;
                    } else {
                        result = findSynapseEndpointPath(filename);
                    }
                }
            }
            return result;
        };
        
        const workspaceFolder = workspace.workspaceFolders;
        if (workspaceFolder) {
            const workspaceFolderPath = workspaceFolder[0].uri.fsPath;
            const synapseEndpointPath = findSynapseEndpointPath(workspaceFolderPath);
            return synapseEndpointPath;
        }
        return "";
    });

    messenger.onRequest(GetSequenceDirectory, async (): Promise<string> => {
        let result = '';
        const findSynapseSequencePath = (startPath: string) => {
            const files = fs.readdirSync(startPath);
            for(let i = 0; i < files.length; i++){
                const filename = path.join(startPath, files[i]);
                const stat = fs.lstatSync(filename);
                if (stat.isDirectory()){
                    if(filename.includes('synapse-config/sequences')) {
                        result = filename;
                        return result;
                    } else {
                        result = findSynapseSequencePath(filename);
                    }
                }
            }
            return result;
        };
        
        const workspaceFolder = workspace.workspaceFolders;
        if (workspaceFolder) {
            const workspaceFolderPath = workspaceFolder[0].uri.fsPath;
            const synapseSequencePath = findSynapseSequencePath(workspaceFolderPath);
            return synapseSequencePath;
        }
        return "";
    });

    messenger.onRequest(GetEndpointsAndSequences, async () => {
        const rootPath = workspace.workspaceFolders && workspace.workspaceFolders.length > 0 ?
		workspace.workspaceFolders[0].uri.fsPath
		: undefined;

        if (!!rootPath) {
            const resp = await (await MILanguageClient.getInstance(context)).languageClient!.getProjectStructure(rootPath);
            const endpoints = (resp.directoryMap.esbConfigs.endpoints).map(endpoint => endpoint.name);
            const sequences = (resp.directoryMap.esbConfigs.sequences).map(sequence => sequence.name);
            return [endpoints, sequences]
        }

        return [];
    });

    messenger.onNotification(CloseWebViewNotification, () => {
        if ("dispose" in view) {
            view.dispose();
        }
    });

    messenger.onNotification(OpenDiagram, async (filePath) => {
        const document = await workspace.openTextDocument(filePath);
        await window.showTextDocument(document);
        commands.executeCommand('integrationStudio.showDiagram');
    });

    messenger.onNotification(OpenFile, async (filePath) => {
        const document = await workspace.openTextDocument(filePath);
        await window.showTextDocument(document);
    });
}

export async function askProjectClonePath() {
    return await window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: Uri.file(os.homedir()),
        title: "Select a folder to create the Project"
    });
}

export class RegisterWebViewPanelRpc {
    private _messenger = new Messenger();
    private _panel: WebviewPanel | undefined;

    constructor(private context: ExtensionContext, panel: WebviewPanel) {
        this.registerPanel(panel);
        registerWebviewRPCHandlers(this._messenger, panel, context);
    }

    public get panel(): WebviewPanel | undefined {
        return this._panel;
    }

    public registerPanel(view: WebviewPanel) {
        if (!this._panel) {
            this._messenger.registerWebviewPanel(view, { broadcastMethods: [] });
            this._panel = view;
        } else {
            throw new Error("Panel already registered");
        }
    }

    public getMessenger() {
        return this._messenger;
    }
}

export class RegisterWebViewViewRPC {
    private _messenger = new Messenger();
    private _view: WebviewView | undefined;

    constructor(private context: ExtensionContext, view: WebviewView,) {
        this.registerView(view);
        registerWebviewRPCHandlers(this._messenger, view, context);
    }

    public get view(): WebviewView | undefined {
        return this._view;
    }

    public registerView(view: WebviewView) {
        if (!this._view) {
            this._messenger.registerWebviewView(view, { broadcastMethods: [] });
            this._view = view;
        } else {
            throw new Error("View already registered");
        }
    }
}
