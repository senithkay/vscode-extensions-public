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
import { ProjectStructureResponse } from "../../interfaces/eggplant";
import {
    EggplantAvailableNodesRequest,
    EggplantAvailableNodesResponse,
    EggplantFlowModelResponse,
    EggplantConnectorsRequest,
    EggplantConnectorsResponse,
    EggplantNodeTemplateRequest,
    EggplantNodeTemplateResponse,
    EggplantSourceCodeRequest,
    EggplantSourceCodeResponse,
    EggplantAiSuggestionsRequest,
    EggplantAiSuggestionsResponse,
} from "../../interfaces/extended-lang-client";
import { CreateProjectRequest, WorkspacesResponse, ProjectComponentsResponse, CreateComponentRequest, CreateComponentResponse } from "./interfaces";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "eggplant-diagram";
export const getFlowModel: RequestType<void, EggplantFlowModelResponse> = { method: `${_preFix}/getFlowModel` };
export const getSourceCode: RequestType<EggplantSourceCodeRequest, EggplantSourceCodeResponse> = { method: `${_preFix}/getSourceCode` };
export const getAvailableNodes: RequestType<EggplantAvailableNodesRequest, EggplantAvailableNodesResponse> = { method: `${_preFix}/getAvailableNodes` };
export const getNodeTemplate: RequestType<EggplantNodeTemplateRequest, EggplantNodeTemplateResponse> = { method: `${_preFix}/getNodeTemplate` };
export const getAiSuggestions: RequestType<EggplantAiSuggestionsRequest, EggplantAiSuggestionsResponse> = { method: `${_preFix}/getAiSuggestions` };
export const createProject: NotificationType<CreateProjectRequest> = { method: `${_preFix}/createProject` };
export const getWorkspaces: RequestType<void, WorkspacesResponse> = { method: `${_preFix}/getWorkspaces` };
export const getProjectStructure: RequestType<void, ProjectStructureResponse> = { method: `${_preFix}/getProjectStructure` };
export const getProjectComponents: RequestType<void, ProjectComponentsResponse> = { method: `${_preFix}/getProjectComponents` };
export const createComponent: RequestType<CreateComponentRequest, CreateComponentResponse> = { method: `${_preFix}/createComponent` };
export const getEggplantConnectors: RequestType<EggplantConnectorsRequest, EggplantConnectorsResponse> = { method: `${_preFix}/getEggplantConnectors` };
