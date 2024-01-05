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
import {
    ApplyEdit,
    ApplyEditParams,
    ExecuteCommandRequest,
    GetConnectorRequest,
    GetConnectorsRequest,
    GetConnectorsResponse,
    GetSyntaxTreeRequest,
    ShowErrorMessage,
    GetProjectStructureRequest
} from "@wso2-enterprise/mi-core";
import { MILanguageClient } from "./lang-client/activator";
import * as fs from "fs";
import path = require("path");
const { XMLParser } = require("fast-xml-parser");

const connectorsPath = "../resources/connectors";

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
        if (!fs.existsSync(path.join(__dirname, connectorsPath))) {
            return connectorNames;
        }

        const connectors = fs.readdirSync(path.join(__dirname, connectorsPath));
        connectors.forEach(connector => {
            const connectorPath = path.join(__dirname, `${connectorsPath}/${connector}`);
            const connectorInfoFile = path.join(connectorPath, `connector.xml`);
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
                const connectorIcon = connectorInfo["connector"]["icon"];
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
