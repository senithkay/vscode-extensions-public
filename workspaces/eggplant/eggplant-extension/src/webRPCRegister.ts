/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { WebviewView, WebviewPanel } from 'vscode';
import { Messenger } from 'vscode-messenger';
import { registerWebviewRpcHandlers } from './rpc-managers/webview/rpc-handler';
import { StateMachine } from './stateMachine';
import { NotificationType } from "vscode-messenger-common";

const stateChanged: NotificationType<any> = { method: 'stateChanged' };

export class RPCLayer {
    private _messenger: Messenger = new Messenger();

    constructor(webViewPanel: WebviewPanel | WebviewView) {
        if (isWebviewPanel(webViewPanel)) {
            this._messenger.registerWebviewPanel(webViewPanel as WebviewPanel);
        } else {
            this._messenger.registerWebviewView(webViewPanel as WebviewView);
        }

        // Register state change notification
        StateMachine.getService().onTransition((state) => {
            this._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: 'lowcode' }, stateString(state.value));
        });

        registerWebviewRpcHandlers(this._messenger);
    }

    static create(webViewPanel: WebviewPanel | WebviewView) {
        return new RPCLayer(webViewPanel);
    }
}

function isWebviewPanel(webview: WebviewPanel | WebviewView): boolean {
    const title = webview.title;
    const panelTitle = 'Low Code Editor';
    return title === panelTitle;
}

// If the state is an object we flaten it to a string
function stateString(state: any): string {
    if (typeof state === 'string') {
        return state;
    } else if (typeof state === 'object') {
        const stateString = Object.entries(state).map(([key, value]) => `${key}.${value}`).at(0);
        if (stateString === undefined) {
            throw Error("Undefined state");
        } else {
            return stateString;
        }
    } else {
        throw Error("Undefined state");
    }
}