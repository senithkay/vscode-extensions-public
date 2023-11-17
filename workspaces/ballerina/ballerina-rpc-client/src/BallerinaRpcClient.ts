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
import { vscode } from "./vscode";
import { OverviewRpcClient } from "./rpc-clients/overview/rpc-client";
import { VisualizerRpcClient } from "./rpc-clients/visualizer/rpc-client";

export class BallerinaRpcClient {

    private messenger: Messenger;
    private _overview: OverviewRpcClient;
    private _visualizer: VisualizerRpcClient;

    constructor() {
        this.messenger = new Messenger(vscode);
        this.messenger.start();
        this._overview = new OverviewRpcClient(this.messenger);
        this._visualizer = new VisualizerRpcClient(this.messenger);
    }

    getOverviewClient(): OverviewRpcClient {
        return this._overview;
    }

    getVisualizerClient(): VisualizerRpcClient {
        return this._visualizer;
    }

    onStateChanged(callbal: (state: any) => void) {
        this.messenger.onNotification({ method: 'stateChanged' }, callbal);
    }

}
