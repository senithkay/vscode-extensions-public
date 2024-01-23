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
import { VisualizerWebview } from './visualizer/webview';

export class RPCLayer {
    static _messenger: Messenger;

    constructor(webViewPanel: WebviewPanel | WebviewView) {
        RPCLayer._messenger = new Messenger();
        if (isWebviewPanel(webViewPanel)) {
            RPCLayer._messenger.registerWebviewPanel(webViewPanel as WebviewPanel);
            StateMachine.service().onTransition((state) => {
                RPCLayer._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: VisualizerWebview.viewType }, state.value);
            });
        } else {
            RPCLayer._messenger.registerWebviewView(webViewPanel as WebviewView);
            StateMachine.service().onTransition((state) => {
                RPCLayer._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: 'activity.panel' }, state.value);
            });
        }

        RPCLayer._messenger.onRequest(getVisualizerState, () => getContext());
        registerMiDiagramRpcHandlers(RPCLayer._messenger);
    }

    static create(webViewPanel: WebviewPanel | WebviewView) {
        return new RPCLayer(webViewPanel);
    }



}

async function getContext(): Promise<VisualizerLocation> {
    const context = StateMachine.context();
    return new Promise((resolve) => {
        resolve({ documentUri: context.documentUri });
    });
}

function isWebviewPanel(webview: WebviewPanel | WebviewView): boolean {
    const title = webview.title;
    const panelTitle = 'Integration Studio';
    return title === panelTitle;
}