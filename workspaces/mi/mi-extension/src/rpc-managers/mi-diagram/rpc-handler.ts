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
    GetTaskRequest,
    GetTemplateEPRequest,
    GetTextAtRangeRequest,
    HighlightCodeRequest,
    ImportProjectRequest,
    ListRegistryArtifactsRequest,
    MigrateProjectRequest,
    OpenDiagramRequest,
    RangeFormatRequest,
    RetrieveAddressEndpointRequest,
    RetrieveDefaultEndpointRequest,
    RetrieveHttpEndpointRequest,
    RetrieveMessageProcessorRequest,
    RetrieveTemplateRequest,
    RetrieveWsdlEndpointRequest,
    ShowErrorMessageRequest,
    UndoRedoParams,
    UpdateAddressEndpointRequest,
    UpdateConnectorRequest,
    UpdateDefaultEndpointRequest,
    UpdateFailoverEPRequest,
    UpdateHttpEndpointRequest,
    UpdateLoadBalanceEPRequest,
    UpdateRecipientEPRequest,
    UpdateTemplateEPRequest,
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
    deleteArtifact,
    downloadConnector,
    executeCommand,
    exportProject,
    getAIResponse,
    getAPIDirectory,
    getAddressEndpoint,
    getAllArtifacts,
    getAllRegistryPaths,
    getAvailableConnectors,
    getAvailableRegistryResources,
    getAvailableResources,
    getBackendRootUrl,
    getConnectionForm,
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
    writeContentToFile,
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
    messenger.onNotification(initUndoRedoManager, (args: UndoRedoParams) => rpcManger.initUndoRedoManager(args));
    messenger.onNotification(undo, (args: UndoRedoParams) => rpcManger.undo(args));
    messenger.onNotification(redo, (args: UndoRedoParams) => rpcManger.redo(args));
    messenger.onRequest(getDefinition, (args: GetDefinitionRequest) => rpcManger.getDefinition(args));
    messenger.onRequest(getTextAtRange, (args: GetTextAtRangeRequest) => rpcManger.getTextAtRange(args));
    messenger.onRequest(getDiagnostics, (args: GetDiagnosticsReqeust) => rpcManger.getDiagnostics(args));
    messenger.onRequest(browseFile, (args: BrowseFileRequest) => rpcManger.browseFile(args));
    messenger.onRequest(createRegistryResource, (args: CreateRegistryResourceRequest) => rpcManger.createRegistryResource(args));
    messenger.onRequest(getAvailableResources, (args: GetAvailableResourcesRequest) => rpcManger.getAvailableResources(args));
    messenger.onRequest(createClassMediator, (args: CreateClassMediatorRequest) => rpcManger.createClassMediator(args));
    messenger.onRequest(getSelectiveWorkspaceContext, () => rpcManger.getSelectiveWorkspaceContext());
    messenger.onRequest(getBackendRootUrl, () => rpcManger.getBackendRootUrl());
    messenger.onRequest(getAvailableRegistryResources, (args: ListRegistryArtifactsRequest) => rpcManger.getAvailableRegistryResources(args));
    messenger.onRequest(rangeFormat, (args: RangeFormatRequest) => rpcManger.rangeFormat(args));
    messenger.onRequest(downloadConnector, (args: DownloadConnectorRequest) => rpcManger.downloadConnector(args));
    messenger.onRequest(getAvailableConnectors, (args: GetAvailableConnectorRequest) => rpcManger.getAvailableConnectors(args));
    messenger.onNotification(updateConnectors, (args: UpdateConnectorRequest) => rpcManger.updateConnectors(args));
    messenger.onRequest(getConnectorForm, (args: GetConnectorFormRequest) => rpcManger.getConnectorForm(args));
    messenger.onRequest(getConnectionForm, (args: GetConnectionFormRequest) => rpcManger.getConnectionForm(args));
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
    messenger.onNotification(buildProject, () => rpcManger.buildProject());
    messenger.onNotification(exportProject, (args: ExportProjectRequest) => rpcManger.exportProject(args));
    messenger.onRequest(checkOldProject, () => rpcManger.checkOldProject());
}
