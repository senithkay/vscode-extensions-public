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
import { stateChanged } from '@wso2-enterprise/eggplant-core';
import { registerLangServerRpcHandlers } from './rpc-managers/lang-server/rpc-handler';
import { registerServiceDesignerRpcHandlers } from './rpc-managers/service-designer/rpc-handler';
import { registerLibraryBrowserRpcHandlers } from './rpc-managers/library-browser/rpc-handler';
import { registerCommonRpcHandlers } from './rpc-managers/common/rpc-handler';

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
            this._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: 'lowcode' }, state.value);
            this._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: 'eggplant.activity.overview' }, state.value);
        });

        registerWebviewRpcHandlers(this._messenger);
        registerLangServerRpcHandlers(this._messenger);
        registerLibraryBrowserRpcHandlers(this._messenger);
        registerServiceDesignerRpcHandlers(this._messenger);
        registerCommonRpcHandlers(this._messenger);
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
