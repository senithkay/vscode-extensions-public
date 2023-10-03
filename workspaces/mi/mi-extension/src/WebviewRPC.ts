/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { commands, WebviewPanel, window, WebviewView, workspace, Range, WorkspaceEdit, Position, Uri } from "vscode";
import { Messenger } from "vscode-messenger";
import {
    ApplyEdit,
    ApplyEditParams,
    ExecuteCommandRequest,
    GetSyntaxTreeRequest,
    ShowErrorMessage,
} from "@wso2-enterprise/mi-core";
import { MILanguageClient } from "./lang-client/activator";

// Register handlers
export function registerWebviewRPCHandlers(messenger: Messenger, view: WebviewPanel | WebviewView) {
    messenger.onRequest(ExecuteCommandRequest, async (args: string[]) => {
        if (args.length >= 1) {
            const cmdArgs = args.length > 1 ? args.slice(1) : [];
            const result = await commands.executeCommand(args[0], ...cmdArgs);
            return result;
        }
    });

    messenger.onRequest(GetSyntaxTreeRequest, async (documentUri: string) => {
        return (await MILanguageClient.getInstance()).languageClient!.getSyntaxTree({
            documentIdentifier: {
                uri: documentUri,
            },
        });
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

        const positionAt = document.positionAt(params.offset);
        const position = new Position(positionAt.line, positionAt.character);
        edit.insert(Uri.parse(params.documentUri), position, params.text);
        await workspace.applyEdit(edit);
    });
}

export class RegisterWebViewPanelRpc {
    private _messenger = new Messenger();
    private _panel: WebviewPanel | undefined;

    constructor(view: WebviewPanel) {
        this.registerPanel(view);
        registerWebviewRPCHandlers(this._messenger, view);
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

    constructor(view: WebviewView) {
        this.registerView(view);
        registerWebviewRPCHandlers(this._messenger, view);
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
