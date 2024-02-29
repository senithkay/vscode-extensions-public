/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    EggplantDiagramAPI,
    EggplantModelResponse,
    Flow,
    UpdateNodeRequest,
    getEggplantModel,
    updateEggplantModel,
    updateNode
} from "@wso2-enterprise/eggplant-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class EggplantDiagramRpcClient implements EggplantDiagramAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getEggplantModel(): Promise<EggplantModelResponse> {
        return this._messenger.sendRequest(getEggplantModel, HOST_EXTENSION);
    }

    updateEggplantModel(params: Flow): void {
        return this._messenger.sendNotification(updateEggplantModel, HOST_EXTENSION, params);
    }

    updateNode(params: UpdateNodeRequest): void {
        return this._messenger.sendNotification(updateNode, HOST_EXTENSION, params);
    }
}
