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
    ApplyEditRequest,
    BrowseFileRequest,
    CommandsRequest,
    ConnectorRequest,
    CreateAPIRequest,
    CreateClassMediatorRequest,
    CreateConnectionRequest,
    CreateDataServiceRequest,
    CreateDssDataSourceRequest,
    CreateEndpointRequest,
    CreateInboundEndpointRequest,
    CreateLocalEntryRequest,
    CreateMessageProcessorRequest,
    CreateMessageStoreRequest,
    CreateProjectRequest,
    CreateProxyServiceRequest,
    CreateRegistryResourceRequest,
    CreateSequenceRequest,
    CreateTaskRequest,
    CreateTemplateRequest,
    DataSourceTemplate,
    DeleteArtifactRequest,
    DownloadConnectorRequest,
    DownloadInboundConnectorRequest,
    EditAPIRequest,
    ExportProjectRequest,
    GetAllArtifactsRequest,
    GetAllRegistryPathsRequest,
    GetAvailableConnectorRequest,
    GetAvailableResourcesRequest,
    GetConnectionFormRequest,
    GetConnectorConnectionsRequest,
    GetConnectorFormRequest,
    GetDataSourceRequest,
    GetDefinitionRequest,
    GetDiagnosticsReqeust,
    GetFailoverEPRequest,
    GetIconPathUriRequest,
    GetInboundEndpointRequest,
    GetLoadBalanceEPRequest,
    GetLocalEntryRequest,
    GetMessageStoreRequest,
    GetProjectRootRequest,
    GetRecipientEPRequest,
    GetRegistryMetadataRequest,
    GetSelectiveArtifactsRequest,
    GetSubFoldersRequest,
    GetTaskRequest,
    GetTemplateEPRequest,
    GetTextAtRangeRequest,
    HighlightCodeRequest,
    ImportProjectRequest,
    ListRegistryArtifactsRequest,
    MarkAsDefaultSequenceRequest,
    MigrateProjectRequest,
    OpenDependencyPomRequest,
    OpenDiagramRequest,
    RangeFormatRequest,
    RetrieveAddressEndpointRequest,
    RetrieveDataServiceRequest,
    RetrieveDefaultEndpointRequest,
    RetrieveHttpEndpointRequest,
    RetrieveMessageProcessorRequest,
    RetrieveTemplateRequest,
    RetrieveWsdlEndpointRequest,
    ShowErrorMessageRequest,
    SwaggerTypeRequest,
    TestDbConnectionRequest,
    UndoRedoParams,
    UpdateAPIFromSwaggerRequest,
    UpdateAddressEndpointRequest,
    UpdateConnectorRequest,
    UpdateDefaultEndpointRequest,
    UpdateDependencyInPomRequest,
    UpdateFailoverEPRequest,
    UpdateHttpEndpointRequest,
    UpdateLoadBalanceEPRequest,
    UpdateMockServiceRequest,
    UpdateRecipientEPRequest,
    UpdateRegistryMetadataRequest,
    UpdateTemplateEPRequest,
    UpdateTestCaseRequest,
    UpdateTestSuiteRequest,
    UpdateWsdlEndpointRequest,
    WriteContentToFileRequest,
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
    downloadInboundConnector,
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
    getSelectiveArtifacts,
    getSelectiveWorkspaceContext,
    getSequenceDirectory,
    getStoreConnectorJSON,
    getSubFolderNames,
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
    markAsDefaultSequence,
    migrateProject,
    openDependencyPom,
    openDiagram,
    openFile,
    openUpdateExtensionPage,
    rangeFormat,
    redo,
    refreshAccessToken,
    showErrorMessage,
    testDbConnection,
    undo,
    updateAPIFromSwagger,
    updateAddressEndpoint,
    updateConnectors,
    updateDefaultEndpoint,
    updateDependencyInPom,
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
    FileRenameRequest,
    renameFile,
    SaveInboundEPUischemaRequest,
    GetInboundEPUischemaRequest,
    saveInboundEPUischema,
    getInboundEPUischema,
    checkDBDriver,
    addDBDriver,
    generateDSSQueries,
    fetchDSSTables,
    AddDriverRequest,
    ExtendedDSSQueryGenRequest,
    DSSFetchTablesRequest,
    DSSQueryGenRequest,
    askDriverPath,
    addDriverToLib,
    deleteDriverFromLib,
    AddDriverToLibRequest,
    getAllAPIcontexts,
    tryOutMediator,
    MediatorTryOutRequest,
    saveInputPayload,
    getInputPayload,
    SavePayloadRequest,
    GetPayloadRequest,
    getMediatorInputOutputSchema
} from "@wso2-enterprise/mi-core";
import { Messenger } from "vscode-messenger";
import { MiDiagramRpcManager } from "./rpc-manager";

export function registerMiDiagramRpcHandlers(messenger: Messenger) {
    const rpcManger = new MiDiagramRpcManager();
    messenger.onRequest(executeCommand, (args: CommandsRequest) => rpcManger.executeCommand(args));
    messenger.onNotification(showErrorMessage, (args: ShowErrorMessageRequest) => rpcManger.showErrorMessage(args));
    messenger.onRequest(getSyntaxTree, (args: getSTRequest) => rpcManger.getSyntaxTree(args));
    messenger.onRequest(applyEdit, (args: ApplyEditRequest) => rpcManger.applyEdit(args));
    messenger.onRequest(getESBConfigs, () => rpcManger.getESBConfigs());
    messenger.onRequest(getConnectors, () => rpcManger.getConnectors());
    messenger.onRequest(getConnector, (args: ConnectorRequest) => rpcManger.getConnector(args));
    messenger.onRequest(getAPIDirectory, () => rpcManger.getAPIDirectory());
    messenger.onRequest(createAPI, (args: CreateAPIRequest) => rpcManger.createAPI(args));
    messenger.onRequest(editAPI, (args: EditAPIRequest) => rpcManger.editAPI(args));
    messenger.onRequest(getEndpointDirectory, () => rpcManger.getEndpointDirectory());
    messenger.onRequest(createEndpoint, (args: CreateEndpointRequest) => rpcManger.createEndpoint(args));
    messenger.onRequest(updateLoadBalanceEndpoint, (args: UpdateLoadBalanceEPRequest) => rpcManger.updateLoadBalanceEndpoint(args));
    messenger.onRequest(getLoadBalanceEndpoint, (args: GetLoadBalanceEPRequest) => rpcManger.getLoadBalanceEndpoint(args));
    messenger.onRequest(updateFailoverEndpoint, (args: UpdateFailoverEPRequest) => rpcManger.updateFailoverEndpoint(args));
    messenger.onRequest(getFailoverEndpoint, (args: GetFailoverEPRequest) => rpcManger.getFailoverEndpoint(args));
    messenger.onRequest(updateRecipientEndpoint, (args: UpdateRecipientEPRequest) => rpcManger.updateRecipientEndpoint(args));
    messenger.onRequest(getRecipientEndpoint, (args: GetRecipientEPRequest) => rpcManger.getRecipientEndpoint(args));
    messenger.onRequest(updateTemplateEndpoint, (args: UpdateTemplateEPRequest) => rpcManger.updateTemplateEndpoint(args));
    messenger.onRequest(getTemplateEndpoint, (args: GetTemplateEPRequest) => rpcManger.getTemplateEndpoint(args));
    messenger.onRequest(createLocalEntry, (args: CreateLocalEntryRequest) => rpcManger.createLocalEntry(args));
    messenger.onRequest(getLocalEntry, (args: GetLocalEntryRequest) => rpcManger.getLocalEntry(args));
    messenger.onRequest(getEndpointsAndSequences, () => rpcManger.getEndpointsAndSequences());
    messenger.onRequest(getTemplates, () => rpcManger.getTemplates());
    messenger.onRequest(getSequenceDirectory, () => rpcManger.getSequenceDirectory());
    messenger.onRequest(createSequence, (args: CreateSequenceRequest) => rpcManger.createSequence(args));
    messenger.onRequest(createMessageStore, (args: CreateMessageStoreRequest) => rpcManger.createMessageStore(args));
    messenger.onRequest(getMessageStore, (args: GetMessageStoreRequest) => rpcManger.getMessageStore(args));
    messenger.onRequest(createInboundEndpoint, (args: CreateInboundEndpointRequest) => rpcManger.createInboundEndpoint(args));
    messenger.onRequest(createMessageProcessor, (args: CreateMessageProcessorRequest) => rpcManger.createMessageProcessor(args));
    messenger.onRequest(getMessageProcessor, (args: RetrieveMessageProcessorRequest) => rpcManger.getMessageProcessor(args));
    messenger.onRequest(createProxyService, (args: CreateProxyServiceRequest) => rpcManger.createProxyService(args));
    messenger.onRequest(createTask, (args: CreateTaskRequest) => rpcManger.createTask(args));
    messenger.onRequest(getTask, (args: GetTaskRequest) => rpcManger.getTask(args));
    messenger.onRequest(createTemplate, (args: CreateTemplateRequest) => rpcManger.createTemplate(args));
    messenger.onRequest(getTemplate, (args: RetrieveTemplateRequest) => rpcManger.getTemplate(args));
    messenger.onRequest(getInboundEndpoint, (args: GetInboundEndpointRequest) => rpcManger.getInboundEndpoint(args));
    messenger.onRequest(updateHttpEndpoint, (args: UpdateHttpEndpointRequest) => rpcManger.updateHttpEndpoint(args));
    messenger.onRequest(getHttpEndpoint, (args: RetrieveHttpEndpointRequest) => rpcManger.getHttpEndpoint(args));
    messenger.onRequest(updateAddressEndpoint, (args: UpdateAddressEndpointRequest) => rpcManger.updateAddressEndpoint(args));
    messenger.onRequest(getAddressEndpoint, (args: RetrieveAddressEndpointRequest) => rpcManger.getAddressEndpoint(args));
    messenger.onRequest(updateWsdlEndpoint, (args: UpdateWsdlEndpointRequest) => rpcManger.updateWsdlEndpoint(args));
    messenger.onRequest(getWsdlEndpoint, (args: RetrieveWsdlEndpointRequest) => rpcManger.getWsdlEndpoint(args));
    messenger.onRequest(updateDefaultEndpoint, (args: UpdateDefaultEndpointRequest) => rpcManger.updateDefaultEndpoint(args));
    messenger.onRequest(getDefaultEndpoint, (args: RetrieveDefaultEndpointRequest) => rpcManger.getDefaultEndpoint(args));
    messenger.onRequest(createDataService, (args: CreateDataServiceRequest) => rpcManger.createDataService(args));
    messenger.onRequest(createDssDataSource, (args: CreateDssDataSourceRequest) => rpcManger.createDssDataSource(args));
    messenger.onRequest(getDataService, (args: RetrieveDataServiceRequest) => rpcManger.getDataService(args));
    messenger.onRequest(askDriverPath,() => rpcManger.askDriverPath());
    messenger.onRequest(addDriverToLib, (args: AddDriverToLibRequest) => rpcManger.addDriverToLib(args));
    messenger.onRequest(deleteDriverFromLib, (args: AddDriverToLibRequest) => rpcManger.deleteDriverFromLib(args));
    messenger.onNotification(closeWebView, () => rpcManger.closeWebView());
    messenger.onNotification(openDiagram, (args: OpenDiagramRequest) => rpcManger.openDiagram(args));
    messenger.onNotification(openFile, (args: OpenDiagramRequest) => rpcManger.openFile(args));
    messenger.onNotification(closeWebViewNotification, () => rpcManger.closeWebViewNotification());
    messenger.onRequest(getWorkspaceRoot, () => rpcManger.getWorkspaceRoot());
    messenger.onRequest(getProjectRoot, (args: GetProjectRootRequest) => rpcManger.getProjectRoot(args));
    messenger.onRequest(askProjectDirPath, () => rpcManger.askProjectDirPath());
    messenger.onRequest(askProjectImportDirPath, () => rpcManger.askProjectImportDirPath());
    messenger.onRequest(askFileDirPath, () => rpcManger.askFileDirPath());
    messenger.onRequest(createProject, (args: CreateProjectRequest) => rpcManger.createProject(args));
    messenger.onRequest(importProject, (args: ImportProjectRequest) => rpcManger.importProject(args));
    messenger.onRequest(migrateProject, (args: MigrateProjectRequest) => rpcManger.migrateProject(args));
    messenger.onRequest(getAIResponse, (args: AIUserInput) => rpcManger.getAIResponse(args));
    messenger.onRequest(writeContentToFile, (args: WriteContentToFileRequest) => rpcManger.writeContentToFile(args));
    messenger.onNotification(highlightCode, (args: HighlightCodeRequest) => rpcManger.highlightCode(args));
    messenger.onRequest(getWorkspaceContext, () => rpcManger.getWorkspaceContext());
    messenger.onRequest(getProjectUuid, () => rpcManger.getProjectUuid());
    messenger.onRequest(initUndoRedoManager, (args: UndoRedoParams) => rpcManger.initUndoRedoManager(args));
    messenger.onRequest(undo, (args: UndoRedoParams) => rpcManger.undo(args));
    messenger.onRequest(redo, (args: UndoRedoParams) => rpcManger.redo(args));
    messenger.onRequest(getDefinition, (args: GetDefinitionRequest) => rpcManger.getDefinition(args));
    messenger.onRequest(getTextAtRange, (args: GetTextAtRangeRequest) => rpcManger.getTextAtRange(args));
    messenger.onRequest(getDiagnostics, (args: GetDiagnosticsReqeust) => rpcManger.getDiagnostics(args));
    messenger.onRequest(browseFile, (args: BrowseFileRequest) => rpcManger.browseFile(args));
    messenger.onRequest(createRegistryResource, (args: CreateRegistryResourceRequest) => rpcManger.createRegistryResource(args));
    messenger.onRequest(getAvailableResources, (args: GetAvailableResourcesRequest) => rpcManger.getAvailableResources(args));
    messenger.onRequest(createClassMediator, (args: CreateClassMediatorRequest) => rpcManger.createClassMediator(args));
    messenger.onRequest(getSelectiveWorkspaceContext, () => rpcManger.getSelectiveWorkspaceContext());
    messenger.onRequest(getSelectiveArtifacts, (args: GetSelectiveArtifactsRequest) => rpcManger.getSelectiveArtifacts(args));
    messenger.onRequest(getBackendRootUrl, () => rpcManger.getBackendRootUrl());
    messenger.onRequest(getAvailableRegistryResources, (args: ListRegistryArtifactsRequest) => rpcManger.getAvailableRegistryResources(args));
    messenger.onRequest(updateRegistryMetadata, (args: UpdateRegistryMetadataRequest) => rpcManger.updateRegistryMetadata(args));
    messenger.onRequest(getMetadataOfRegistryResource, (args: GetRegistryMetadataRequest) => rpcManger.getMetadataOfRegistryResource(args));
    messenger.onRequest(rangeFormat, (args: RangeFormatRequest) => rpcManger.rangeFormat(args));
    messenger.onRequest(downloadConnector, (args: DownloadConnectorRequest) => rpcManger.downloadConnector(args));
    messenger.onRequest(downloadInboundConnector, (args: DownloadInboundConnectorRequest) => rpcManger.downloadInboundConnector(args));
    messenger.onRequest(getAvailableConnectors, (args: GetAvailableConnectorRequest) => rpcManger.getAvailableConnectors(args));
    messenger.onNotification(updateConnectors, (args: UpdateConnectorRequest) => rpcManger.updateConnectors(args));
    messenger.onRequest(getConnectorForm, (args: GetConnectorFormRequest) => rpcManger.getConnectorForm(args));
    messenger.onRequest(getConnectionForm, (args: GetConnectionFormRequest) => rpcManger.getConnectionForm(args));
    messenger.onRequest(saveInboundEPUischema, (args: SaveInboundEPUischemaRequest) => rpcManger.saveInboundEPUischema(args));
    messenger.onRequest(getInboundEPUischema, (args: GetInboundEPUischemaRequest) => rpcManger.getInboundEPUischema(args));
    messenger.onRequest(getStoreConnectorJSON, () => rpcManger.getStoreConnectorJSON());
    messenger.onRequest(createDataSource, (args: DataSourceTemplate) => rpcManger.createDataSource(args));
    messenger.onRequest(getDataSource, (args: GetDataSourceRequest) => rpcManger.getDataSource(args));
    messenger.onRequest(getIconPathUri, (args: GetIconPathUriRequest) => rpcManger.getIconPathUri(args));
    messenger.onRequest(getUserAccessToken, () => rpcManger.getUserAccessToken());
    messenger.onRequest(createConnection, (args: CreateConnectionRequest) => rpcManger.createConnection(args));
    messenger.onRequest(getConnectorConnections, (args: GetConnectorConnectionsRequest) => rpcManger.getConnectorConnections(args));
    messenger.onNotification(logoutFromMIAccount, () => rpcManger.logoutFromMIAccount());
    messenger.onRequest(getAllRegistryPaths, (args: GetAllRegistryPathsRequest) => rpcManger.getAllRegistryPaths(args));
    messenger.onRequest(getAllArtifacts, (args: GetAllArtifactsRequest) => rpcManger.getAllArtifacts(args));
    messenger.onNotification(deleteArtifact, (args: DeleteArtifactRequest) => rpcManger.deleteArtifact(args));
    messenger.onRequest(getAllAPIcontexts, () => rpcManger.getAllAPIcontexts())
    messenger.onNotification(buildProject, () => rpcManger.buildProject());
    messenger.onNotification(exportProject, (args: ExportProjectRequest) => rpcManger.exportProject(args));
    messenger.onRequest(checkOldProject, () => rpcManger.checkOldProject());
    messenger.onNotification(refreshAccessToken, () => rpcManger.refreshAccessToken());
    messenger.onRequest(getOpenAPISpec, (args: SwaggerTypeRequest) => rpcManger.getOpenAPISpec(args));
    messenger.onNotification(editOpenAPISpec, (args: SwaggerTypeRequest) => rpcManger.editOpenAPISpec(args));
    messenger.onRequest(compareSwaggerAndAPI, (args: SwaggerTypeRequest) => rpcManger.compareSwaggerAndAPI(args));
    messenger.onNotification(updateSwaggerFromAPI, (args: SwaggerTypeRequest) => rpcManger.updateSwaggerFromAPI(args));
    messenger.onNotification(updateAPIFromSwagger, (args: UpdateAPIFromSwaggerRequest) => rpcManger.updateAPIFromSwagger(args));
    messenger.onRequest(updateTestSuite, (args: UpdateTestSuiteRequest) => rpcManger.updateTestSuite(args));
    messenger.onRequest(updateTestCase, (args: UpdateTestCaseRequest) => rpcManger.updateTestCase(args));
    messenger.onRequest(updateMockService, (args: UpdateMockServiceRequest) => rpcManger.updateMockService(args));
    messenger.onRequest(getAllTestSuites, () => rpcManger.getAllTestSuites());
    messenger.onRequest(getAllMockServices, () => rpcManger.getAllMockServices());
    messenger.onNotification(updateDependencyInPom, (args: UpdateDependencyInPomRequest) => rpcManger.updateDependencyInPom(args));
    messenger.onNotification(openDependencyPom, (args: OpenDependencyPomRequest) => rpcManger.openDependencyPom(args));
    messenger.onRequest(getAllDependencies, (args: getAllDependenciesRequest) => rpcManger.getAllDependencies(args));
    messenger.onRequest(testDbConnection, (args: TestDbConnectionRequest) => rpcManger.testDbConnection(args));
    messenger.onNotification(markAsDefaultSequence, (args: MarkAsDefaultSequenceRequest) => rpcManger.markAsDefaultSequence(args));
    messenger.onRequest(getSubFolderNames, (args: GetSubFoldersRequest) => rpcManger.getSubFolderNames(args));
    messenger.onRequest(renameFile, (args: FileRenameRequest) => rpcManger.renameFile(args));
    messenger.onNotification(openUpdateExtensionPage, () => rpcManger.openUpdateExtensionPage());
    messenger.onRequest(checkDBDriver, (args: string) => rpcManger.checkDBDriver(args));
    messenger.onRequest(addDBDriver, (args: AddDriverRequest) => rpcManger.addDBDriver(args));
    messenger.onRequest(generateDSSQueries, (args: ExtendedDSSQueryGenRequest) => rpcManger.generateDSSQueries(args));
    messenger.onRequest(fetchDSSTables, (args: DSSFetchTablesRequest) => rpcManger.fetchDSSTables(args));
    messenger.onRequest(tryOutMediator, (args:MediatorTryOutRequest) => rpcManger.tryOutMediator(args));
    messenger.onRequest(getMediatorInputOutputSchema, (args:MediatorTryOutRequest) => rpcManger.getMediatorInputOutputSchema(args));
    messenger.onRequest(saveInputPayload, (args:SavePayloadRequest) => rpcManger.saveInputPayload(args));
    messenger.onRequest(getInputPayload, (args:GetPayloadRequest) => rpcManger.getInputPayload(args));
}
