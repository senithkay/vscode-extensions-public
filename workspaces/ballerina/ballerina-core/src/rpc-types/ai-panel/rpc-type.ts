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
import { AIVisualizerState, AddToProjectRequest, GenerateMappingsRequest, GenerateMappingsResponse, NotifyAIMappingsRequest } from "./interfaces";
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
export const getRefreshToken: RequestType<void, string> = { method: `${_preFix}/getRefreshToken` };
export const generateMappings: RequestType<GenerateMappingsRequest, GenerateMappingsResponse> = { method: `${_preFix}/generateMappings` };
export const notifyAIMappings: RequestType<NotifyAIMappingsRequest, boolean> = { method: `${_preFix}/notifyAIMappings` };
export const stopAIMappings: RequestType<void, GenerateMappingsResponse> = { method: `${_preFix}/stopAIMappings` };
export const promptLogin: RequestType<void, boolean> = { method: `${_preFix}/promptLogin` };
