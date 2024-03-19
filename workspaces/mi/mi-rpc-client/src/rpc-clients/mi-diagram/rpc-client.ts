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
    ESBConfigsResponse,
    EndpointDirectoryResponse,
    EndpointsAndSequencesResponse,
    FileDirResponse,
    FileListRequest,
    FileListResponse,
    GetAvailableResourcesRequest,
    GetAvailableResourcesResponse,
    GetBackendRootUrlResponse,
    GetDefinitionRequest,
    GetDefinitionResponse,
    GetDiagnosticsReqeust,
    GetDiagnosticsResponse,
    GetFailoverEPRequest,
    GetFailoverEPResponse,
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
    GetSelectiveWorkspaceContextResponse,
    GetTaskRequest,
    GetTaskResponse,
    GetTextAtRangeRequest,
    GetTextAtRangeResponse,
    GetWorkspaceContextResponse,
    HighlightCodeRequest,
    ImportProjectRequest,
    ImportProjectResponse,
    MiDiagramAPI,
    OpenDiagramRequest,
    ProjectDirResponse,
    ProjectRootResponse,
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
    UpdateDefaultEndpointRequest,
    UpdateDefaultEndpointResponse,
    UpdateFailoverEPRequest,
    UpdateFailoverEPResponse,
    UpdateHttpEndpointRequest,
    UpdateHttpEndpointResponse,
    UpdateLoadBalanceEPRequest,
    UpdateLoadBalanceEPResponse,
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
    executeCommand,
    getAIResponse,
    getAPIDirectory,
    getAddressEndpoint,
    getAvailableResources,
    getBackendRootUrl,
    getConnector,
    getConnectors,
    getDefaultEndpoint,
    getDefinition,
    getDiagnostics,
    getESBConfigs,
    getEndpointDirectory,
    getEndpointsAndSequences,
    getFailoverEndpoint,
    getHttpEndpoint,
    getInboundEndpoint,
    getLoadBalanceEndpoint,
    getLocalEntry,
    getMessageProcessor,
    getMessageStore,
    getProjectRoot,
    getProjectUuid,
    getSTRequest,
    getSTResponse,
    getSelectiveWorkspaceContext,
    getSequenceDirectory,
    getSyntaxTree,
    getTask,
    getTemplate,
    getTemplates,
    getTextAtRange,
    getWorkspaceContext,
    getWorkspaceRoot,
    getWsdlEndpoint,
    getXmlFileList,
    highlightCode,
    importProject,
    initUndoRedoManager,
    openDiagram,
    openFile,
    redo,
    showErrorMessage,
    undo,
    updateAddressEndpoint,
    updateDefaultEndpoint,
    updateFailoverEndpoint,
    updateHttpEndpoint,
    updateLoadBalanceEndpoint,
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

    getXmlFileList(params: FileListRequest): Promise<FileListResponse> {
        return this._messenger.sendRequest(getXmlFileList, HOST_EXTENSION, params);
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
}
