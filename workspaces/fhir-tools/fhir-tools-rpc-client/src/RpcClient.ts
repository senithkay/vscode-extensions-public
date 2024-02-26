/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { Messenger } from "vscode-messenger-webview";
import { StateChangeEvent, stateChanged, vscode } from "@wso2-enterprise/fhir-tools-core";
import { WebviewRpcClient } from "./rpc-clients/webview/rpc-client";

export class RpcClient {

    private messenger: Messenger;
    private _converterRpcClient: WebviewRpcClient;

    constructor() {
        this.messenger = new Messenger(vscode);
        this.messenger.start();
        this._converterRpcClient = new WebviewRpcClient(this.messenger);
    }

    getWebviewRpcClient(): WebviewRpcClient {
        return this._converterRpcClient;
    }

    onStateChanged(callback: (state: StateChangeEvent) => void) {
        this.messenger.onNotification(stateChanged, callback);
    }

}
