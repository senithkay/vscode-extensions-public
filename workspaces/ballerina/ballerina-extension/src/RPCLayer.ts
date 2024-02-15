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
import { stateChanged, getVisualizerLocation, VisualizerLocation } from '@wso2-enterprise/ballerina-core';
import { VisualizerWebview } from './visualizer/webview';
import { registerVisualizerRpcHandlers } from './rpc-managers/visualizer/rpc-handler';
import { registerLangServerRpcHandlers } from './rpc-managers/lang-server/rpc-handler';
import { registerLibraryBrowserRpcHandlers } from './rpc-managers/library-browser/rpc-handler';
import { registerServiceDesignerRpcHandlers } from './rpc-managers/service-designer/rpc-handler';
import { registerPersistDiagramRpcHandlers } from './rpc-managers/persist-diagram/rpc-handler';
import { registerGraphqlDesignerRpcHandlers } from './rpc-managers/graphql-designer/rpc-handler';
import { registerProjectDesignDiagramRpcHandlers } from './rpc-managers/project-design-diagram/rpc-handler';

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
            // StateMachine.service().onTransition((state) => {
            //     RPCLayer._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: 'activity.panel' }, state.value);
            // });
        }

        RPCLayer._messenger.onRequest(getVisualizerLocation, () => getContext());
        registerVisualizerRpcHandlers(RPCLayer._messenger);
        registerLangServerRpcHandlers(RPCLayer._messenger);
        registerLibraryBrowserRpcHandlers(RPCLayer._messenger);
        registerServiceDesignerRpcHandlers(RPCLayer._messenger);
        registerPersistDiagramRpcHandlers(RPCLayer._messenger);
        registerGraphqlDesignerRpcHandlers(RPCLayer._messenger);
        registerProjectDesignDiagramRpcHandlers(RPCLayer._messenger);
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
