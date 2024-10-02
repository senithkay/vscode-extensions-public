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
import { ProjectStructureResponse } from "../../interfaces/bi";
import {
    BIAvailableNodesRequest,
    BIAvailableNodesResponse,
    BIFlowModelResponse,
    BIConnectorsRequest,
    BIConnectorsResponse,
    BINodeTemplateRequest,
    BINodeTemplateResponse,
    BISourceCodeRequest,
    BISourceCodeResponse,
    BIGetFunctionsRequest,
    BIGetFunctionsResponse,
} from "../../interfaces/extended-lang-client";
import { ProjectRequest, WorkspacesResponse, ProjectComponentsResponse, CreateComponentRequest, CreateComponentResponse, ReadmeContentRequest, ReadmeContentResponse, BIAiSuggestionsRequest, BIAiSuggestionsResponse, ComponentsRequest, ComponentsResponse } from "./interfaces";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "bi-diagram";
export const getFlowModel: RequestType<void, BIFlowModelResponse> = { method: `${_preFix}/getFlowModel` };
export const getSourceCode: RequestType<BISourceCodeRequest, BISourceCodeResponse> = { method: `${_preFix}/getSourceCode` };
export const deleteFlowNode: RequestType<BISourceCodeRequest, BISourceCodeResponse> = { method: `${_preFix}/deleteFlowNode` };
export const getAvailableNodes: RequestType<BIAvailableNodesRequest, BIAvailableNodesResponse> = { method: `${_preFix}/getAvailableNodes` };
export const getFunctions: RequestType<BIGetFunctionsRequest, BIGetFunctionsResponse> = { method: `${_preFix}/getFunctions` };
export const getNodeTemplate: RequestType<BINodeTemplateRequest, BINodeTemplateResponse> = { method: `${_preFix}/getNodeTemplate` };
export const getAiSuggestions: RequestType<BIAiSuggestionsRequest, BIAiSuggestionsResponse> = { method: `${_preFix}/getAiSuggestions` };
export const createProject: NotificationType<ProjectRequest> = { method: `${_preFix}/createProject` };
export const getWorkspaces: RequestType<void, WorkspacesResponse> = { method: `${_preFix}/getWorkspaces` };
export const getProjectStructure: RequestType<void, ProjectStructureResponse> = { method: `${_preFix}/getProjectStructure` };
export const getProjectComponents: RequestType<void, ProjectComponentsResponse> = { method: `${_preFix}/getProjectComponents` };
export const createComponent: RequestType<CreateComponentRequest, CreateComponentResponse> = { method: `${_preFix}/createComponent` };
export const getBIConnectors: RequestType<BIConnectorsRequest, BIConnectorsResponse> = { method: `${_preFix}/getBIConnectors` };
export const handleReadmeContent: RequestType<ReadmeContentRequest, ReadmeContentResponse> = { method: `${_preFix}/handleReadmeContent` };
export const createComponents: RequestType<ComponentsRequest, ComponentsResponse> = { method: `${_preFix}/createComponents` };
