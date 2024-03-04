/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ApiDirectoryResponse, ApplyEditRequest, ApplyEditResponse, CommandsRequest, CommandsResponse, ConnectorRequest, ConnectorResponse, ConnectorsResponse, CreateAPIRequest, CreateAPIResponse, CreateEndpointRequest, CreateEndpointResponse, CreateSequenceRequest, CreateSequenceResponse, EndpointDirectoryResponse, EndpointsAndSequencesResponse, ProjectRootResponse, OpenDiagramRequest, SequenceDirectoryResponse, ShowErrorMessageRequest, getSTRequest, getSTResponse, CreateProjectRequest, ProjectDirResponse, CreateProjectResponse, ESBConfigsResponse, HighlightCodeRequest, AIUserInput, WriteContentToFileRequest, WriteContentToFileResponse, InboundEndpointDirectoryResponse, CreateInboundEndpointRequest, CreateInboundEndpointResponse, UndoRedoParams, GetDefinitionRequest, GetDefinitionResponse, GetTextAtRangeRequest, GetTextAtRangeResponse, GetProjectRootRequest, GetInboundEpDirRequest } from "./types";

export interface MiDiagramAPI {
    executeCommand: (params: CommandsRequest) => Promise<CommandsResponse>;
    showErrorMessage: (params: ShowErrorMessageRequest) => void;
    getSyntaxTree: (params: getSTRequest) => Promise<getSTResponse>;
    applyEdit: (params: ApplyEditRequest) => Promise<ApplyEditResponse>;
    getESBConfigs: () => Promise<ESBConfigsResponse>;
    getConnectors: () => Promise<ConnectorsResponse>;
    getConnector: (params: ConnectorRequest) => Promise<ConnectorResponse>;
    getAPIDirectory: () => Promise<ApiDirectoryResponse>;
    createAPI: (params: CreateAPIRequest) => Promise<CreateAPIResponse>;
    getEndpointDirectory: () => Promise<EndpointDirectoryResponse>;
    createEndpoint: (params: CreateEndpointRequest) => Promise<CreateEndpointResponse>;
    getEndpointsAndSequences: () => Promise<EndpointsAndSequencesResponse>;
    getSequenceDirectory: () => Promise<SequenceDirectoryResponse>;
    createSequence: (params: CreateSequenceRequest) => Promise<CreateSequenceResponse>;
    getInboundEndpointDirectory: (params: GetInboundEpDirRequest) => Promise<InboundEndpointDirectoryResponse>;
    createInboundEndpoint: (params: CreateInboundEndpointRequest) => Promise<CreateInboundEndpointResponse>;
    closeWebView: () => void;
    openDiagram: (params: OpenDiagramRequest) => void;
    openFile: (params: OpenDiagramRequest) => void;
    closeWebViewNotification: () => void;
    getWorkspaceRoot: () => Promise<ProjectRootResponse>;
    getProjectRoot: (params: GetProjectRootRequest) => Promise<ProjectRootResponse>;
    askProjectDirPath: () => Promise<ProjectDirResponse>;
    createProject: (params: CreateProjectRequest) => Promise<CreateProjectResponse>;
    getAIResponse: (params: AIUserInput) => Promise<string>;
    writeContentToFile: (params: WriteContentToFileRequest) => Promise<WriteContentToFileResponse>;
    highlightCode: (params: HighlightCodeRequest) => void;
    initUndoRedoManager: (params: UndoRedoParams) => void;
    undo: (params: UndoRedoParams) => void;
    redo: (params: UndoRedoParams) => void;
    getDefinition: (params: GetDefinitionRequest) => Promise<GetDefinitionResponse>;
    getTextAtRange: (params: GetTextAtRangeRequest) => Promise<GetTextAtRangeResponse>;
}
