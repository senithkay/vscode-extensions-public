/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    BallerinaProjectComponents,
    EggplantModel,
    VisualizerLocation,
    WebviewAPI,
    executeCommand,
    getBallerinaProjectComponents,
    getEggplantModel,
    getSTNodeFromLocation,
    getState,
    getVisualizerState,
    openVisualizerView
} from "@wso2-enterprise/eggplant-core";
import { STNode } from "@wso2-enterprise/syntax-tree";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class WebviewRpcClient implements WebviewAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getState(): Promise<string> {
        return this._messenger.sendRequest(getState, HOST_EXTENSION);
    }

    getVisualizerState(): Promise<VisualizerLocation> {
        return this._messenger.sendRequest(getVisualizerState, HOST_EXTENSION);
    }

    openVisualizerView(params: VisualizerLocation): void {
        return this._messenger.sendNotification(openVisualizerView, HOST_EXTENSION, params);
    }

    getBallerinaProjectComponents(): Promise<BallerinaProjectComponents> {
        return this._messenger.sendRequest(getBallerinaProjectComponents, HOST_EXTENSION);
    }

    getEggplantModel(): Promise<EggplantModel> {
        return this._messenger.sendRequest(getEggplantModel, HOST_EXTENSION);
    }

    executeCommand(params: string): void {
        return this._messenger.sendNotification(executeCommand, HOST_EXTENSION, params);
    }

    getSTNodeFromLocation(params: VisualizerLocation): Promise<STNode> {
        return this._messenger.sendRequest(getSTNodeFromLocation, HOST_EXTENSION, params);
    }
}
