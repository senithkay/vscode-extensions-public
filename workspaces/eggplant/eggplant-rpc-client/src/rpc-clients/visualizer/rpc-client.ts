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
    VisualizerAPI,
    VisualizerLocation,
    executeCommand,
    goBack,
    openView,
    sendMachineEvent
} from "@wso2-enterprise/eggplant-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class VisualizerRpcClient implements VisualizerAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    openView(params: VisualizerLocation): void {
        return this._messenger.sendNotification(openView, HOST_EXTENSION, params);
    }

    goBack(): void {
        return this._messenger.sendNotification(goBack, HOST_EXTENSION);
    }

    sendMachineEvent(params: MachineEvent): void {
        return this._messenger.sendNotification(sendMachineEvent, HOST_EXTENSION, params);
    }

    executeCommand(params: CommandProps): void {
        return this._messenger.sendNotification(executeCommand, HOST_EXTENSION, params);
    }
}
