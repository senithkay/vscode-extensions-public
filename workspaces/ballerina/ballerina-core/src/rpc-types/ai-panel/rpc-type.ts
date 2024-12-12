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
import { AIVisualizerState, AddToProjectRequest, GetFromFileRequest, DeleteFromProjectRequest, GenerateMappingsRequest, GenerateMappingsResponse, NotifyAIMappingsRequest, ProjectSource, ProjectDiagnostics, InitialPrompt, GenerateTestRequest, GeneratedTestSource, GenerateMappingsFromRecordRequest, GenerateMappingFromRecordResponse, PostProcessRequest, PostProcessResponse, GenerateTypesFromRecordRequest, GenerateTypesFromRecordResponse } from "./interfaces";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "ai-panel";
export const getBackendURL: RequestType<void, string> = { method: `${_preFix}/getBackendURL` };
export const updateProject: NotificationType<void> = { method: `${_preFix}/updateProject` };
export const login: NotificationType<void> = { method: `${_preFix}/login` };
export const logout: NotificationType<void> = { method: `${_preFix}/logout` };
export const getAiPanelState: RequestType<void, AIVisualizerState> = { method: `${_preFix}/getAiPanelState` };
export const getAccessToken: RequestType<void, string> = { method: `${_preFix}/getAccessToken` };
export const refreshAccessToken: NotificationType<void> = { method: `${_preFix}/refreshAccessToken` };
export const getProjectUuid: RequestType<void, string> = { method: `${_preFix}/getProjectUuid` };
export const addToProject: NotificationType<AddToProjectRequest> = { method: `${_preFix}/addToProject` };
export const getFromFile: RequestType<GetFromFileRequest, string> = { method: `${_preFix}/getFromFile` };
export const getFileExists: RequestType<GetFromFileRequest, boolean> = { method: `${_preFix}/getFileExists` };
export const deleteFromProject: NotificationType<DeleteFromProjectRequest> = { method: `${_preFix}/deleteFromProject` };
export const getRefreshToken: RequestType<void, string> = { method: `${_preFix}/getRefreshToken` };
export const generateMappings: RequestType<GenerateMappingsRequest, GenerateMappingsResponse> = { method: `${_preFix}/generateMappings` };
export const notifyAIMappings: RequestType<NotifyAIMappingsRequest, boolean> = { method: `${_preFix}/notifyAIMappings` };
export const stopAIMappings: RequestType<void, GenerateMappingsResponse> = { method: `${_preFix}/stopAIMappings` };
export const promptLogin: RequestType<void, boolean> = { method: `${_preFix}/promptLogin` };
export const getProjectSource: RequestType<void, ProjectSource> = { method: `${_preFix}/getProjectSource` };
export const getShadowDiagnostics: RequestType<ProjectSource, ProjectDiagnostics> = { method: `${_preFix}/getShadowDiagnostics` };
export const checkSyntaxError: RequestType<ProjectSource, boolean> = { method: `${_preFix}/checkSyntaxError` };
export const getInitialPrompt: RequestType<void, InitialPrompt> = { method: `${_preFix}/getInitialPrompt` };
export const clearInitialPrompt: NotificationType<void> = { method: `${_preFix}/clearInitialPrompt` };
export const getGeneratedTest: RequestType<GenerateTestRequest, GeneratedTestSource> = { method: `${_preFix}/getGeneratedTest` };
export const getTestDiagnostics: RequestType<GeneratedTestSource, ProjectDiagnostics> = { method: `${_preFix}/getTestDiagnostics` };
export const getMappingsFromRecord: RequestType<GenerateMappingsFromRecordRequest, GenerateMappingFromRecordResponse> = { method: `${_preFix}/getMappingsFromRecord` };
export const getTypesFromRecord: RequestType<GenerateTypesFromRecordRequest, GenerateTypesFromRecordResponse> = { method: `${_preFix}/getTypesFromRecord` };
export const applyDoOnFailBlocks: NotificationType<void> = { method: `${_preFix}/applyDoOnFailBlocks` };
export const postProcess: RequestType<PostProcessRequest, PostProcessResponse> = { method: `${_preFix}/postProcess` };
export const getActiveFile: RequestType<void, string> = { method: `${_preFix}/getActiveFile` };
