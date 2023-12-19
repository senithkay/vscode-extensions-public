 
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Messenger } from "vscode-messenger-webview";
import { vscode } from "./vscode";
import { WebviewRpcClient } from "./rpc-clients/webview/rpc-client";
import { MachineStateValue, stateChanged } from "@wso2-enterprise/eggplant-core";

export class EggplantRpcClient {

    private messenger: Messenger;
    private _overview: WebviewRpcClient;

    constructor() {
        this.messenger = new Messenger(vscode);
        this.messenger.start();
        this._overview = new WebviewRpcClient(this.messenger)
    }

    getWebviewRpcClient(): WebviewRpcClient {
        return this._overview;
    }

    onStateChanged(callback: (state: MachineStateValue) => void) {
        this.messenger.onNotification(stateChanged, callback);
    }

}
