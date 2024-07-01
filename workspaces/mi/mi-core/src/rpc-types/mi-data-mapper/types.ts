/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { DMOperator, DMType } from "../../interfaces/mi-data-mapper";

export interface DMTypeRequest {
    filePath: string;
    functionName: string;
}

export interface IOTypeResponse {
    inputTrees: DMType[];
    outputTree: DMType | undefined;
}

export interface SubMappingTypesResponse {
    variableTypes: Record<string, DMType | undefined>;
}

export interface UpdateFileContentRequest {
    filePath: string;
    fileContent: string;
}

export interface GenerateDMInputRequest {
    filePath: string;
    dmLocation: string;
    dmName: string;
}

export interface GenerateDMInputResponse {
    success: boolean;
}

export interface BrowseSchemaRequest {
    documentUri: string;
    overwriteSchema?: boolean;
    sourcePath: string;
    resourceName: string;
    ioType: string;
    schemaType: string;
    configName: string;
}

export interface BrowseSchemaResponse {
    success: boolean;
}

export interface LoadDMConfigsRequest {
    filePath: string;
}

export interface LoadDMConfigsResponse {
    dmConfigs: string[];
}

export interface ConvertRegPathToAbsPathRequest {
    regPath: string;
    sourcePath: string;
}

export interface ConvertRegPathToAbsPathResponse {
    absPath: string;
    configName: string;
}

export interface UpdateDMCRequest {
    dmName: string;
    sourcePath: string;
}

export interface UpdateDMCResponse {
    success: boolean;
}

export interface SchemaGenRequest {
    filePath: string;
    delimiter: string;
    type: string;
    title: string;
}

export interface SchemaGenResponse {
    schema: string;
}

export interface UpdateDMUndoRedoMangerRequest {
    filePath: string;
    fileContent: string;
}

export interface GetOperatorsRequest {
    filePath: string;
}

export interface GetOperatorsResponse {
    operators:DMOperator[];
}

