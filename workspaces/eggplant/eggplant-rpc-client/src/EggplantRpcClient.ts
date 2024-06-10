
// /**
//  * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
//  *
//  * This software is the property of WSO2 LLC. and its suppliers, if any.
//  * Dissemination of any information or reproduction of any material contained
//  * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
//  * You may not alter or remove any copyright or other notice from copies of this content.
//  */

// import { Messenger } from "vscode-messenger-webview";
// import {
//     MachineStateValue,
//     VisualizerLocation,
//     getVisualizerLocation,
//     onFileContentUpdate,
//     stateChanged,
//     webviewReady,
//     activityReady
// } from "@wso2-enterprise/eggplant-core";
// import { HOST_EXTENSION } from "vscode-messenger-common";
// import { VisualizerRpcClient } from "./rpc-clients/visualizer/rpc-client";

// export class EggplantRpcClient {

//     private messenger: Messenger;
//     private _visualizer: VisualizerRpcClient;
//     constructor() {
//         // this.messenger = new Messenger(vscode);
//         // this.messenger.start();
//         this._visualizer = new VisualizerRpcClient(this.messenger);
//     }

//     getVisualizerRpcClient(): VisualizerRpcClient {
//         return this._visualizer;
//     }

//     getLangServerRpcClient(): LangServerRpcClient {
//         return this._langServer;
//     }

//     getLibraryBrowserRpcClient(): LibraryBrowserRpcClient {
//         return this._libraryBrowser;
//     }

//     getServiceDesignerRpcClient(): ServiceDesignerRpcClient {
//         return this._serviceDesigner;
//     }

//     getCommonRpcClient(): CommonRpcClient {
//         return this._common;
//     }

//     getVisualizerLocation(): Promise<VisualizerLocation> {
//         return this.messenger.sendRequest(getVisualizerLocation, HOST_EXTENSION);
//     }

//     onStateChanged(callback: (state: MachineStateValue) => void) {
//         this.messenger.onNotification(stateChanged, callback);
//     }

//     onFileContentUpdate(callback: () => void): void {
//         this.messenger.onNotification(onFileContentUpdate, callback);
//     }

//     webviewReady(): void {
//         this.messenger.sendNotification(webviewReady, HOST_EXTENSION);
//     }

//     activityReady(): void {
//         this.messenger.sendNotification(activityReady, HOST_EXTENSION);
//     }

// }
