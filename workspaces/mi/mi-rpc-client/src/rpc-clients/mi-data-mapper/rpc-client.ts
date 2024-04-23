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
    IOTypeRequest,
    IOTypeResponse,
    MIDataMapperAPI,
    UpdateFileContentRequest,
    getIOTypes,
    updateFileContent,
    GenerateDMInputRequest,
    GenerateDMInputResponse,
    BrowseSchemaRequest,
    BrowseSchemaResponse,
    browseSchema,
    LoadDMConfigsRequest,
    LoadDMConfigsResponse,
    loadDMConfigs,
    ConvertRegPathToAbsPathRequest,
    ConvertRegPathToAbsPathResponse,
    convertRegPathToAbsPath,
    ImportDMSchemaRequest,
    ImportDMSchemaResponse,
    importDMSchema,
    UpdateDMCRequest,
    UpdateDMCResponse,
    updateDMC,
    createDMFiles
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

    updateFileContent(params: UpdateFileContentRequest): void {
        return this._messenger.sendNotification(updateFileContent, HOST_EXTENSION, params);
    }

    browseSchema(params: BrowseSchemaRequest): Promise<BrowseSchemaResponse> {
        return this._messenger.sendRequest(browseSchema, HOST_EXTENSION, params);
    }

    loadDMConfigs(params: LoadDMConfigsRequest): Promise<LoadDMConfigsResponse> {
        return this._messenger.sendRequest(loadDMConfigs, HOST_EXTENSION, params);
    }

    convertRegPathToAbsPath(params: ConvertRegPathToAbsPathRequest): Promise<ConvertRegPathToAbsPathResponse> {
        return this._messenger.sendRequest(convertRegPathToAbsPath, HOST_EXTENSION, params);
    }

    importDMSchema(params: ImportDMSchemaRequest): Promise<ImportDMSchemaResponse> {
        return this._messenger.sendRequest(importDMSchema, HOST_EXTENSION, params);
    }

    updateDMC(params: UpdateDMCRequest): Promise<UpdateDMCResponse> {
        return this._messenger.sendRequest(updateDMC, HOST_EXTENSION, params);
    }

    createDMFiles(params: GenerateDMInputRequest): Promise<GenerateDMInputResponse> {
        return this._messenger.sendRequest(createDMFiles, HOST_EXTENSION, params);
    }
}
