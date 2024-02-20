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
import { VisualizerLocation, activityReady, getVisualizerLocation, stateChanged, webviewReady } from '@wso2-enterprise/eggplant-core';
import { registerLangServerRpcHandlers } from './rpc-managers/lang-server/rpc-handler';
import { registerServiceDesignerRpcHandlers } from './rpc-managers/service-designer/rpc-handler';
import { registerLibraryBrowserRpcHandlers } from './rpc-managers/library-browser/rpc-handler';
import { registerCommonRpcHandlers } from './rpc-managers/common/rpc-handler';
import { registerVisualizerRpcHandlers } from './rpc-managers/visualizer/rpc-handler';
import { registerEggplantDiagramRpcHandlers } from './rpc-managers/eggplant-diagram/rpc-handler';
import { ActivityPanel } from './activity-panel/webview';
import { VisualizerWebview } from './visualizer/webview';

export class RPCLayer {
    static _messenger: Messenger = new Messenger();;

    constructor(webViewPanel: WebviewPanel | WebviewView) {
        if (isWebviewPanel(webViewPanel)) {
            RPCLayer._messenger.registerWebviewPanel(webViewPanel as WebviewPanel);
            StateMachine.service().onTransition((state) => {
                RPCLayer._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: VisualizerWebview.viewType }, state.value);
                RPCLayer._messenger.onNotification(webviewReady, () => {
                    RPCLayer._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: VisualizerWebview.viewType }, state.value);
                });
            });
        } else {
            RPCLayer._messenger.registerWebviewView(webViewPanel as WebviewView);
            StateMachine.service().onTransition((state) => {
                RPCLayer._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: ActivityPanel.viewType }, state.value);
                RPCLayer._messenger.onNotification(activityReady, () => {
                    RPCLayer._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: ActivityPanel.viewType }, state.value);
                });
            });

            RPCLayer._messenger.onRequest(getVisualizerLocation, () => getContext());
            registerVisualizerRpcHandlers(RPCLayer._messenger);
            registerLangServerRpcHandlers(RPCLayer._messenger);
            registerEggplantDiagramRpcHandlers(RPCLayer._messenger);
            registerLibraryBrowserRpcHandlers(RPCLayer._messenger);
            registerServiceDesignerRpcHandlers(RPCLayer._messenger);
            registerCommonRpcHandlers(RPCLayer._messenger);
        }


    }

    static create(webViewPanel: WebviewPanel | WebviewView) {
        return new RPCLayer(webViewPanel);
    }
}

async function getContext(): Promise<VisualizerLocation> {
    const context = StateMachine.context();
    return new Promise((resolve) => {
        resolve({ documentUri: context.documentUri, view: context.view, identifier: context.identifier, position: context.position });
    });
}

function isWebviewPanel(webview: WebviewPanel | WebviewView): boolean {
    const title = webview.title;
    return title === VisualizerWebview.panelTitle;
}
