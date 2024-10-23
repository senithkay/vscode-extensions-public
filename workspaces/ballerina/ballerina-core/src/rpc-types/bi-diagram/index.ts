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
    ExpressionCompletionsRequest,
    ExpressionCompletionsResponse,
    ConfigVariableResponse,
    UpdateConfigVariableRequest,
    UpdateConfigVariableResponse,
} from "../../interfaces/extended-lang-client";
import { ProjectRequest, WorkspacesResponse, ProjectComponentsResponse, CreateComponentRequest, CreateComponentResponse, ReadmeContentRequest, ReadmeContentResponse, BIAiSuggestionsRequest, BIAiSuggestionsResponse, ComponentsRequest, ComponentsResponse } from "./interfaces";

export interface BIDiagramAPI {
    getFlowModel: () => Promise<BIFlowModelResponse>;
    getSourceCode: (params: BISourceCodeRequest) => Promise<BISourceCodeResponse>;
    deleteFlowNode: (params: BISourceCodeRequest) => Promise<BISourceCodeResponse>;
    getAvailableNodes: (params: BIAvailableNodesRequest) => Promise<BIAvailableNodesResponse>;
    getFunctions: (params: BIGetFunctionsRequest) => Promise<BIGetFunctionsResponse>;
    getNodeTemplate: (params: BINodeTemplateRequest) => Promise<BINodeTemplateResponse>;
    getAiSuggestions: (params: BIAiSuggestionsRequest) => Promise<BIAiSuggestionsResponse>;
    createProject: (params: ProjectRequest) => void;
    getWorkspaces: () => Promise<WorkspacesResponse>;
    getProjectStructure: () => Promise<ProjectStructureResponse>;
    getProjectComponents: () => Promise<ProjectComponentsResponse>;
    createComponent: (params: CreateComponentRequest) => Promise<CreateComponentResponse>;
    getBIConnectors: (params: BIConnectorsRequest) => Promise<BIConnectorsResponse>;
    handleReadmeContent: (params: ReadmeContentRequest) => Promise<ReadmeContentResponse>;
    createComponents: (params: ComponentsRequest) => Promise<ComponentsResponse>;
    getExpressionCompletions: (params: ExpressionCompletionsRequest) => Promise<ExpressionCompletionsResponse>;
    getConfigVariables:() => Promise<ConfigVariableResponse>;
    updateConfigVariables:(params: UpdateConfigVariableRequest) => Promise<UpdateConfigVariableResponse>;
}
