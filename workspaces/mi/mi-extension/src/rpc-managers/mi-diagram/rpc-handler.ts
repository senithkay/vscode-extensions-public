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
    CommandsRequest,
    ConnectorRequest,
    CreateAPIRequest,
    CreateEndpointRequest,
    CreateInboundEndpointRequest,
    CreateProjectRequest,
    ImportProjectRequest,
    CreateSequenceRequest,
    CreateMessageProcessorRequest,
    RetrieveMessageProcessorRequest,
    CreateProxyServiceRequest,
    CreateTemplateRequest,
    RetrieveTemplateRequest,
    GetDefinitionRequest,
    GetDiagnosticsReqeust,
    GetInboundEpDirRequest,
    GetProjectRootRequest,
    GetTextAtRangeRequest,
    CreateLocalEntryRequest,
    HighlightCodeRequest,
    OpenDiagramRequest,
    ShowErrorMessageRequest,
    UndoRedoParams,
    WriteContentToFileRequest,
    applyEdit,
    askProjectDirPath,
    askProjectImportDirPath,
    askFileDirPath,
    closeWebView,
    closeWebViewNotification,
    createAPI,
    createEndpoint,
    createInboundEndpoint,
    createLocalEntry,
    createProject,
    importProject,
    createSequence,
    createMessageProcessor,
    createProxyService,
    createTemplate,
    executeCommand,
    getAIResponse,
    getAPIDirectory,
    getConnector,
    getConnectors,
    getDefinition,
    getDiagnostics,
    getESBConfigs,
    getEndpointDirectory,
    getEndpointsAndSequences,
    getInboundEndpointDirectory,
    getLocalEntryDirectory,
    getMessageProcessor,
    getTemplate,
    getProjectRoot,
    getSTRequest,
    getSequenceDirectory,
    getSyntaxTree,
    getTextAtRange,
    getWorkspaceRoot,
    highlightCode,
    initUndoRedoManager,
    openDiagram,
    openFile,
    redo,
    showErrorMessage,
    writeContentToFile,
    undo,
    createMessageStore,
    CreateMessageStoreRequest,
    browseFile,
    BrowseFileRequest,
    CreateRegistryResourceRequest,
    createRegistryResource,
    createTask,
    CreateTaskRequest,
    getTask,
    GetTaskRequest,
    getMessageStore,
    GetMessageStoreRequest,
    getAvailableResources,
    GetAvailableResourcesRequest
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
    messenger.onRequest(getEndpointsAndSequences, () => rpcManger.getEndpointsAndSequences());
    messenger.onRequest(getSequenceDirectory, () => rpcManger.getSequenceDirectory());
    messenger.onRequest(createSequence, (args: CreateSequenceRequest) => rpcManger.createSequence(args));
    messenger.onRequest(createProxyService, (args: CreateProxyServiceRequest) => rpcManger.createProxyService(args));
    messenger.onRequest(getInboundEndpointDirectory, (args: GetInboundEpDirRequest) => rpcManger.getInboundEndpointDirectory());
    messenger.onRequest(createInboundEndpoint, (args: CreateInboundEndpointRequest) => rpcManger.createInboundEndpoint(args));
    messenger.onRequest(createMessageProcessor, (args: CreateMessageProcessorRequest) => rpcManger.createMessageProcessor(args));
    messenger.onRequest(getMessageProcessor, (args: RetrieveMessageProcessorRequest) => rpcManger.getMessageProcessor(args));
    messenger.onRequest(createTask, (args: CreateTaskRequest) => rpcManger.createTask(args));
    messenger.onRequest(getTask, (args: GetTaskRequest) => rpcManger.getTask(args));
    messenger.onRequest(createMessageStore, (args: CreateMessageStoreRequest) => rpcManger.createMessageStore(args));
    messenger.onRequest(getMessageStore, (args: GetMessageStoreRequest) => rpcManger.getMessageStore(args));
    messenger.onRequest(createTemplate, (args: CreateTemplateRequest) => rpcManger.createTemplate(args));
    messenger.onRequest(getTemplate, (args: RetrieveTemplateRequest) => rpcManger.getTemplate(args));
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
    messenger.onRequest(getAIResponse, (args: AIUserInput) => rpcManger.getAIResponse(args));
    messenger.onRequest(writeContentToFile, (args: WriteContentToFileRequest) => rpcManger.writeContentToFile(args));
    messenger.onNotification(highlightCode, (args: HighlightCodeRequest) => rpcManger.highlightCode(args));
    messenger.onRequest(getLocalEntryDirectory, () => rpcManger.getLocalEntryDirectory());
    messenger.onRequest(createLocalEntry, (args: CreateLocalEntryRequest) => rpcManger.createLocalEntry(args));
    messenger.onNotification(initUndoRedoManager, (args: UndoRedoParams) => rpcManger.initUndoRedoManager(args));
    messenger.onNotification(undo, (args: UndoRedoParams) => rpcManger.undo(args));
    messenger.onNotification(redo, (args: UndoRedoParams) => rpcManger.redo(args));
    messenger.onRequest(getDefinition, (args: GetDefinitionRequest) => rpcManger.getDefinition(args));
    messenger.onRequest(getTextAtRange, (args: GetTextAtRangeRequest) => rpcManger.getTextAtRange(args));
    messenger.onRequest(getDiagnostics, (args: GetDiagnosticsReqeust) => rpcManger.getDiagnostics(args));
    messenger.onRequest(browseFile, (args: BrowseFileRequest) => rpcManger.browseFile(args));
    messenger.onRequest(createRegistryResource, (args: CreateRegistryResourceRequest) => rpcManger.createRegistryResource(args));
    messenger.onRequest(getAvailableResources, (args: GetAvailableResourcesRequest) => rpcManger.getAvailableResources(args));
}
