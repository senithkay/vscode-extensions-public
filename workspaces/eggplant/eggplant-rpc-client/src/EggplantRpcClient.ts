 
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Messenger } from "vscode-messenger-webview";
import { WebviewRpcClient } from "./rpc-clients/webview/rpc-client";
import { MachineStateValue, stateChanged } from "@wso2-enterprise/eggplant-core";
import { CommonRpcClient, LangServerRpcClient, LibraryBrowserRpcClient, ServiceDesignerRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { vscode } from "@wso2-enterprise/ballerina-core";

export class EggplantRpcClient {

    private messenger: Messenger;
    private _overview: WebviewRpcClient;
    private _langServer: LangServerRpcClient;
    private _libraryBrowser: LibraryBrowserRpcClient;
    private _serviceDesigner: ServiceDesignerRpcClient;
    private _common: CommonRpcClient;

    constructor() {
        this.messenger = new Messenger(vscode);
        this.messenger.start();
        this._overview = new WebviewRpcClient(this.messenger);
        this._langServer = new LangServerRpcClient(this.messenger);
        this._libraryBrowser = new LibraryBrowserRpcClient(this.messenger);
        this._serviceDesigner = new ServiceDesignerRpcClient(this.messenger);
        this._common = new CommonRpcClient(this.messenger);
    }

    getWebviewRpcClient(): WebviewRpcClient {
        return this._overview;
    }

    getLangServerRpcClient(): LangServerRpcClient {
        return this._langServer;
    }

    getLibraryBrowserRpcClient(): LibraryBrowserRpcClient {
        return this._libraryBrowser;
    }

    getServiceDesignerRpcClient(): ServiceDesignerRpcClient {
        return this._serviceDesigner;
    }

    getCommonRpcClient(): CommonRpcClient {
        return this._common;
    }

    onStateChanged(callback: (state: MachineStateValue) => void) {
        this.messenger.onNotification(stateChanged, callback);
    }

}
