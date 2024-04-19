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
    AIUserInput,
    ApiDirectoryResponse,
    ApplyEditRequest,
    ApplyEditResponse,
    BrowseFileRequest,
    BrowseFileResponse,
    CommandsRequest,
    CommandsResponse,
    ConnectorRequest,
    ConnectorResponse,
    ConnectorsResponse,
    CreateAPIRequest,
    CreateAPIResponse,
    CreateClassMediatorRequest,
    CreateClassMediatorResponse,
    CreateConnectionRequest,
    CreateConnectionResponse,
    CreateDataSourceResponse,
    CreateEndpointRequest,
    CreateEndpointResponse,
    CreateInboundEndpointRequest,
    CreateInboundEndpointResponse,
    CreateLocalEntryRequest,
    CreateLocalEntryResponse,
    CreateMessageProcessorRequest,
    CreateMessageProcessorResponse,
    CreateMessageStoreRequest,
    CreateMessageStoreResponse,
    CreateProjectRequest,
    CreateProjectResponse,
    CreateProxyServiceRequest,
    CreateProxyServiceResponse,
    CreateRegistryResourceRequest,
    CreateRegistryResourceResponse,
    CreateSequenceRequest,
    CreateSequenceResponse,
    CreateTaskRequest,
    CreateTaskResponse,
    CreateTemplateRequest,
    CreateTemplateResponse,
    DataSourceTemplate,
    DownloadConnectorRequest,
    DownloadConnectorResponse,
    ESBConfigsResponse,
    EndpointDirectoryResponse,
    EndpointsAndSequencesResponse,
    FileDirResponse,
    GetAvailableConnectorRequest,
    GetAvailableConnectorResponse,
    GetAvailableResourcesRequest,
    GetAvailableResourcesResponse,
    GetBackendRootUrlResponse,
    GetConnectorConnectionsRequest,
    GetConnectorConnectionsResponse,
    GetConnectorFormRequest,
    GetConnectorFormResponse,
    GetDataSourceRequest,
    GetDefinitionRequest,
    GetDefinitionResponse,
    GetDiagnosticsReqeust,
    GetDiagnosticsResponse,
    GetFailoverEPRequest,
    GetFailoverEPResponse,
    GetIconPathUriRequest,
    GetIconPathUriResponse,
    GetInboundEndpointRequest,
    GetInboundEndpointResponse,
    GetLoadBalanceEPRequest,
    GetLoadBalanceEPResponse,
    GetLocalEntryRequest,
    GetLocalEntryResponse,
    GetMessageStoreRequest,
    GetMessageStoreResponse,
    GetProjectRootRequest,
    GetProjectUuidResponse,
    GetRecipientEPRequest,
    GetRecipientEPResponse,
    GetSelectiveWorkspaceContextResponse,
    GetTaskRequest,
    GetTaskResponse,
    GetTemplateEPRequest,
    GetTemplateEPResponse,
    GetTextAtRangeRequest,
    GetTextAtRangeResponse,
    GetWorkspaceContextResponse,
    HighlightCodeRequest,
    ImportProjectRequest,
    ImportProjectResponse,
    ListRegistryArtifactsRequest,
    ListRegistryArtifactsResponse,
    MiDiagramAPI,
    MigrateProjectRequest,
    MigrateProjectResponse,
    OpenDiagramRequest,
    ProjectDirResponse,
    ProjectRootResponse,
    RangeFormatRequest,
    RetrieveAddressEndpointRequest,
    RetrieveAddressEndpointResponse,
    RetrieveDefaultEndpointRequest,
    RetrieveDefaultEndpointResponse,
    RetrieveHttpEndpointRequest,
    RetrieveHttpEndpointResponse,
    RetrieveMessageProcessorRequest,
    RetrieveMessageProcessorResponse,
    RetrieveTemplateRequest,
    RetrieveTemplateResponse,
    RetrieveWsdlEndpointRequest,
    RetrieveWsdlEndpointResponse,
    SequenceDirectoryResponse,
    ShowErrorMessageRequest,
    TemplatesResponse,
    UndoRedoParams,
    UpdateAddressEndpointRequest,
    UpdateAddressEndpointResponse,
    UpdateConnectorRequest,
    UpdateDefaultEndpointRequest,
    UpdateDefaultEndpointResponse,
    UpdateFailoverEPRequest,
    UpdateFailoverEPResponse,
    UpdateHttpEndpointRequest,
    UpdateHttpEndpointResponse,
    UpdateLoadBalanceEPRequest,
    UpdateLoadBalanceEPResponse,
    UpdateRecipientEPRequest,
    UpdateRecipientEPResponse,
    UpdateTemplateEPRequest,
    UpdateTemplateEPResponse,
    UpdateWsdlEndpointRequest,
    UpdateWsdlEndpointResponse,
    WriteContentToFileRequest,
    WriteContentToFileResponse,
    applyEdit,
    askFileDirPath,
    askProjectDirPath,
    askProjectImportDirPath,
    browseFile,
    closeWebView,
    closeWebViewNotification,
    createAPI,
    createClassMediator,
    createConnection,
    createDataSource,
    createEndpoint,
    createInboundEndpoint,
    createLocalEntry,
    createMessageProcessor,
    createMessageStore,
    createProject,
    createProxyService,
    createRegistryResource,
    createSequence,
    createTask,
    createTemplate,
    downloadConnector,
    executeCommand,
    getAIResponse,
    getAPIDirectory,
    getAddressEndpoint,
    getAvailableConnectors,
    getAvailableRegistryResources,
    getAvailableResources,
    getBackendRootUrl,
    getConnector,
    getConnectorConnections,
    getConnectorForm,
    getConnectors,
    getDataSource,
    getDefaultEndpoint,
    getDefinition,
    getDiagnostics,
    getESBConfigs,
    getEndpointDirectory,
    getEndpointsAndSequences,
    getFailoverEndpoint,
    getHttpEndpoint,
    getIconPathUri,
    getInboundEndpoint,
    getLoadBalanceEndpoint,
    getLocalEntry,
    getMessageProcessor,
    getMessageStore,
    getProjectRoot,
    getProjectUuid,
    getRecipientEndpoint,
    getSTRequest,
    getSTResponse,
    getSelectiveWorkspaceContext,
    getSequenceDirectory,
    getSyntaxTree,
    getTask,
    getTemplate,
    getTemplateEndpoint,
    getTemplates,
    getTextAtRange,
    getWorkspaceContext,
    getWorkspaceRoot,
    getWsdlEndpoint,
    highlightCode,
    importProject,
    initUndoRedoManager,
    migrateProject,
    openDiagram,
    openFile,
    rangeFormat,
    redo,
    showErrorMessage,
    undo,
    updateAddressEndpoint,
    updateConnectors,
    updateDefaultEndpoint,
    updateFailoverEndpoint,
    updateHttpEndpoint,
    updateLoadBalanceEndpoint,
    updateRecipientEndpoint,
    updateTemplateEndpoint,
    updateWsdlEndpoint,
    writeContentToFile
} from "@wso2-enterprise/mi-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class MiDiagramRpcClient implements MiDiagramAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    executeCommand(params: CommandsRequest): Promise<CommandsResponse> {
        return this._messenger.sendRequest(executeCommand, HOST_EXTENSION, params);
    }

    showErrorMessage(params: ShowErrorMessageRequest): void {
        return this._messenger.sendNotification(showErrorMessage, HOST_EXTENSION, params);
    }

    getSyntaxTree(params: getSTRequest): Promise<getSTResponse> {
        return this._messenger.sendRequest(getSyntaxTree, HOST_EXTENSION, params);
    }

    applyEdit(params: ApplyEditRequest): Promise<ApplyEditResponse> {
        return this._messenger.sendRequest(applyEdit, HOST_EXTENSION, params);
    }

    getESBConfigs(): Promise<ESBConfigsResponse> {
        return this._messenger.sendRequest(getESBConfigs, HOST_EXTENSION);
    }

    getConnectors(): Promise<ConnectorsResponse> {
        return this._messenger.sendRequest(getConnectors, HOST_EXTENSION);
    }

    getConnector(params: ConnectorRequest): Promise<ConnectorResponse> {
        return this._messenger.sendRequest(getConnector, HOST_EXTENSION, params);
    }

    getAPIDirectory(): Promise<ApiDirectoryResponse> {
        return this._messenger.sendRequest(getAPIDirectory, HOST_EXTENSION);
    }

    createAPI(params: CreateAPIRequest): Promise<CreateAPIResponse> {
        return this._messenger.sendRequest(createAPI, HOST_EXTENSION, params);
    }

    getEndpointDirectory(): Promise<EndpointDirectoryResponse> {
        return this._messenger.sendRequest(getEndpointDirectory, HOST_EXTENSION);
    }

    createEndpoint(params: CreateEndpointRequest): Promise<CreateEndpointResponse> {
        return this._messenger.sendRequest(createEndpoint, HOST_EXTENSION, params);
    }

    updateLoadBalanceEndpoint(params: UpdateLoadBalanceEPRequest): Promise<UpdateLoadBalanceEPResponse> {
        return this._messenger.sendRequest(updateLoadBalanceEndpoint, HOST_EXTENSION, params);
    }

    getLoadBalanceEndpoint(params: GetLoadBalanceEPRequest): Promise<GetLoadBalanceEPResponse> {
        return this._messenger.sendRequest(getLoadBalanceEndpoint, HOST_EXTENSION, params);
    }

    updateFailoverEndpoint(params: UpdateFailoverEPRequest): Promise<UpdateFailoverEPResponse> {
        return this._messenger.sendRequest(updateFailoverEndpoint, HOST_EXTENSION, params);
    }

    getFailoverEndpoint(params: GetFailoverEPRequest): Promise<GetFailoverEPResponse> {
        return this._messenger.sendRequest(getFailoverEndpoint, HOST_EXTENSION, params);
    }

    updateRecipientEndpoint(params: UpdateRecipientEPRequest): Promise<UpdateRecipientEPResponse> {
        return this._messenger.sendRequest(updateRecipientEndpoint, HOST_EXTENSION, params);
    }

    getRecipientEndpoint(params: GetRecipientEPRequest): Promise<GetRecipientEPResponse> {
        return this._messenger.sendRequest(getRecipientEndpoint, HOST_EXTENSION, params);
    }

    updateTemplateEndpoint(params: UpdateTemplateEPRequest): Promise<UpdateTemplateEPResponse> {
        return this._messenger.sendRequest(updateTemplateEndpoint, HOST_EXTENSION, params);
    }

    getTemplateEndpoint(params: GetTemplateEPRequest): Promise<GetTemplateEPResponse> {
        return this._messenger.sendRequest(getTemplateEndpoint, HOST_EXTENSION, params);
    }

    createLocalEntry(params: CreateLocalEntryRequest): Promise<CreateLocalEntryResponse> {
        return this._messenger.sendRequest(createLocalEntry, HOST_EXTENSION, params);
    }

    getLocalEntry(params: GetLocalEntryRequest): Promise<GetLocalEntryResponse> {
        return this._messenger.sendRequest(getLocalEntry, HOST_EXTENSION, params);
    }

    getEndpointsAndSequences(): Promise<EndpointsAndSequencesResponse> {
        return this._messenger.sendRequest(getEndpointsAndSequences, HOST_EXTENSION);
    }

    getTemplates(): Promise<TemplatesResponse> {
        return this._messenger.sendRequest(getTemplates, HOST_EXTENSION);
    }

    getSequenceDirectory(): Promise<SequenceDirectoryResponse> {
        return this._messenger.sendRequest(getSequenceDirectory, HOST_EXTENSION);
    }

    createSequence(params: CreateSequenceRequest): Promise<CreateSequenceResponse> {
        return this._messenger.sendRequest(createSequence, HOST_EXTENSION, params);
    }

    createMessageStore(params: CreateMessageStoreRequest): Promise<CreateMessageStoreResponse> {
        return this._messenger.sendRequest(createMessageStore, HOST_EXTENSION, params);
    }

    getMessageStore(params: GetMessageStoreRequest): Promise<GetMessageStoreResponse> {
        return this._messenger.sendRequest(getMessageStore, HOST_EXTENSION, params);
    }

    createInboundEndpoint(params: CreateInboundEndpointRequest): Promise<CreateInboundEndpointResponse> {
        return this._messenger.sendRequest(createInboundEndpoint, HOST_EXTENSION, params);
    }

    createMessageProcessor(params: CreateMessageProcessorRequest): Promise<CreateMessageProcessorResponse> {
        return this._messenger.sendRequest(createMessageProcessor, HOST_EXTENSION, params);
    }

    getMessageProcessor(params: RetrieveMessageProcessorRequest): Promise<RetrieveMessageProcessorResponse> {
        return this._messenger.sendRequest(getMessageProcessor, HOST_EXTENSION, params);
    }

    createProxyService(params: CreateProxyServiceRequest): Promise<CreateProxyServiceResponse> {
        return this._messenger.sendRequest(createProxyService, HOST_EXTENSION, params);
    }

    createTask(params: CreateTaskRequest): Promise<CreateTaskResponse> {
        return this._messenger.sendRequest(createTask, HOST_EXTENSION, params);
    }

    getTask(params: GetTaskRequest): Promise<GetTaskResponse> {
        return this._messenger.sendRequest(getTask, HOST_EXTENSION, params);
    }

    createTemplate(params: CreateTemplateRequest): Promise<CreateTemplateResponse> {
        return this._messenger.sendRequest(createTemplate, HOST_EXTENSION, params);
    }

    getTemplate(params: RetrieveTemplateRequest): Promise<RetrieveTemplateResponse> {
        return this._messenger.sendRequest(getTemplate, HOST_EXTENSION, params);
    }

    getInboundEndpoint(params: GetInboundEndpointRequest): Promise<GetInboundEndpointResponse> {
        return this._messenger.sendRequest(getInboundEndpoint, HOST_EXTENSION, params);
    }

    updateHttpEndpoint(params: UpdateHttpEndpointRequest): Promise<UpdateHttpEndpointResponse> {
        return this._messenger.sendRequest(updateHttpEndpoint, HOST_EXTENSION, params);
    }

    getHttpEndpoint(params: RetrieveHttpEndpointRequest): Promise<RetrieveHttpEndpointResponse> {
        return this._messenger.sendRequest(getHttpEndpoint, HOST_EXTENSION, params);
    }

    updateAddressEndpoint(params: UpdateAddressEndpointRequest): Promise<UpdateAddressEndpointResponse> {
        return this._messenger.sendRequest(updateAddressEndpoint, HOST_EXTENSION, params);
    }

    getAddressEndpoint(params: RetrieveAddressEndpointRequest): Promise<RetrieveAddressEndpointResponse> {
        return this._messenger.sendRequest(getAddressEndpoint, HOST_EXTENSION, params);
    }

    updateWsdlEndpoint(params: UpdateWsdlEndpointRequest): Promise<UpdateWsdlEndpointResponse> {
        return this._messenger.sendRequest(updateWsdlEndpoint, HOST_EXTENSION, params);
    }

    getWsdlEndpoint(params: RetrieveWsdlEndpointRequest): Promise<RetrieveWsdlEndpointResponse> {
        return this._messenger.sendRequest(getWsdlEndpoint, HOST_EXTENSION, params);
    }

    updateDefaultEndpoint(params: UpdateDefaultEndpointRequest): Promise<UpdateDefaultEndpointResponse> {
        return this._messenger.sendRequest(updateDefaultEndpoint, HOST_EXTENSION, params);
    }

    getDefaultEndpoint(params: RetrieveDefaultEndpointRequest): Promise<RetrieveDefaultEndpointResponse> {
        return this._messenger.sendRequest(getDefaultEndpoint, HOST_EXTENSION, params);
    }

    closeWebView(): void {
        return this._messenger.sendNotification(closeWebView, HOST_EXTENSION);
    }

    openDiagram(params: OpenDiagramRequest): void {
        return this._messenger.sendNotification(openDiagram, HOST_EXTENSION, params);
    }

    openFile(params: OpenDiagramRequest): void {
        return this._messenger.sendNotification(openFile, HOST_EXTENSION, params);
    }

    closeWebViewNotification(): void {
        return this._messenger.sendNotification(closeWebViewNotification, HOST_EXTENSION);
    }

    getWorkspaceRoot(): Promise<ProjectRootResponse> {
        return this._messenger.sendRequest(getWorkspaceRoot, HOST_EXTENSION);
    }

    getProjectRoot(params: GetProjectRootRequest): Promise<ProjectRootResponse> {
        return this._messenger.sendRequest(getProjectRoot, HOST_EXTENSION, params);
    }

    askProjectDirPath(): Promise<ProjectDirResponse> {
        return this._messenger.sendRequest(askProjectDirPath, HOST_EXTENSION);
    }

    askProjectImportDirPath(): Promise<ProjectDirResponse> {
        return this._messenger.sendRequest(askProjectImportDirPath, HOST_EXTENSION);
    }

    askFileDirPath(): Promise<FileDirResponse> {
        return this._messenger.sendRequest(askFileDirPath, HOST_EXTENSION);
    }

    createProject(params: CreateProjectRequest): Promise<CreateProjectResponse> {
        return this._messenger.sendRequest(createProject, HOST_EXTENSION, params);
    }

    importProject(params: ImportProjectRequest): Promise<ImportProjectResponse> {
        return this._messenger.sendRequest(importProject, HOST_EXTENSION, params);
    }

    migrateProject(params: MigrateProjectRequest): Promise<MigrateProjectResponse> {
        return this._messenger.sendRequest(migrateProject, HOST_EXTENSION, params);
    }

    getAIResponse(params: AIUserInput): Promise<string> {
        return this._messenger.sendRequest(getAIResponse, HOST_EXTENSION, params);
    }

    writeContentToFile(params: WriteContentToFileRequest): Promise<WriteContentToFileResponse> {
        return this._messenger.sendRequest(writeContentToFile, HOST_EXTENSION, params);
    }

    highlightCode(params: HighlightCodeRequest): void {
        return this._messenger.sendNotification(highlightCode, HOST_EXTENSION, params);
    }

    getWorkspaceContext(): Promise<GetWorkspaceContextResponse> {
        return this._messenger.sendRequest(getWorkspaceContext, HOST_EXTENSION);
    }

    getProjectUuid(): Promise<GetProjectUuidResponse> {
        return this._messenger.sendRequest(getProjectUuid, HOST_EXTENSION);
    }

    initUndoRedoManager(params: UndoRedoParams): void {
        return this._messenger.sendNotification(initUndoRedoManager, HOST_EXTENSION, params);
    }

    undo(params: UndoRedoParams): void {
        return this._messenger.sendNotification(undo, HOST_EXTENSION, params);
    }

    redo(params: UndoRedoParams): void {
        return this._messenger.sendNotification(redo, HOST_EXTENSION, params);
    }

    getDefinition(params: GetDefinitionRequest): Promise<GetDefinitionResponse> {
        return this._messenger.sendRequest(getDefinition, HOST_EXTENSION, params);
    }

    getTextAtRange(params: GetTextAtRangeRequest): Promise<GetTextAtRangeResponse> {
        return this._messenger.sendRequest(getTextAtRange, HOST_EXTENSION, params);
    }

    getDiagnostics(params: GetDiagnosticsReqeust): Promise<GetDiagnosticsResponse> {
        return this._messenger.sendRequest(getDiagnostics, HOST_EXTENSION, params);
    }

    browseFile(params: BrowseFileRequest): Promise<BrowseFileResponse> {
        return this._messenger.sendRequest(browseFile, HOST_EXTENSION, params);
    }

    createRegistryResource(params: CreateRegistryResourceRequest): Promise<CreateRegistryResourceResponse> {
        return this._messenger.sendRequest(createRegistryResource, HOST_EXTENSION, params);
    }

    getAvailableResources(params: GetAvailableResourcesRequest): Promise<GetAvailableResourcesResponse> {
        return this._messenger.sendRequest(getAvailableResources, HOST_EXTENSION, params);
    }

    createClassMediator(params: CreateClassMediatorRequest): Promise<CreateClassMediatorResponse> {
        return this._messenger.sendRequest(createClassMediator, HOST_EXTENSION, params);
    }

    getSelectiveWorkspaceContext(): Promise<GetSelectiveWorkspaceContextResponse> {
        return this._messenger.sendRequest(getSelectiveWorkspaceContext, HOST_EXTENSION);
    }

    getBackendRootUrl(): Promise<GetBackendRootUrlResponse> {
        return this._messenger.sendRequest(getBackendRootUrl, HOST_EXTENSION);
    }

    getAvailableRegistryResources(params: ListRegistryArtifactsRequest): Promise<ListRegistryArtifactsResponse> {
        return this._messenger.sendRequest(getAvailableRegistryResources, HOST_EXTENSION, params);
    }

    rangeFormat(params: RangeFormatRequest): Promise<ApplyEditResponse> {
        return this._messenger.sendRequest(rangeFormat, HOST_EXTENSION, params);
    }

    downloadConnector(params: DownloadConnectorRequest): Promise<DownloadConnectorResponse> {
        return this._messenger.sendRequest(downloadConnector, HOST_EXTENSION, params);
    }

    getAvailableConnectors(params: GetAvailableConnectorRequest): Promise<GetAvailableConnectorResponse> {
        return this._messenger.sendRequest(getAvailableConnectors, HOST_EXTENSION, params);
    }

    updateConnectors(params: UpdateConnectorRequest): void {
        return this._messenger.sendNotification(updateConnectors, HOST_EXTENSION, params);
    }

    getConnectorForm(params: GetConnectorFormRequest): Promise<GetConnectorFormResponse> {
        return this._messenger.sendRequest(getConnectorForm, HOST_EXTENSION, params);
    }

    createDataSource(params: DataSourceTemplate): Promise<CreateDataSourceResponse> {
        return this._messenger.sendRequest(createDataSource, HOST_EXTENSION, params);
    }

    getDataSource(params: GetDataSourceRequest): Promise<DataSourceTemplate> {
        return this._messenger.sendRequest(getDataSource, HOST_EXTENSION, params);
    }

    getIconPathUri(params: GetIconPathUriRequest): Promise<GetIconPathUriResponse> {
        return this._messenger.sendRequest(getIconPathUri, HOST_EXTENSION, params);
    }

    createConnection(params: CreateConnectionRequest): Promise<CreateConnectionResponse> {
        return this._messenger.sendRequest(createConnection, HOST_EXTENSION, params);
    }

    getConnectorConnections(params: GetConnectorConnectionsRequest): Promise<GetConnectorConnectionsResponse> {
        return this._messenger.sendRequest(getConnectorConnections, HOST_EXTENSION, params);
    }
}
