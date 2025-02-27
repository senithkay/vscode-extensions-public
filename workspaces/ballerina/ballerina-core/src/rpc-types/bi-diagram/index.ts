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
import { LinePosition } from "../../interfaces/common";
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
    BIModuleNodesResponse,
    ExpressionCompletionsRequest,
    ExpressionCompletionsResponse,
    ConfigVariableResponse,
    UpdateConfigVariableRequest,
    UpdateConfigVariableResponse,
    SignatureHelpRequest,
    SignatureHelpResponse,
    BIGetVisibleVariableTypesRequest,
    BIGetVisibleVariableTypesResponse,
    VisibleTypesRequest,
    VisibleTypesResponse,
    BIDeleteByComponentInfoRequest,
    BIDeleteByComponentInfoResponse,
    ExpressionDiagnosticsRequest,
    ExpressionDiagnosticsResponse,
    BIGetEnclosedFunctionRequest,
    BIGetEnclosedFunctionResponse,
    BIDesignModelResponse,
    GetTypesResponse,
    UpdateTypeResponse,
    GetTypesRequest,
    UpdateTypeRequest,
    GetTypeRequest,
    GetTypeResponse,
    UpdateImportsRequest,
    UpdateImportsResponse,
    AddFunctionRequest,
    AddFunctionResponse,
    FunctionNodeRequest,
    FunctionNodeResponse,
    ServiceClassModelResponse,
    ModelFromCodeRequest,
    ClassFieldModifierRequest,
    SourceEditResponse,
    ServiceClassSourceRequest,
    AddFieldRequest,
    RenameIdentifierRequest
} from "../../interfaces/extended-lang-client";
import {
    ProjectRequest,
    WorkspacesResponse,
    ProjectComponentsResponse,
    ComponentRequest,
    CreateComponentResponse,
    ReadmeContentRequest,
    ReadmeContentResponse,
    BIAiSuggestionsRequest,
    BIAiSuggestionsResponse,
    AIChatRequest,
    ProjectImports,
    BreakpointRequest,
    CurrentBreakpointsResponse,
    FormDidOpenParams,
    FormDidCloseParams,
    EndOfFileRequest
} from "./interfaces";

export interface BIDiagramAPI {
    getFlowModel: () => Promise<BIFlowModelResponse>;
    getSourceCode: (params: BISourceCodeRequest) => Promise<BISourceCodeResponse>;
    deleteFlowNode: (params: BISourceCodeRequest) => Promise<BISourceCodeResponse>;
    deleteByComponentInfo: (params: BIDeleteByComponentInfoRequest) => Promise<BIDeleteByComponentInfoResponse>;
    getAvailableNodes: (params: BIAvailableNodesRequest) => Promise<BIAvailableNodesResponse>;
    getFunctions: (params: BIGetFunctionsRequest) => Promise<BIGetFunctionsResponse>;
    getEnclosedFunction: (params: BIGetEnclosedFunctionRequest) => Promise<BIGetEnclosedFunctionResponse>;
    getNodeTemplate: (params: BINodeTemplateRequest) => Promise<BINodeTemplateResponse>;
    getAiSuggestions: (params: BIAiSuggestionsRequest) => Promise<BIAiSuggestionsResponse>;
    createProject: (params: ProjectRequest) => void;
    getWorkspaces: () => Promise<WorkspacesResponse>;
    getProjectStructure: () => Promise<ProjectStructureResponse>;
    getProjectComponents: () => Promise<ProjectComponentsResponse>;
    createComponent: (params: ComponentRequest) => Promise<CreateComponentResponse>;
    getBIConnectors: (params: BIConnectorsRequest) => Promise<BIConnectorsResponse>;
    handleReadmeContent: (params: ReadmeContentRequest) => Promise<ReadmeContentResponse>;
    getVisibleVariableTypes: (params: BIGetVisibleVariableTypesRequest) => Promise<BIGetVisibleVariableTypesResponse>;
    getExpressionCompletions: (params: ExpressionCompletionsRequest) => Promise<ExpressionCompletionsResponse>;
    getConfigVariables: () => Promise<ConfigVariableResponse>;
    updateConfigVariables: (params: UpdateConfigVariableRequest) => Promise<UpdateConfigVariableResponse>;
    getModuleNodes: () => Promise<BIModuleNodesResponse>;
    getReadmeContent: () => Promise<ReadmeContentResponse>;
    openReadme: () => void;
    renameIdentifier: (params: RenameIdentifierRequest) => Promise<void>;
    deployProject: () => void;
    openAIChat: (params: AIChatRequest) => void;
    getSignatureHelp: (params: SignatureHelpRequest) => Promise<SignatureHelpResponse>;
    buildProject: () => void;
    runProject: () => void;
    getVisibleTypes: (params: VisibleTypesRequest) => Promise<VisibleTypesResponse>;
    addBreakpointToSource: (params: BreakpointRequest) => void;
    removeBreakpointFromSource: (params: BreakpointRequest) => void;
    getBreakpointInfo: () => Promise<CurrentBreakpointsResponse>;
    getExpressionDiagnostics: (params: ExpressionDiagnosticsRequest) => Promise<ExpressionDiagnosticsResponse>;
    getAllImports: () => Promise<ProjectImports>;
    formDidOpen: (params: FormDidOpenParams) => Promise<void>;
    formDidClose: (params: FormDidCloseParams) => Promise<void>;
    getDesignModel: () => Promise<BIDesignModelResponse>;
    getTypes: (params: GetTypesRequest) => Promise<GetTypesResponse>;
    getType: (params: GetTypeRequest) => Promise<GetTypeResponse>;
    updateType: (params: UpdateTypeRequest) => Promise<UpdateTypeResponse>;
    getServiceClassModel: (params: ModelFromCodeRequest) => Promise<ServiceClassModelResponse>;
    updateClassField: (params: ClassFieldModifierRequest) => Promise<SourceEditResponse>;
    addClassField: (params: AddFieldRequest) => Promise<SourceEditResponse>;
    updateServiceClass: (params: ServiceClassSourceRequest) => Promise<SourceEditResponse>;
    createGraphqlClassType: (params: UpdateTypeRequest) => Promise<UpdateTypeResponse>;
    updateImports: (params: UpdateImportsRequest) => Promise<UpdateImportsResponse>;
    addFunction: (params: AddFunctionRequest) => Promise<AddFunctionResponse>;
    getFunctionNode: (params: FunctionNodeRequest) => Promise<FunctionNodeResponse>;
    getEndOfFile: (params: EndOfFileRequest) => Promise<LinePosition>;
}
