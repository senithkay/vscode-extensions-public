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
    getIOTypes,
    updateFileContent,
    UpdateFileContentRequest,
    GenerateDMInputRequest,
    browseSchema,
    BrowseSchemaRequest,
    LoadDMConfigsRequest,
    loadDMConfigs,
    ConvertRegPathToAbsPathRequest,
    convertRegPathToAbsPath,
    ImportDMSchemaRequest,
    importDMSchema,
    UpdateDMCRequest,
    updateDMC,
    createDMFiles,
    updateDMCFileContent
} from "@wso2-enterprise/mi-core";
import { Messenger } from "vscode-messenger";
import { MiDataMapperRpcManager } from "./rpc-manager";

export function registerMiDataMapperRpcHandlers(messenger: Messenger) {
    const rpcManger = new MiDataMapperRpcManager();
    messenger.onRequest(getIOTypes, (args: IOTypeRequest) => rpcManger.getIOTypes(args));
    messenger.onNotification(updateFileContent, (args: UpdateFileContentRequest) => rpcManger.updateFileContent(args));
    messenger.onRequest(browseSchema, (args: BrowseSchemaRequest) => rpcManger.browseSchema(args));
    messenger.onRequest(loadDMConfigs, (args: LoadDMConfigsRequest) => rpcManger.loadDMConfigs(args));
    messenger.onRequest(convertRegPathToAbsPath, (args: ConvertRegPathToAbsPathRequest) => rpcManger.convertRegPathToAbsPath(args));
    messenger.onRequest(importDMSchema, (args: ImportDMSchemaRequest) => rpcManger.importDMSchema(args));
    messenger.onRequest(updateDMC, (args: UpdateDMCRequest) => rpcManger.updateDMC(args));
    messenger.onRequest(createDMFiles, (args: GenerateDMInputRequest) => rpcManger.createDMFiles(args));
    messenger.onRequest(updateDMCFileContent, (args: UpdateDMCRequest) => rpcManger.updateDMCFileContent(args));
}
