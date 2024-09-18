/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
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
} from "../../interfaces/extended-lang-client";
import { ProjectRequest, WorkspacesResponse, ProjectComponentsResponse, CreateComponentRequest, CreateComponentResponse, ReadmeContentRequest, ReadmeContentResponse, EggplantAiSuggestionsRequest, EggplantAiSuggestionsResponse, ComponentsRequest, ComponentsResponse } from "./interfaces";

export interface EggplantDiagramAPI {
    getFlowModel: () => Promise<EggplantFlowModelResponse>;
    getSourceCode: (params: EggplantSourceCodeRequest) => Promise<EggplantSourceCodeResponse>;
    deleteFlowNode: (params: EggplantSourceCodeRequest) => Promise<EggplantSourceCodeResponse>;
    getAvailableNodes: (params: EggplantAvailableNodesRequest) => Promise<EggplantAvailableNodesResponse>;
    getNodeTemplate: (params: EggplantNodeTemplateRequest) => Promise<EggplantNodeTemplateResponse>;
    getAiSuggestions: (params: EggplantAiSuggestionsRequest) => Promise<EggplantAiSuggestionsResponse>;
    createProject: (params: ProjectRequest) => void;
    getWorkspaces: () => Promise<WorkspacesResponse>;
    getProjectStructure: () => Promise<ProjectStructureResponse>;
    getProjectComponents: () => Promise<ProjectComponentsResponse>;
    createComponent: (params: CreateComponentRequest) => Promise<CreateComponentResponse>;
    getEggplantConnectors: (params: EggplantConnectorsRequest) => Promise<EggplantConnectorsResponse>;
    handleReadmeContent: (params: ReadmeContentRequest) => Promise<ReadmeContentResponse>;
    createComponents: (params: ComponentsRequest) => Promise<ComponentsResponse>;
}
