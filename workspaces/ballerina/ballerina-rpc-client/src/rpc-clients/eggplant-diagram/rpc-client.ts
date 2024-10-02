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
    ComponentsRequest,
    ComponentsResponse,
    CreateComponentRequest,
    CreateComponentResponse,
    EggplantAiSuggestionsRequest,
    EggplantAiSuggestionsResponse,
    EggplantAvailableNodesRequest,
    EggplantAvailableNodesResponse,
    EggplantConnectorsRequest,
    EggplantConnectorsResponse,
    EggplantDiagramAPI,
    EggplantFlowModelResponse,
    EggplantGetFunctionsRequest,
    EggplantGetFunctionsResponse,
    EggplantNodeTemplateRequest,
    EggplantNodeTemplateResponse,
    EggplantSourceCodeRequest,
    EggplantSourceCodeResponse,
    ProjectComponentsResponse,
    ProjectRequest,
    ProjectStructureResponse,
    ReadmeContentRequest,
    ReadmeContentResponse,
    WorkspacesResponse,
    createComponent,
    createComponents,
    createProject,
    deleteFlowNode,
    getAiSuggestions,
    getAvailableNodes,
    getEggplantConnectors,
    getFlowModel,
    getFunctions,
    getNodeTemplate,
    getProjectComponents,
    getProjectStructure,
    getSourceCode,
    getWorkspaces,
    handleReadmeContent
} from "@wso2-enterprise/ballerina-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class EggplantDiagramRpcClient implements EggplantDiagramAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getFlowModel(): Promise<EggplantFlowModelResponse> {
        return this._messenger.sendRequest(getFlowModel, HOST_EXTENSION);
    }

    getSourceCode(params: EggplantSourceCodeRequest): Promise<EggplantSourceCodeResponse> {
        return this._messenger.sendRequest(getSourceCode, HOST_EXTENSION, params);
    }

    deleteFlowNode(params: EggplantSourceCodeRequest): Promise<EggplantSourceCodeResponse> {
        return this._messenger.sendRequest(deleteFlowNode, HOST_EXTENSION, params);
    }

    getAvailableNodes(params: EggplantAvailableNodesRequest): Promise<EggplantAvailableNodesResponse> {
        return this._messenger.sendRequest(getAvailableNodes, HOST_EXTENSION, params);
    }

    getFunctions(params: EggplantGetFunctionsRequest): Promise<EggplantGetFunctionsResponse> {
        return this._messenger.sendRequest(getFunctions, HOST_EXTENSION, params);
    }

    getNodeTemplate(params: EggplantNodeTemplateRequest): Promise<EggplantNodeTemplateResponse> {
        return this._messenger.sendRequest(getNodeTemplate, HOST_EXTENSION, params);
    }

    getAiSuggestions(params: EggplantAiSuggestionsRequest): Promise<EggplantAiSuggestionsResponse> {
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

    createComponent(params: CreateComponentRequest): Promise<CreateComponentResponse> {
        return this._messenger.sendRequest(createComponent, HOST_EXTENSION, params);
    }

    getEggplantConnectors(params: EggplantConnectorsRequest): Promise<EggplantConnectorsResponse> {
        return this._messenger.sendRequest(getEggplantConnectors, HOST_EXTENSION, params);
    }

    handleReadmeContent(params: ReadmeContentRequest): Promise<ReadmeContentResponse> {
        return this._messenger.sendRequest(handleReadmeContent, HOST_EXTENSION, params);
    }

    createComponents(params: ComponentsRequest): Promise<ComponentsResponse> {
        return this._messenger.sendRequest(createComponents, HOST_EXTENSION, params);
    }
}
