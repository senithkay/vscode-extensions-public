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
import { MachineStateValue, stateChanged, vscode, getVisualizerState, VisualizerLocation } from "@wso2-enterprise/mi-core";
import { MiDiagramRpcClient } from "./rpc-clients/mi-diagram/rpc-client";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { MiVisualizerRpcClient } from "./rpc-clients/mi-visualizer/rpc-client";

export class RpcClient {

    private messenger: Messenger;
    private _diagram: MiDiagramRpcClient;
    private _visualizer: MiVisualizerRpcClient;

    constructor() {
        this.messenger = new Messenger(vscode);
        this.messenger.start();
        this._diagram = new MiDiagramRpcClient(this.messenger);
        this._visualizer = new MiVisualizerRpcClient(this.messenger);
    }

    getMiDiagramRpcClient(): MiDiagramRpcClient {
        return this._diagram;
    }

    getMiVisualizerRpcClient(): MiVisualizerRpcClient {
        return this._visualizer;
    }

    onStateChanged(callback: (state: MachineStateValue) => void) {
        this.messenger.onNotification(stateChanged, callback);
    }

    getVisualizerState(): Promise<VisualizerLocation> {
        return this.messenger.sendRequest(getVisualizerState, HOST_EXTENSION);
    }

}