 
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
import { LangServerRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { vscode } from "@wso2-enterprise/ballerina-core";
import { ServiceDesignerRpcClient } from "./rpc-clients/service-designer/rpc-client";

export class EggplantRpcClient {

    private messenger: Messenger;
    private _overview: WebviewRpcClient;
    private _langServer: LangServerRpcClient;
    private _serviceDesigner: ServiceDesignerRpcClient;

    constructor() {
        this.messenger = new Messenger(vscode);
        this.messenger.start();
        this._overview = new WebviewRpcClient(this.messenger);
        this._langServer = new LangServerRpcClient(this.messenger);
        this._serviceDesigner = new ServiceDesignerRpcClient(this.messenger);
    }

    getWebviewRpcClient(): WebviewRpcClient {
        return this._overview;
    }

    getLangServerRpcClient(): LangServerRpcClient {
        return this._langServer;
    }

    getServiceDesignerRpcClient(): ServiceDesignerRpcClient {
        return this._serviceDesigner;
    }

    onStateChanged(callback: (state: MachineStateValue) => void) {
        this.messenger.onNotification(stateChanged, callback);
    }

}
