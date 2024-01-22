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
import { StateMachine } from './stateMachine';
import { stateChanged, getVisualizerState, VisualizerLocation } from '@wso2-enterprise/mi-core';
import { State } from 'xstate';
import { registerMiDiagramRpcHandlers } from './rpc-managers/mi-diagram/rpc-handler';

export class RPCLayer {
    private _messenger: Messenger = new Messenger();

    constructor(webViewPanel: WebviewPanel | WebviewView) {
        if (isWebviewPanel(webViewPanel)) {
            this._messenger.registerWebviewPanel(webViewPanel as WebviewPanel);
        } else {
            this._messenger.registerWebviewView(webViewPanel as WebviewView);
        }

        // Register state change notification
        StateMachine.service().onTransition((state) => {
            this._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: 'visualizer' }, state.value);
            // this._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: 'activity.panel' }, state.value);
        });

        this._messenger.onRequest(getVisualizerState, () => this.getContext());

        registerMiDiagramRpcHandlers(this._messenger);

    }

    static create(webViewPanel: WebviewPanel | WebviewView) {
        return new RPCLayer(webViewPanel);
    }

    async getContext(): Promise<VisualizerLocation> {
        const context = StateMachine.context();
        return new Promise((resolve) => {
            resolve({ documentUri: context.documentUri });
        });
    }
}



function isWebviewPanel(webview: WebviewPanel | WebviewView): boolean {
    const title = webview.title;
    const panelTitle = 'Integration Studio';
    return title === panelTitle;
}