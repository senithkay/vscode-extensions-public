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
import { AiPanelWebview } from './ai-panel/webview';

export class RPCLayer {
    static _messenger: Messenger;

    constructor(webViewPanel: WebviewPanel | WebviewView) {
        if (isWebviewPanel(webViewPanel)) {
            RPCLayer._messenger = new Messenger();
            RPCLayer._messenger.registerWebviewPanel(webViewPanel as WebviewPanel);
            StateMachine.service().onTransition((state) => {
                RPCLayer._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: VisualizerWebview.viewType }, state.value);
            });
            RPCLayer._messenger.onRequest(getVisualizerState, () => getContext());
            registerMiDiagramRpcHandlers(RPCLayer._messenger);
            registerMiVisualizerRpcHandlers(RPCLayer._messenger);
        } else {
            RPCLayer._messenger.registerWebviewPanel(webViewPanel as WebviewPanel);
            StateMachine.service().onTransition((state) => {
                RPCLayer._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: AiPanelWebview.viewType }, state.value);
            });
        }
    }

    static create(webViewPanel: WebviewPanel | WebviewView) {
        return new RPCLayer(webViewPanel);
    }

}

async function getContext(): Promise<VisualizerLocation> {
    const context = StateMachine.context();
    return new Promise((resolve) => {
        resolve({ documentUri: context.documentUri, view: context.view, identifier: context.identifier, projectUri: context.projectUri, projectOpened: context.projectOpened, customProps: context.customProps });
    });
}

function isWebviewPanel(webview: WebviewPanel | WebviewView): boolean {
    return webview.viewType === VisualizerWebview.viewType;
}