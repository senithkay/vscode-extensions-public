/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Messenger } from "vscode-messenger-webview";
import { HOST_EXTENSION } from "vscode-messenger-common";

import {
    ExecuteCommandRequest,
    GetSyntaxTreeRequest,
    ShowErrorMessage
} from "@wso2-enterprise/mi-core";

export class MIWebViewAPI {
    private readonly _messenger;
    static _instance: MIWebViewAPI;

    constructor() {
        this._messenger = new Messenger(acquireVsCodeApi());
        this._messenger.start();
    }

    public static getInstance() {
        if (!this._instance) {
            this._instance = new MIWebViewAPI();
        }
        return this._instance;
    }


    public triggerCmd(cmdId: string, ...args: any) {
        return this._messenger.sendRequest(ExecuteCommandRequest, HOST_EXTENSION, [cmdId, ...args]);
    }

    public showErrorMsg(error: string) {
        this._messenger.sendNotification(ShowErrorMessage, HOST_EXTENSION, error);
    }

    public getSyntaxTree() {
        return this._messenger.sendRequest(GetSyntaxTreeRequest, HOST_EXTENSION);
    }
    
    public getMessenger() {
        return this._messenger;
    }
}
