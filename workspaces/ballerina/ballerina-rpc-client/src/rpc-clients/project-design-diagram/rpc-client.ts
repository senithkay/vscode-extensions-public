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
    AddConnectorRequest,
    AddConnectorResponse,
    AddLinkRequest,
    AddLinkResponse,
    BallerinaTriggerRequest,
    BallerinaTriggerResponse,
    BallerinaTriggersResponse,
    CellViewResponse,
    ChoreoProjectResponse,
    CommandRequest,
    CommandResponse,
    ComponentModelResponse,
    ConnectorsRequest,
    ConnectorsResponse,
    CreateComponentRequest,
    CreateComponentResponse,
    DeleteComponentRequest,
    DeleteLinkRequest,
    DeleteLinkResponse,
    DirectoryResponse,
    DisplayLabelRequest,
    DisplayLabelResponse,
    ErrorMessageRequest,
    GoToDesignRequest,
    LocationRequest,
    MultiRootWsResponse,
    ProjectDesignDiagramAPI,
    ProjectDetailsResponse,
    ProjectRootResponse,
    PullConnectorResponse,
    SelectedNodeResponse,
    addConnector,
    addLink,
    checkIsMultiRootWs,
    createComponent,
    deleteComponent,
    deleteLink,
    editDisplayLabel,
    executeCommand,
    fetchTrigger,
    fetchTriggers,
    getComponentModel,
    getConnectors,
    getProjectDetails,
    getProjectRoot,
    go2source,
    goToDesign,
    isCellView,
    isChoreoProject,
    pickDirectory,
    promptWorkspaceConversion,
    pullConnector,
    selectedNodeId,
    showChoreoProjectOverview,
    showDiagnosticsWarning,
    showErrorMessage
} from "@wso2-enterprise/ballerina-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class ProjectDesignDiagramRpcClient implements ProjectDesignDiagramAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    createComponent(params: CreateComponentRequest): Promise<CreateComponentResponse> {
        return this._messenger.sendRequest(createComponent, HOST_EXTENSION, params);
    }

    getProjectDetails(): Promise<ProjectDetailsResponse> {
        return this._messenger.sendRequest(getProjectDetails, HOST_EXTENSION);
    }

    getProjectRoot(): Promise<ProjectRootResponse> {
        return this._messenger.sendRequest(getProjectRoot, HOST_EXTENSION);
    }

    addConnector(params: AddConnectorRequest): Promise<AddConnectorResponse> {
        return this._messenger.sendRequest(addConnector, HOST_EXTENSION, params);
    }

    pullConnector(params: AddConnectorRequest): Promise<PullConnectorResponse> {
        return this._messenger.sendRequest(pullConnector, HOST_EXTENSION, params);
    }

    addLink(params: AddLinkRequest): Promise<AddLinkResponse> {
        return this._messenger.sendRequest(addLink, HOST_EXTENSION, params);
    }

    deleteLink(params: DeleteLinkRequest): Promise<DeleteLinkResponse> {
        return this._messenger.sendRequest(deleteLink, HOST_EXTENSION, params);
    }

    pickDirectory(): Promise<DirectoryResponse> {
        return this._messenger.sendRequest(pickDirectory, HOST_EXTENSION);
    }

    executeCommand(params: CommandRequest): Promise<CommandResponse> {
        return this._messenger.sendRequest(executeCommand, HOST_EXTENSION, params);
    }

    fetchTriggers(): Promise<BallerinaTriggersResponse> {
        return this._messenger.sendRequest(fetchTriggers, HOST_EXTENSION);
    }

    fetchTrigger(params: BallerinaTriggerRequest): Promise<BallerinaTriggerResponse> {
        return this._messenger.sendRequest(fetchTrigger, HOST_EXTENSION, params);
    }

    editDisplayLabel(params: DisplayLabelRequest): Promise<DisplayLabelResponse> {
        return this._messenger.sendRequest(editDisplayLabel, HOST_EXTENSION, params);
    }

    getComponentModel(): Promise<ComponentModelResponse> {
        return this._messenger.sendRequest(getComponentModel, HOST_EXTENSION);
    }

    showChoreoProjectOverview(): void {
        return this._messenger.sendNotification(showChoreoProjectOverview, HOST_EXTENSION);
    }

    deleteComponent(params: DeleteComponentRequest): void {
        return this._messenger.sendNotification(deleteComponent, HOST_EXTENSION, params);
    }

    isChoreoProject(): Promise<ChoreoProjectResponse> {
        return this._messenger.sendRequest(isChoreoProject, HOST_EXTENSION);
    }

    selectedNodeId(): Promise<SelectedNodeResponse> {
        return this._messenger.sendRequest(selectedNodeId, HOST_EXTENSION);
    }

    isCellView(): Promise<CellViewResponse> {
        return this._messenger.sendRequest(isCellView, HOST_EXTENSION);
    }

    go2source(params: LocationRequest): void {
        return this._messenger.sendNotification(go2source, HOST_EXTENSION, params);
    }

    goToDesign(params: GoToDesignRequest): void {
        return this._messenger.sendNotification(goToDesign, HOST_EXTENSION, params);
    }

    showDiagnosticsWarning(): void {
        return this._messenger.sendNotification(showDiagnosticsWarning, HOST_EXTENSION);
    }

    showErrorMessage(params: ErrorMessageRequest): void {
        return this._messenger.sendNotification(showErrorMessage, HOST_EXTENSION, params);
    }

    promptWorkspaceConversion(): void {
        return this._messenger.sendNotification(promptWorkspaceConversion, HOST_EXTENSION);
    }

    checkIsMultiRootWs(): Promise<MultiRootWsResponse> {
        return this._messenger.sendRequest(checkIsMultiRootWs, HOST_EXTENSION);
    }

    getConnectors(params: ConnectorsRequest): Promise<ConnectorsResponse> {
        return this._messenger.sendRequest(getConnectors, HOST_EXTENSION, params);
    }
}
