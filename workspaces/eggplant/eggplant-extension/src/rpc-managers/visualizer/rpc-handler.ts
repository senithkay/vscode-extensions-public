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
    CommandProps,
    MachineEvent,
    VisualizerLocation,
    executeCommand,
    goBack,
    openView,
    sendMachineEvent
} from "@wso2-enterprise/eggplant-core";
import { Messenger } from "vscode-messenger";
import { VisualizerRpcManager } from "./rpc-manager";

export function registerVisualizerRpcHandlers(messenger: Messenger) {
    const rpcManger = new VisualizerRpcManager();
    messenger.onNotification(openView, (args: VisualizerLocation) => rpcManger.openView(args));
    messenger.onNotification(goBack, () => rpcManger.goBack());
    messenger.onNotification(sendMachineEvent, (args: MachineEvent) => rpcManger.sendMachineEvent(args));
    messenger.onNotification(executeCommand, (args: CommandProps) => rpcManger.executeCommand(args));
}
