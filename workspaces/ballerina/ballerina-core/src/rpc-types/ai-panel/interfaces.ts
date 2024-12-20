/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { AIMachineStateValue } from "../../state-machine-types";

export type ErrorCode = {
    code: number;
    message: string;
};

export interface ProjectSource {
    projectModules?: ProjectModule[];
    sourceFiles: SourceFile[];
}

export interface ProjectModule {
    moduleName: string;
    sourceFiles: SourceFile[];
}

export interface SourceFile {
    filePath : string;
    content : string;
}

export interface ProjectDiagnostics {
    diagnostics: DiagnosticEntry[];
}

export interface DiagnosticEntry {
    line?: number;
    message : string;
}

export interface InitialPrompt {
    exists: boolean;
    text: string;
}

export interface AIVisualizerState {
    state: AIMachineStateValue;
}

export interface AIVisualizerState {
    state: AIMachineStateValue;
}
export interface AddToProjectRequest {
    filePath: string;
    content: string;
    isTestCode: boolean;
}
export interface GetFromFileRequest {
    filePath: string;
}
export interface DeleteFromProjectRequest {
    filePath: string;
}
export interface GenerateMappingsRequest {
    position: NodePosition;
    filePath: string;
    file?: AttachmentResult;
}

export interface GenerateMappingsResponse {
    newFnPosition?: NodePosition;
    error?: ErrorCode;
    userAborted?: boolean;
}

export interface NotifyAIMappingsRequest {
    newFnPosition: NodePosition;
    prevFnSource: string;
    filePath: string;
}

export interface GenerateTestRequest {
    backendUri: string;
    token: string;
    serviceName: string;
    existingSource?: GeneratedTestSource;
    diagnostics?: ProjectDiagnostics;
}

export interface GeneratedTestSource {
    testContent: string;
    configContent?: string;
}

export interface DataMappingRecord {
    type: string;
    isArray: boolean;
    filePath: string;
}

export interface GenerateMappingsFromRecordRequest {
    backendUri: string;
    token: string;
    inputRecordTypes: DataMappingRecord[];
    outputRecordType: DataMappingRecord;
    functionName: string;
    imports: { moduleName: string; alias?: string }[];
    attachment?: AttachmentResult[]
}

export interface GenerateTypesFromRecordRequest {
    backendUri: string;
    token: string;
    attachment?: AttachmentResult[]
}

export interface AttachmentResult {
    name: string;
    content?: string;
    status: AttachmentStatus;
}

export enum AttachmentStatus {
    Success = "Success",
    FileSizeError = "FileSizeError",
    FileFormatError = "FileFormatError",
    Unknown = "Unknown"
}

export interface GenerateMappingFromRecordResponse {
    mappingCode: string;
}
export interface GenerateTypesFromRecordResponse {
    typesCode: string;
}
export interface MappingParameters{
    inputRecord: string[];
    outputRecord: string,
    functionName?: string;
}


export interface PostProcessRequest {
    assistant_response: string;
}

export interface PostProcessResponse {
    assistant_response: string;
    diagnostics: ProjectDiagnostics;
}
