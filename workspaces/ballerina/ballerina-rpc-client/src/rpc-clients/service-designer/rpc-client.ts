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
    ExportOASRequest,
    ExportOASResponse,
    RecordSTRequest,
    RecordSTResponse,
    ServiceDesignerAPI,
    exportOASFile,
    getRecordST
} from "@wso2-enterprise/ballerina-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class ServiceDesignerRpcClient implements ServiceDesignerAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getRecordST(params: RecordSTRequest): Promise<RecordSTResponse> {
        return this._messenger.sendRequest(getRecordST, HOST_EXTENSION, params);
    }

    exportOASFile(params: ExportOASRequest): Promise<ExportOASResponse> {
        return this._messenger.sendRequest(exportOASFile, HOST_EXTENSION, params);
    }
}
