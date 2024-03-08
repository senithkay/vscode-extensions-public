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

import { ApiDirectoryResponse, ApplyEditRequest, ApplyEditResponse, CommandsRequest, CommandsResponse, ConnectorRequest, ConnectorResponse, ConnectorsResponse, CreateAPIRequest, CreateAPIResponse, CreateEndpointRequest, CreateEndpointResponse, CreateSequenceRequest, CreateSequenceResponse, EndpointDirectoryResponse, EndpointsAndSequencesResponse, ProjectRootResponse, OpenDiagramRequest, SequenceDirectoryResponse, ShowErrorMessageRequest, getSTRequest, getSTResponse, CreateProjectRequest, ProjectDirResponse, CreateProjectResponse, ESBConfigsResponse, HighlightCodeRequest, AIUserInput, WriteContentToFileRequest, WriteContentToFileResponse, InboundEndpointDirectoryResponse, CreateLocalEntryRequest, CreateLocalEntryResponse, FileDirResponse, LocalEntryDirectoryResponse, CreateInboundEndpointRequest, CreateInboundEndpointResponse, UndoRedoParams, GetDefinitionRequest, GetDefinitionResponse, GetTextAtRangeRequest, GetTextAtRangeResponse, GetDiagnosticsReqeust, GetDiagnosticsResponse, GetInboundEpDirRequest, GetProjectRootRequest, BrowseFileResponse, CreateRegistryResourceRequest, CreateRegistryResourceResponse, BrowseFileRequest, CreateMessageProcessorRequest, CreateMessageProcessorResponse, RetrieveMessageProcessorRequest, RetrieveMessageProcessorResponse, CreateProxyServiceRequest, CreateProxyServiceResponse } from "./types";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "mi-diagram";
export const executeCommand: RequestType<CommandsRequest, CommandsResponse> = { method: `${_preFix}/executeCommand` };
export const showErrorMessage: NotificationType<ShowErrorMessageRequest> = { method: `${_preFix}/showErrorMessage` };
export const getSyntaxTree: RequestType<getSTRequest, getSTResponse> = { method: `${_preFix}/getSyntaxTree` };
export const applyEdit: RequestType<ApplyEditRequest, ApplyEditResponse> = { method: `${_preFix}/applyEdit` };
export const getESBConfigs: RequestType<void, ESBConfigsResponse> = { method: `${_preFix}/getESBConfigs` };
export const getConnectors: RequestType<void, ConnectorsResponse> = { method: `${_preFix}/getConnectors` };
export const getConnector: RequestType<ConnectorRequest, ConnectorResponse> = { method: `${_preFix}/getConnector` };
export const getAPIDirectory: RequestType<void, ApiDirectoryResponse> = { method: `${_preFix}/getAPIDirectory` };
export const createAPI: RequestType<CreateAPIRequest, CreateAPIResponse> = { method: `${_preFix}/createAPI` };
export const getEndpointDirectory: RequestType<void, EndpointDirectoryResponse> = { method: `${_preFix}/getEndpointDirectory` };
export const getLocalEntryDirectory: RequestType<void, LocalEntryDirectoryResponse> = { method: `${_preFix}/getLocalEntryDirectory` };
export const createEndpoint: RequestType<CreateEndpointRequest, CreateEndpointResponse> = { method: `${_preFix}/createEndpoint` };
export const createLocalEntry: RequestType<CreateLocalEntryRequest, CreateLocalEntryResponse> = { method: `${_preFix}/createLocalEntry` };
export const getEndpointsAndSequences: RequestType<void, EndpointsAndSequencesResponse> = { method: `${_preFix}/getEndpointsAndSequences` };
export const getSequenceDirectory: RequestType<void, SequenceDirectoryResponse> = { method: `${_preFix}/getSequenceDirectory` };
export const createSequence: RequestType<CreateSequenceRequest, CreateSequenceResponse> = { method: `${_preFix}/createSequence` };
export const getInboundEndpointDirectory: RequestType<GetInboundEpDirRequest, InboundEndpointDirectoryResponse> = { method: `${_preFix}/getInboundEndpointDirectory` };
export const createInboundEndpoint: RequestType<CreateInboundEndpointRequest, CreateInboundEndpointResponse> = { method: `${_preFix}/createInboundEndpoint` };
export const createMessageProcessor: RequestType<CreateMessageProcessorRequest, CreateMessageProcessorResponse> = { method: `${_preFix}/createMessageProcessor` };
export const getMessageProcessor: RequestType<RetrieveMessageProcessorRequest, RetrieveMessageProcessorResponse> = { method: `${_preFix}/getMessageProcessor` };
export const createProxyService: RequestType<CreateProxyServiceRequest, CreateProxyServiceResponse> = { method: `${_preFix}/createProxyService` };
export const closeWebView: NotificationType<void> = { method: `${_preFix}/closeWebView` };
export const openDiagram: NotificationType<OpenDiagramRequest> = { method: `${_preFix}/openDiagram` };
export const openFile: NotificationType<OpenDiagramRequest> = { method: `${_preFix}/openFile` };
export const closeWebViewNotification: NotificationType<void> = { method: `${_preFix}/closeWebViewNotification` };
export const getWorkspaceRoot: RequestType<void, ProjectRootResponse> = { method: `${_preFix}/getWorkspaceRoot` };
export const getProjectRoot: RequestType<GetProjectRootRequest, ProjectRootResponse> = { method: `${_preFix}/getProjectRoot` };
export const askProjectDirPath: RequestType<void, ProjectDirResponse> = { method: `${_preFix}/askProjectDirPath` };
export const askFileDirPath: RequestType<void, FileDirResponse> = { method: `${_preFix}/askFileDirPath` };
export const createProject: RequestType<CreateProjectRequest, CreateProjectResponse> = { method: `${_preFix}/createProject` };
export const getAIResponse: RequestType<AIUserInput, string> = { method: `${_preFix}/getAIResponse` };
export const writeContentToFile: RequestType<WriteContentToFileRequest, WriteContentToFileResponse> = { method: `${_preFix}/writeContentToFile` };
export const highlightCode: NotificationType<HighlightCodeRequest> = { method: `${_preFix}/highlightCode` };
export const initUndoRedoManager: NotificationType<UndoRedoParams> = { method: `${_preFix}/initUndoRedoManager` };
export const undo: NotificationType<UndoRedoParams> = { method: `${_preFix}/undo` };
export const redo: NotificationType<UndoRedoParams> = { method: `${_preFix}/redo` };
export const getDefinition: RequestType<GetDefinitionRequest, GetDefinitionResponse> = { method: `${_preFix}/getDefinition` };
export const getTextAtRange: RequestType<GetTextAtRangeRequest, GetTextAtRangeResponse> = { method: `${_preFix}/getTextAtRange` };
export const getDiagnostics: RequestType<GetDiagnosticsReqeust, GetDiagnosticsResponse> = { method: `${_preFix}/getDiagnostics` };
export const browseFile: RequestType<BrowseFileRequest, BrowseFileResponse> = { method: `${_preFix}/browseFile` };
export const createRegistryResource: RequestType<CreateRegistryResourceRequest, CreateRegistryResourceResponse> = { method: `${_preFix}/createRegistryResource` };
