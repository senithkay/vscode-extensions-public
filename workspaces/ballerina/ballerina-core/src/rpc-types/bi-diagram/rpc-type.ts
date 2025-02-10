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
    ServiceClassModelResponse,
    ModelFromCodeRequest,
    ClassFieldModifierRequest,
    SourceEditResponse,
    ServiceClassSourceRequest
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
    FormDidCloseParams
} from "./interfaces";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "bi-diagram";
export const getFlowModel: RequestType<void, BIFlowModelResponse> = { method: `${_preFix}/getFlowModel` };
export const getSourceCode: RequestType<BISourceCodeRequest, BISourceCodeResponse> = { method: `${_preFix}/getSourceCode` };
export const deleteFlowNode: RequestType<BISourceCodeRequest, BISourceCodeResponse> = { method: `${_preFix}/deleteFlowNode` };
export const deleteByComponentInfo: RequestType<BIDeleteByComponentInfoRequest, BIDeleteByComponentInfoResponse> = { method: `${_preFix}/deleteByComponentInfo` };
export const getAvailableNodes: RequestType<BIAvailableNodesRequest, BIAvailableNodesResponse> = { method: `${_preFix}/getAvailableNodes` };
export const getFunctions: RequestType<BIGetFunctionsRequest, BIGetFunctionsResponse> = { method: `${_preFix}/getFunctions` };
export const getEnclosedFunction: RequestType<BIGetEnclosedFunctionRequest, BIGetEnclosedFunctionResponse> = { method: `${_preFix}/getEnclosedFunction` };
export const getNodeTemplate: RequestType<BINodeTemplateRequest, BINodeTemplateResponse> = { method: `${_preFix}/getNodeTemplate` };
export const getAiSuggestions: RequestType<BIAiSuggestionsRequest, BIAiSuggestionsResponse> = { method: `${_preFix}/getAiSuggestions` };
export const createProject: NotificationType<ProjectRequest> = { method: `${_preFix}/createProject` };
export const getWorkspaces: RequestType<void, WorkspacesResponse> = { method: `${_preFix}/getWorkspaces` };
export const getProjectStructure: RequestType<void, ProjectStructureResponse> = { method: `${_preFix}/getProjectStructure` };
export const getProjectComponents: RequestType<void, ProjectComponentsResponse> = { method: `${_preFix}/getProjectComponents` };
export const createComponent: RequestType<ComponentRequest, CreateComponentResponse> = { method: `${_preFix}/createComponent` };
export const getBIConnectors: RequestType<BIConnectorsRequest, BIConnectorsResponse> = { method: `${_preFix}/getBIConnectors` };
export const handleReadmeContent: RequestType<ReadmeContentRequest, ReadmeContentResponse> = { method: `${_preFix}/handleReadmeContent` };
export const getVisibleVariableTypes: RequestType<BIGetVisibleVariableTypesRequest, BIGetVisibleVariableTypesResponse> = { method: `${_preFix}/getVisibleVariableTypes` };
export const getExpressionCompletions: RequestType<ExpressionCompletionsRequest, ExpressionCompletionsResponse> = { method: `${_preFix}/getExpressionCompletions` };
export const getConfigVariables: RequestType<void, ConfigVariableResponse> = { method: `${_preFix}/getConfigVariables` };
export const updateConfigVariables: RequestType<UpdateConfigVariableRequest, UpdateConfigVariableResponse> = { method: `${_preFix}/updateConfigVariables` };
export const getModuleNodes: RequestType<void, BIModuleNodesResponse> = { method: `${_preFix}/getModuleNodes` };
export const getReadmeContent: RequestType<void, ReadmeContentResponse> = { method: `${_preFix}/getReadmeContent` };
export const openReadme: NotificationType<void> = { method: `${_preFix}/openReadme` };
export const deployProject: NotificationType<void> = { method: `${_preFix}/deployProject` };
export const openAIChat: NotificationType<AIChatRequest> = { method: `${_preFix}/openAIChat` };
export const getSignatureHelp: RequestType<SignatureHelpRequest, SignatureHelpResponse> = { method: `${_preFix}/getSignatureHelp` };
export const buildProject: NotificationType<void> = { method: `${_preFix}/buildProject` };
export const runProject: NotificationType<void> = { method: `${_preFix}/runProject` };
export const getVisibleTypes: RequestType<VisibleTypesRequest, VisibleTypesResponse> = { method: `${_preFix}/getVisibleTypes` };
export const addBreakpointToSource: NotificationType<BreakpointRequest> = { method: `${_preFix}/addBreakpointToSource` };
export const removeBreakpointFromSource: NotificationType<BreakpointRequest> = { method: `${_preFix}/removeBreakpointFromSource` };
export const getBreakpointInfo: RequestType<void, CurrentBreakpointsResponse> = { method: `${_preFix}/getBreakpointInfo` };
export const getExpressionDiagnostics: RequestType<ExpressionDiagnosticsRequest, ExpressionDiagnosticsResponse> = { method: `${_preFix}/getExpressionDiagnostics` };
export const getAllImports: RequestType<void, ProjectImports> = { method: `${_preFix}/getAllImports` };
export const formDidOpen: RequestType<FormDidOpenParams, void> = { method: `${_preFix}/formDidOpen` };
export const formDidClose: RequestType<FormDidCloseParams, void> = { method: `${_preFix}/formDidClose` };
export const getDesignModel: RequestType<void, BIDesignModelResponse> = { method: `${_preFix}/getDesignModel` };
export const getTypes: RequestType<GetTypesRequest, GetTypesResponse> = { method: `${_preFix}/getTypes` };
export const getType: RequestType<GetTypeRequest, GetTypeResponse> = { method: `${_preFix}/getType` };
export const updateType: RequestType<UpdateTypeRequest, UpdateTypeResponse> = { method: `${_preFix}/updateType` };
export const getServiceClassModel: RequestType<ModelFromCodeRequest, ServiceClassModelResponse> = { method: `${_preFix}/getServiceClassModel` };
export const updateClassField: RequestType<ClassFieldModifierRequest, SourceEditResponse> = { method: `${_preFix}/updateClassField` };
export const updateServiceClass: RequestType<ServiceClassSourceRequest, SourceEditResponse> = { method: `${_preFix}/updateServiceClass` };
export const createGraphqlClassType: RequestType<UpdateTypeRequest, UpdateTypeResponse> = { method: `${_preFix}/createGraphqlClassType` };
export const updateImports: RequestType<UpdateImportsRequest, UpdateImportsResponse> = { method: `${_preFix}/updateImports` };
export const addFunction: RequestType<AddFunctionRequest, AddFunctionResponse> = { method: `${_preFix}/addFunction` };
