/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { WebviewPanel } from 'vscode';
import { Messenger } from 'vscode-messenger';
import { registerWebviewRpcHandlers } from './rpc-managers/webview/rpc-handler';

export class RPCLayer {
    private _messenger: Messenger = new Messenger();

    constructor(webViewPanel: WebviewPanel) {
        this._messenger.registerWebviewPanel(webViewPanel);
        
        registerWebviewRpcHandlers(this._messenger);
    }

    static create(webViewPanel: WebviewPanel) {
        return new RPCLayer(webViewPanel);
    }
}
