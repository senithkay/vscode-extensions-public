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
import {
    AIChatRequest,
    BIAiSuggestionsRequest,
    BIAiSuggestionsResponse,
    BIAvailableNodesRequest,
    BIAvailableNodesResponse,
    BIConnectorsRequest,
    BIConnectorsResponse,
    BIDeleteByComponentInfoRequest,
    BIDeleteByComponentInfoResponse,
    BIDiagramAPI,
    BIFlowModelResponse,
    BIGetFunctionsRequest,
    BIGetFunctionsResponse,
    BIGetVisibleVariableTypesRequest,
    BIGetVisibleVariableTypesResponse,
    BIModuleNodesResponse,
    BINodeTemplateRequest,
    BINodeTemplateResponse,
    BISourceCodeRequest,
    BISourceCodeResponse,
    ComponentRequest,
    ComponentsRequest,
    ComponentsResponse,
    ConfigVariableResponse,
    CreateComponentResponse,
    ExpressionCompletionsRequest,
    ExpressionCompletionsResponse,
    ProjectComponentsResponse,
    ProjectRequest,
    ProjectStructureResponse,
    ReadmeContentRequest,
    ReadmeContentResponse,
    SignatureHelpRequest,
    SignatureHelpResponse,
    UpdateConfigVariableRequest,
    UpdateConfigVariableResponse,
    VisibleTypesRequest,
    VisibleTypesResponse,
    WorkspacesResponse,
    buildProject,
    createComponent,
    createComponents,
    createProject,
    deleteByComponentInfo,
    deleteFlowNode,
    deployProject,
    getAiSuggestions,
    getAvailableNodes,
    getBIConnectors,
    getConfigVariables,
    getExpressionCompletions,
    getFlowModel,
    getFunctions,
    getModuleNodes,
    getNodeTemplate,
    getProjectComponents,
    getProjectStructure,
    getReadmeContent,
    getSignatureHelp,
    getSourceCode,
    getVisibleTypes,
    getVisibleVariableTypes,
    getWorkspaces,
    handleReadmeContent,
    openAIChat,
    openReadme,
    runProject,
    updateConfigVariables
} from "@wso2-enterprise/ballerina-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class BiDiagramRpcClient implements BIDiagramAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getFlowModel(): Promise<BIFlowModelResponse> {
        return this._messenger.sendRequest(getFlowModel, HOST_EXTENSION);
    }

    getSourceCode(params: BISourceCodeRequest): Promise<BISourceCodeResponse> {
        return this._messenger.sendRequest(getSourceCode, HOST_EXTENSION, params);
    }

    deleteFlowNode(params: BISourceCodeRequest): Promise<BISourceCodeResponse> {
        return this._messenger.sendRequest(deleteFlowNode, HOST_EXTENSION, params);
    }

    deleteByComponentInfo(params: BIDeleteByComponentInfoRequest): Promise<BIDeleteByComponentInfoResponse> {
        return this._messenger.sendRequest(deleteByComponentInfo, HOST_EXTENSION, params);
    }

    getAvailableNodes(params: BIAvailableNodesRequest): Promise<BIAvailableNodesResponse> {
        return this._messenger.sendRequest(getAvailableNodes, HOST_EXTENSION, params);
    }

    getFunctions(params: BIGetFunctionsRequest): Promise<BIGetFunctionsResponse> {
        return this._messenger.sendRequest(getFunctions, HOST_EXTENSION, params);
    }

    getNodeTemplate(params: BINodeTemplateRequest): Promise<BINodeTemplateResponse> {
        return this._messenger.sendRequest(getNodeTemplate, HOST_EXTENSION, params);
    }

    getAiSuggestions(params: BIAiSuggestionsRequest): Promise<BIAiSuggestionsResponse> {
        return this._messenger.sendRequest(getAiSuggestions, HOST_EXTENSION, params);
    }

    createProject(params: ProjectRequest): void {
        return this._messenger.sendNotification(createProject, HOST_EXTENSION, params);
    }

    getWorkspaces(): Promise<WorkspacesResponse> {
        return this._messenger.sendRequest(getWorkspaces, HOST_EXTENSION);
    }

    getProjectStructure(): Promise<ProjectStructureResponse> {
        return this._messenger.sendRequest(getProjectStructure, HOST_EXTENSION);
    }

    getProjectComponents(): Promise<ProjectComponentsResponse> {
        return this._messenger.sendRequest(getProjectComponents, HOST_EXTENSION);
    }

    createComponent(params: ComponentRequest): Promise<CreateComponentResponse> {
        return this._messenger.sendRequest(createComponent, HOST_EXTENSION, params);
    }

    getBIConnectors(params: BIConnectorsRequest): Promise<BIConnectorsResponse> {
        return this._messenger.sendRequest(getBIConnectors, HOST_EXTENSION, params);
    }

    handleReadmeContent(params: ReadmeContentRequest): Promise<ReadmeContentResponse> {
        return this._messenger.sendRequest(handleReadmeContent, HOST_EXTENSION, params);
    }

    createComponents(params: ComponentsRequest): Promise<ComponentsResponse> {
        return this._messenger.sendRequest(createComponents, HOST_EXTENSION, params);
    }

    getVisibleVariableTypes(params: BIGetVisibleVariableTypesRequest): Promise<BIGetVisibleVariableTypesResponse> {
        return this._messenger.sendRequest(getVisibleVariableTypes, HOST_EXTENSION, params);
    }

    getExpressionCompletions(params: ExpressionCompletionsRequest): Promise<ExpressionCompletionsResponse> {
        return this._messenger.sendRequest(getExpressionCompletions, HOST_EXTENSION, params);
    }

    getConfigVariables(): Promise<ConfigVariableResponse> {
        return this._messenger.sendRequest(getConfigVariables, HOST_EXTENSION);
    }

    updateConfigVariables(params: UpdateConfigVariableRequest): Promise<UpdateConfigVariableResponse> {
        return this._messenger.sendRequest(updateConfigVariables, HOST_EXTENSION, params);
    }

    getModuleNodes(): Promise<BIModuleNodesResponse> {
        return this._messenger.sendRequest(getModuleNodes, HOST_EXTENSION);
    }

    getReadmeContent(): Promise<ReadmeContentResponse> {
        return this._messenger.sendRequest(getReadmeContent, HOST_EXTENSION);
    }

    openReadme(): void {
        return this._messenger.sendNotification(openReadme, HOST_EXTENSION);
    }

    deployProject(): void {
        return this._messenger.sendNotification(deployProject, HOST_EXTENSION);
    }

    openAIChat(params: AIChatRequest): void {
        return this._messenger.sendNotification(openAIChat, HOST_EXTENSION, params);
    }

    getSignatureHelp(params: SignatureHelpRequest): Promise<SignatureHelpResponse> {
        return this._messenger.sendRequest(getSignatureHelp, HOST_EXTENSION, params);
    }

    buildProject(): void {
        return this._messenger.sendNotification(buildProject, HOST_EXTENSION);
    }

    runProject(): void {
        return this._messenger.sendNotification(runProject, HOST_EXTENSION);
    }

    getVisibleTypes(params: VisibleTypesRequest): Promise<VisibleTypesResponse> {
        return this._messenger.sendRequest(getVisibleTypes, HOST_EXTENSION, params);
    }
}
