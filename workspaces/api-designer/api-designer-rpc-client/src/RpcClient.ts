/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Messenger } from "vscode-messenger-webview";
import { MachineStateValue, stateChanged, vscode, getVisualizerState, VisualizerLocation, webviewReady, onFileContentUpdate, PopupMachineStateValue, popupStateChanged, PopupVisualizerLocation, getPopupVisualizerState, onParentPopupSubmitted, ParentPopupData  } from "@wso2-enterprise/api-designer-core";
import { HOST_EXTENSION } from "vscode-messenger-common";

export class RpcClient {

    private messenger: Messenger;
    // private _visualizer: MiVisualizerRpcClient;

    constructor() {
        this.messenger = new Messenger(vscode);
        this.messenger.start();
        // this._visualizer = new MiVisualizerRpcClient(this.messenger);
    }

    // getMiVisualizerRpcClient(): MiVisualizerRpcClient {
    //     return this._visualizer;
    // }

    onStateChanged(callback: (state: MachineStateValue) => void) {
        this.messenger.onNotification(stateChanged, callback);
    }

    onPopupStateChanged(callback: (state: PopupMachineStateValue) => void) {
        this.messenger.onNotification(popupStateChanged, callback);
    }

    getVisualizerState(): Promise<VisualizerLocation> {
        return this.messenger.sendRequest(getVisualizerState, HOST_EXTENSION);
    }

    getPopupVisualizerState(): Promise<PopupVisualizerLocation> {
        return this.messenger.sendRequest(getPopupVisualizerState, HOST_EXTENSION);
    }

    onFileContentUpdate(callback: () => void): void {
        this.messenger.onNotification(onFileContentUpdate, callback);
    }
    
    webviewReady(): void {
        this.messenger.sendNotification(webviewReady, HOST_EXTENSION);
    }

    onParentPopupSubmitted(callback: (parent: ParentPopupData) => void) {
        this.messenger.onNotification(onParentPopupSubmitted, callback);
    }
}

