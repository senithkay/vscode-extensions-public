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
    UpdateDependencyInPomRequest,
    ApiDirectoryResponse,
    ApplyEditRequest,
    ApplyEditResponse,
    BrowseFileRequest,
    BrowseFileResponse,
    CommandsRequest,
    CommandsResponse,
    CompareSwaggerAndAPIResponse,
    ConnectorRequest,
    ConnectorResponse,
    ConnectorsResponse,
    CreateAPIRequest,
    CreateAPIResponse,
    CreateClassMediatorRequest,
    CreateClassMediatorResponse,
    CreateConnectionRequest,
    CreateConnectionResponse,
    CreateDataServiceRequest,
    CreateDataServiceResponse,
    CreateDataSourceResponse,
    CreateDssDataSourceRequest,
    CreateDssDataSourceResponse,
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
    DeleteArtifactRequest,
    DownloadConnectorRequest,
    DownloadConnectorResponse,
    ESBConfigsResponse,
    EditAPIRequest,
    EditAPIResponse,
    EndpointDirectoryResponse,
    EndpointsAndSequencesResponse,
    ExportProjectRequest,
    FileDirResponse,
    GetAllArtifactsRequest,
    GetAllArtifactsResponse,
    GetAllDependenciesResponse,
    GetAllMockServicesResponse,
    GetAllRegistryPathsRequest,
    GetAllRegistryPathsResponse,
    GetAllTestSuitsResponse,
    GetAvailableConnectorRequest,
    GetAvailableConnectorResponse,
    GetAvailableResourcesRequest,
    GetAvailableResourcesResponse,
    GetBackendRootUrlResponse,
    GetConnectionFormRequest,
    GetConnectionFormResponse,
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
    GetRegistryMetadataRequest,
    GetRegistryMetadataResponse,
    GetSelectiveArtifactsRequest,
    GetSelectiveArtifactsResponse,
    GetSelectiveWorkspaceContextResponse,
    GetTaskRequest,
    GetTaskResponse,
    GetTemplateEPRequest,
    GetTemplateEPResponse,
    GetTextAtRangeRequest,
    GetTextAtRangeResponse,
    GetUserAccessTokenResponse,
    GetWorkspaceContextResponse,
    HighlightCodeRequest,
    ImportProjectRequest,
    ImportProjectResponse,
    ListRegistryArtifactsRequest,
    MiDiagramAPI,
    MigrateProjectRequest,
    MigrateProjectResponse,
    OpenDependencyPomRequest,
    OpenDiagramRequest,
    ProjectDirResponse,
    ProjectRootResponse,
    RangeFormatRequest,
    RegistryArtifactNamesResponse,
    RetrieveAddressEndpointRequest,
    RetrieveAddressEndpointResponse,
    RetrieveDataServiceRequest,
    RetrieveDataServiceResponse,
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
    SwaggerFromAPIResponse,
    SwaggerTypeRequest,
    TemplatesResponse,
    UndoRedoParams,
    UpdateAPIFromSwaggerRequest,
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
    UpdateMockServiceRequest,
    UpdateMockServiceResponse,
    UpdateRecipientEPRequest,
    UpdateRecipientEPResponse,
    UpdateRegistryMetadataRequest,
    UpdateRegistryMetadataResponse,
    UpdateTemplateEPRequest,
    UpdateTemplateEPResponse,
    UpdateTestCaseRequest,
    UpdateTestCaseResponse,
    UpdateTestSuiteRequest,
    UpdateTestSuiteResponse,
    UpdateWsdlEndpointRequest,
    UpdateWsdlEndpointResponse,
    WriteContentToFileRequest,
    WriteContentToFileResponse,
    updateDependencyInPom,
    applyEdit,
    askFileDirPath,
    askProjectDirPath,
    askProjectImportDirPath,
    browseFile,
    buildProject,
    checkOldProject,
    closeWebView,
    closeWebViewNotification,
    compareSwaggerAndAPI,
    createAPI,
    createClassMediator,
    createConnection,
    createDataService,
    createDataSource,
    createDssDataSource,
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
    deleteArtifact,
    downloadConnector,
    editAPI,
    editOpenAPISpec,
    executeCommand,
    exportProject,
    getAIResponse,
    getAPIDirectory,
    getAddressEndpoint,
    getAllArtifacts,
    getAllDependencies,
    getAllDependenciesRequest,
    getAllMockServices,
    getAllRegistryPaths,
    getAllTestSuites,
    getAvailableConnectors,
    getAvailableRegistryResources,
    getAvailableResources,
    getBackendRootUrl,
    getConnectionForm,
    getConnector,
    getConnectorConnections,
    getConnectorForm,
    getConnectors,
    getDataService,
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
    getMetadataOfRegistryResource,
    getOpenAPISpec,
    getProjectRoot,
    getProjectUuid,
    getRecipientEndpoint,
    getSTRequest,
    getSTResponse,
    getSelectiveArtifacts,
    getSelectiveWorkspaceContext,
    getSequenceDirectory,
    getSyntaxTree,
    getTask,
    getTemplate,
    getTemplateEndpoint,
    getTemplates,
    getTextAtRange,
    getUserAccessToken,
    getWorkspaceContext,
    getWorkspaceRoot,
    getWsdlEndpoint,
    highlightCode,
    importProject,
    initUndoRedoManager,
    logoutFromMIAccount,
    migrateProject,
    openDependencyPom,
    openDiagram,
    openFile,
    openUpdateExtensionPage,
    rangeFormat,
    redo,
    refreshAccessToken,
    showErrorMessage,
    undo,
    updateAPIFromSwagger,
    updateAddressEndpoint,
    updateConnectors,
    updateDefaultEndpoint,
    updateFailoverEndpoint,
    updateHttpEndpoint,
    updateLoadBalanceEndpoint,
    updateMockService,
    updateRecipientEndpoint,
    updateRegistryMetadata,
    updateSwaggerFromAPI,
    updateTemplateEndpoint,
    updateTestCase,
    updateTestSuite,
    updateWsdlEndpoint,
    writeContentToFile,
    StoreConnectorJsonResponse,
    getStoreConnectorJSON,
    TestDbConnectionRequest,
    TestDbConnectionResponse,
    testDbConnection,
    MarkAsDefaultSequenceRequest,
    markAsDefaultSequence,
    getSubFolderNames,
    GetSubFoldersResponse,
    GetSubFoldersRequest,
    downloadInboundConnector,
    DownloadInboundConnectorResponse,
    DownloadInboundConnectorRequest,
    FileRenameRequest,
    renameFile,
    SaveInboundEPUischemaRequest,
    GetInboundEPUischemaRequest,
    GetInboundEPUischemaResponse,
    getInboundEPUischema,
    saveInboundEPUischema,
    checkDBDriver,
    addDBDriver,
    generateDSSQueries,
    fetchDSSTables,
    AddDriverRequest,
    ExtendedDSSQueryGenRequest,
    DSSFetchTablesRequest,
    DSSFetchTablesResponse,
    DriverPathResponse,
    askDriverPath,
    addDriverToLib,
    deleteDriverFromLib,
    AddDriverToLibRequest,
    AddDriverToLibResponse,
    APIContextsResponse,
    getAllAPIcontexts,
    ListRegistryArtifactsResponse,
    getAvailableRegistryResourcesData
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

    editAPI(params: EditAPIRequest): Promise<EditAPIResponse> {
        return this._messenger.sendRequest(editAPI, HOST_EXTENSION, params);
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

    createDataService(params: CreateDataServiceRequest): Promise<CreateDataServiceResponse> {
        return this._messenger.sendRequest(createDataService, HOST_EXTENSION, params);
    }

    getDataService(params: RetrieveDataServiceRequest): Promise<RetrieveDataServiceResponse> {
        return this._messenger.sendRequest(getDataService, HOST_EXTENSION, params);
    }

    createDssDataSource(params: CreateDssDataSourceRequest): Promise<CreateDssDataSourceResponse> {
        return this._messenger.sendRequest(createDssDataSource, HOST_EXTENSION, params);
    }

    askDriverPath(): Promise<DriverPathResponse> {
        return this._messenger.sendRequest(askDriverPath, HOST_EXTENSION);
    }

    addDriverToLib(params: AddDriverToLibRequest): Promise<AddDriverToLibResponse> {
        return this._messenger.sendRequest(addDriverToLib, HOST_EXTENSION, params);
    }

    deleteDriverFromLib(params: AddDriverToLibRequest): Promise<void> {
        return this._messenger.sendRequest(deleteDriverFromLib, HOST_EXTENSION, params);
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

    initUndoRedoManager(params: UndoRedoParams): Promise<void> {
        return this._messenger.sendRequest(initUndoRedoManager, HOST_EXTENSION, params);
    }

    undo(params: UndoRedoParams): Promise<boolean> {
        return this._messenger.sendRequest(undo, HOST_EXTENSION, params);
    }

    redo(params: UndoRedoParams): Promise<boolean> {
        return this._messenger.sendRequest(redo, HOST_EXTENSION, params);
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

    getSelectiveArtifacts(params: GetSelectiveArtifactsRequest): Promise<GetSelectiveArtifactsResponse> {
        return this._messenger.sendRequest(getSelectiveArtifacts, HOST_EXTENSION, params);
    }

    getBackendRootUrl(): Promise<GetBackendRootUrlResponse> {
        return this._messenger.sendRequest(getBackendRootUrl, HOST_EXTENSION);
    }

    getAvailableRegistryResources(params: ListRegistryArtifactsRequest): Promise<RegistryArtifactNamesResponse> {
        return this._messenger.sendRequest(getAvailableRegistryResources, HOST_EXTENSION, params);
    }
    getAvailableRegistryResourcesData(params: ListRegistryArtifactsRequest): Promise<ListRegistryArtifactsResponse> {
        return this._messenger.sendRequest(getAvailableRegistryResourcesData, HOST_EXTENSION, params);
    }

    updateRegistryMetadata(params: UpdateRegistryMetadataRequest): Promise<UpdateRegistryMetadataResponse> {
        return this._messenger.sendRequest(updateRegistryMetadata, HOST_EXTENSION, params);
    }

    getMetadataOfRegistryResource(params: GetRegistryMetadataRequest): Promise<GetRegistryMetadataResponse> {
        return this._messenger.sendRequest(getMetadataOfRegistryResource, HOST_EXTENSION, params);
    }

    rangeFormat(params: RangeFormatRequest): Promise<ApplyEditResponse> {
        return this._messenger.sendRequest(rangeFormat, HOST_EXTENSION, params);
    }

    downloadConnector(params: DownloadConnectorRequest): Promise<DownloadConnectorResponse> {
        return this._messenger.sendRequest(downloadConnector, HOST_EXTENSION, params);
    }

    downloadInboundConnector(params: DownloadInboundConnectorRequest): Promise<DownloadInboundConnectorResponse> {
        return this._messenger.sendRequest(downloadInboundConnector, HOST_EXTENSION, params);
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

    getConnectionForm(params: GetConnectionFormRequest): Promise<GetConnectionFormResponse> {
        return this._messenger.sendRequest(getConnectionForm, HOST_EXTENSION, params);
    }

    saveInboundEPUischema(params: SaveInboundEPUischemaRequest): Promise<boolean> {
        return this._messenger.sendRequest(saveInboundEPUischema, HOST_EXTENSION, params);
    }

    getInboundEPUischema(params: GetInboundEPUischemaRequest): Promise<GetInboundEPUischemaResponse> {
        return this._messenger.sendRequest(getInboundEPUischema, HOST_EXTENSION, params);
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

    getUserAccessToken(): Promise<GetUserAccessTokenResponse> {
        return this._messenger.sendRequest(getUserAccessToken, HOST_EXTENSION);
    }

    createConnection(params: CreateConnectionRequest): Promise<CreateConnectionResponse> {
        return this._messenger.sendRequest(createConnection, HOST_EXTENSION, params);
    }

    getConnectorConnections(params: GetConnectorConnectionsRequest): Promise<GetConnectorConnectionsResponse> {
        return this._messenger.sendRequest(getConnectorConnections, HOST_EXTENSION, params);
    }

    getStoreConnectorJSON(): Promise<StoreConnectorJsonResponse> {
        return this._messenger.sendRequest(getStoreConnectorJSON, HOST_EXTENSION);
    }

    logoutFromMIAccount(): void {
        return this._messenger.sendNotification(logoutFromMIAccount, HOST_EXTENSION);
    }

    getAllRegistryPaths(params: GetAllRegistryPathsRequest): Promise<GetAllRegistryPathsResponse> {
        return this._messenger.sendRequest(getAllRegistryPaths, HOST_EXTENSION, params);
    }

    getAllArtifacts(params: GetAllArtifactsRequest): Promise<GetAllArtifactsResponse> {
        return this._messenger.sendRequest(getAllArtifacts, HOST_EXTENSION, params);
    }

    deleteArtifact(params: DeleteArtifactRequest): void {
        return this._messenger.sendNotification(deleteArtifact, HOST_EXTENSION, params);
    }

    getAllAPIcontexts(): Promise<APIContextsResponse> {
        return this._messenger.sendRequest(getAllAPIcontexts, HOST_EXTENSION);
    }

    buildProject(): void {
        return this._messenger.sendNotification(buildProject, HOST_EXTENSION);
    }

    refreshAccessToken(): Promise<void> {
        return this._messenger.sendRequest(refreshAccessToken, HOST_EXTENSION);
    }

    exportProject(params: ExportProjectRequest): void {
        return this._messenger.sendNotification(exportProject, HOST_EXTENSION, params);
    }

    checkOldProject(): Promise<boolean> {
        return this._messenger.sendRequest(checkOldProject, HOST_EXTENSION);
    }

    editOpenAPISpec(params: SwaggerTypeRequest): Promise<void> {
        return this._messenger.sendRequest(editOpenAPISpec, HOST_EXTENSION, params);
    }

    compareSwaggerAndAPI(params: SwaggerTypeRequest): Promise<CompareSwaggerAndAPIResponse> {
        return this._messenger.sendRequest(compareSwaggerAndAPI, HOST_EXTENSION, params);
    }

    getOpenAPISpec(params: SwaggerTypeRequest): Promise<SwaggerFromAPIResponse> {
        return this._messenger.sendRequest(getOpenAPISpec, HOST_EXTENSION, params);
    }

    updateSwaggerFromAPI(params: SwaggerTypeRequest): Promise<void> {
        return this._messenger.sendRequest(updateSwaggerFromAPI, HOST_EXTENSION, params);
    }

    updateAPIFromSwagger(params: UpdateAPIFromSwaggerRequest): Promise<void> {
        return this._messenger.sendRequest(updateAPIFromSwagger, HOST_EXTENSION, params);
    }

    updateTestSuite(params: UpdateTestSuiteRequest): Promise<UpdateTestSuiteResponse> {
        return this._messenger.sendRequest(updateTestSuite, HOST_EXTENSION, params);
    }

    updateTestCase(params: UpdateTestCaseRequest): Promise<UpdateTestCaseResponse> {
        return this._messenger.sendRequest(updateTestCase, HOST_EXTENSION, params);
    }

    updateMockService(params: UpdateMockServiceRequest): Promise<UpdateMockServiceResponse> {
        return this._messenger.sendRequest(updateMockService, HOST_EXTENSION, params);
    }

    getAllTestSuites(): Promise<GetAllTestSuitsResponse> {
        return this._messenger.sendRequest(getAllTestSuites, HOST_EXTENSION);
    }

    getAllMockServices(): Promise<GetAllMockServicesResponse> {
        return this._messenger.sendRequest(getAllMockServices, HOST_EXTENSION);
    }

    updateDependencyInPom(params: UpdateDependencyInPomRequest): Promise<void> {
        return this._messenger.sendRequest(updateDependencyInPom, HOST_EXTENSION, params);
    }

    openDependencyPom(params: OpenDependencyPomRequest): Promise<void> {
        return this._messenger.sendRequest(openDependencyPom, HOST_EXTENSION, params);
    }

    getAllDependencies(params: getAllDependenciesRequest): Promise<GetAllDependenciesResponse> {
        return this._messenger.sendRequest(getAllDependencies, HOST_EXTENSION, params);
    }

    testDbConnection(params: TestDbConnectionRequest): Promise<TestDbConnectionResponse> {
        return this._messenger.sendRequest(testDbConnection, HOST_EXTENSION, params);
    }

    markAsDefaultSequence(params: MarkAsDefaultSequenceRequest): Promise<void> {
        return this._messenger.sendRequest(markAsDefaultSequence, HOST_EXTENSION, params);
    }
  
    getSubFolderNames(params: GetSubFoldersRequest): Promise<GetSubFoldersResponse> {
        return this._messenger.sendRequest(getSubFolderNames, HOST_EXTENSION, params);
    }
  
    renameFile(params: FileRenameRequest): Promise<void> {
        return this._messenger.sendRequest(renameFile, HOST_EXTENSION, params);
    }

    openUpdateExtensionPage(): void {
        return this._messenger.sendNotification(openUpdateExtensionPage, HOST_EXTENSION);
    }

    checkDBDriver(params: string): Promise<boolean> {
        return this._messenger.sendRequest(checkDBDriver, HOST_EXTENSION, params);
    }

    addDBDriver(params: AddDriverRequest): Promise<boolean> {
        return this._messenger.sendRequest(addDBDriver, HOST_EXTENSION, params);
    }

    generateDSSQueries(params: ExtendedDSSQueryGenRequest): Promise<boolean> {
        return this._messenger.sendRequest(generateDSSQueries, HOST_EXTENSION, params);
    }

    fetchDSSTables(params: DSSFetchTablesRequest): Promise<DSSFetchTablesResponse> {
        return this._messenger.sendRequest(fetchDSSTables, HOST_EXTENSION, params);
    }
}
