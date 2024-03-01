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
import { registerMiDiagramRpcHandlers } from './rpc-managers/mi-diagram/rpc-handler';
import { VisualizerWebview } from './visualizer/webview';
import { registerMiVisualizerRpcHandlers } from './rpc-managers/mi-visualizer/rpc-handler';

export class RPCLayer {
    static _messenger: Messenger;

    constructor(webViewPanel: WebviewPanel | WebviewView) {
        RPCLayer._messenger = new Messenger();
        if (isWebviewPanel(webViewPanel)) {
            RPCLayer._messenger.registerWebviewPanel(webViewPanel as WebviewPanel);
            StateMachine.service().onTransition((state) => {
                RPCLayer._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: VisualizerWebview.viewType }, state.value);
            });

            RPCLayer._messenger.onRequest(getVisualizerState, () => getContext());
            registerMiDiagramRpcHandlers(RPCLayer._messenger);
            registerMiVisualizerRpcHandlers(RPCLayer._messenger);
        } else {
            // NOTE: This section is used to handle the RPC registering for the activityPanel webviews.
            // RPCLayer._messenger.registerWebviewView(webViewPanel as WebviewView);
            // StateMachine.service().onTransition((state) => {
            //     RPCLayer._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: 'activity.panel' }, state.value);
            // });
        }
    }

    static create(webViewPanel: WebviewPanel | WebviewView) {
        return new RPCLayer(webViewPanel);
    }

}

async function getContext(): Promise<VisualizerLocation> {
    const context = StateMachine.context();
    return new Promise((resolve) => {
        resolve({ documentUri: context.documentUri, view: context.view, identifier: context.identifier, projectUri: context.projectUri, projectOpened: context.projectOpened });
    });
}

function isWebviewPanel(webview: WebviewPanel | WebviewView): boolean {
    const title = webview.title;
    const panelTitle = 'Micro Integrator';
    return title === panelTitle;
}