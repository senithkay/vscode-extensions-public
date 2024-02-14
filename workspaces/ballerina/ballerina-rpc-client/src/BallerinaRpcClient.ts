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
import { MachineStateValue, VisualizerLocation, getVisualizerLocation, onFileContentUpdate, stateChanged, vscode, webviewReady } from "@wso2-enterprise/ballerina-core";
import { LangServerRpcClient } from "./rpc-clients/lang-server/rpc-client";
import { LibraryBrowserRpcClient } from "./rpc-clients/library-browser/rpc-client";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { GraphqlDesignerRpcClient, PersistDiagramRpcClient, ServiceDesignerRpcClient } from "./rpc-clients";

export class BallerinaRpcClient {

    private messenger: Messenger;
    private _visualizer: VisualizerRpcClient;
    private _langServer: LangServerRpcClient;
    private _libraryBrowser: LibraryBrowserRpcClient;
    private _serviceDesigner: ServiceDesignerRpcClient;
    private _persistDiagram: PersistDiagramRpcClient;
    private _GraphqlDesigner: GraphqlDesignerRpcClient;

    constructor() {
        this.messenger = new Messenger(vscode);
        this.messenger.start();
        this._visualizer = new VisualizerRpcClient(this.messenger);
        this._langServer = new LangServerRpcClient(this.messenger);
        this._libraryBrowser = new LibraryBrowserRpcClient(this.messenger);
        this._serviceDesigner = new ServiceDesignerRpcClient(this.messenger);
        this._persistDiagram = new PersistDiagramRpcClient(this.messenger);
        this._GraphqlDesigner = new GraphqlDesignerRpcClient(this.messenger);
    }

    getVisualizerRpcClient(): VisualizerRpcClient {
        return this._visualizer;
    }

    getServiceDesignerRpcClient(): ServiceDesignerRpcClient {
        return this._serviceDesigner;
    }

    getPersistDiagramRpcClient(): PersistDiagramRpcClient {
        return this._persistDiagram;
    }

    getGraphqlDesignerRpcClient(): GraphqlDesignerRpcClient {
        return this._GraphqlDesigner;
    }

    getLangServerRpcClient(): LangServerRpcClient {
        return this._langServer;
    }

    getLibraryBrowserRPCClient(): LibraryBrowserRpcClient {
        return this._libraryBrowser;
    }

    getVisualizerLocation(): Promise<VisualizerLocation> {
        return this.messenger.sendRequest(getVisualizerLocation, HOST_EXTENSION);
    }

    onStateChanged(callback: (state: MachineStateValue) => void) {
        this.messenger.onNotification(stateChanged, callback);
    }

    onFileContentUpdate(callback: () => void): void {
        this.messenger.onNotification(onFileContentUpdate, callback);
    }

    webviewReady(): void {
        this.messenger.sendNotification(webviewReady, HOST_EXTENSION);
    }

}
