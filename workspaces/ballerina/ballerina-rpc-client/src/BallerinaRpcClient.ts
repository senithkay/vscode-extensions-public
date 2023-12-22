/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Messenger } from "vscode-messenger-webview";
import { VisualizerRpcClient } from "./rpc-clients/visualizer/rpc-client";
import { vscode } from "@wso2-enterprise/ballerina-core";
import { LangServerRpcClient } from "./rpc-clients/lang-server/rpc-client";

export class BallerinaRpcClient {

    private messenger: Messenger;
    private _visualizer: VisualizerRpcClient;
    private _langServer: LangServerRpcClient;

    constructor() {
        this.messenger = new Messenger(vscode);
        this.messenger.start();
        this._visualizer = new VisualizerRpcClient(this.messenger);
        this._langServer = new LangServerRpcClient(this.messenger);
    }

    getVisualizerRpcClient(): VisualizerRpcClient {
        return this._visualizer;
    }

    getLangServerRpcClient(): LangServerRpcClient {
        return this._langServer;
    }

    onStateChanged(callback: (state: any) => void) {
        this.messenger.onNotification({ method: 'stateChanged' }, callback);
    }

}
