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
    FileContentRequest,
    FileContentResponse,
    FunctionSTRequest,
    FunctionSTResponse,
    IOTypeRequest,
    IOTypeResponse,
    MIDataMapperAPI,
    getFileContent,
    getFunctionST,
    getIOTypes
} from "@wso2-enterprise/mi-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class MiDataMapperRpcClient implements MIDataMapperAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getIOTypes(params: IOTypeRequest): Promise<IOTypeResponse> {
        return this._messenger.sendRequest(getIOTypes, HOST_EXTENSION, params);
    }

    getFunctionST(params: FunctionSTRequest): Promise<FunctionSTResponse> {
        return this._messenger.sendRequest(getFunctionST, HOST_EXTENSION, params);
    }

    getFileContent(params: FileContentRequest): Promise<FileContentResponse> {
        return this._messenger.sendRequest(getFileContent, HOST_EXTENSION, params);
    }
}
