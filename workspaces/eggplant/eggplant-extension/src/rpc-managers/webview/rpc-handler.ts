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
    VisualizerLocation,
    executeCommand,
    getBallerinaProjectComponents,
    getEggplantModel,
    getSTNodeFromLocation,
    getState,
    getVisualizerState,
    openVisualizerView
} from "@wso2-enterprise/eggplant-core";
import { Messenger } from "vscode-messenger";
import { WebviewRpcManager } from "./rpc-manager";

export function registerWebviewRpcHandlers(messenger: Messenger) {
    const rpcManger = new WebviewRpcManager();
    messenger.onRequest(getState, () => rpcManger.getState());
    messenger.onRequest(getVisualizerState, () => rpcManger.getVisualizerState());
    messenger.onNotification(openVisualizerView, (args: VisualizerLocation) => rpcManger.openVisualizerView(args));
    messenger.onRequest(getBallerinaProjectComponents, () => rpcManger.getBallerinaProjectComponents());
    messenger.onRequest(getEggplantModel, () => rpcManger.getEggplantModel());
    messenger.onNotification(executeCommand, (args: string) => rpcManger.executeCommand(args));
    messenger.onRequest(getSTNodeFromLocation, (args: VisualizerLocation) => rpcManger.getSTNodeFromLocation(args));
}
