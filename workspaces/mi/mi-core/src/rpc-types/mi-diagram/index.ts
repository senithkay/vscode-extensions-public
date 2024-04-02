/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    ApiDirectoryResponse,
    ApplyEditRequest,
    ApplyEditResponse,
    CommandsRequest,
    CommandsResponse,
    ConnectorRequest,
    ConnectorResponse,
    ConnectorsResponse,
    CreateAPIRequest,
    CreateAPIResponse,
    CreateEndpointRequest,
    CreateEndpointResponse,
    CreateSequenceRequest,
    CreateSequenceResponse,
    EndpointDirectoryResponse,
    EndpointsAndSequencesResponse,
    ProjectRootResponse,
    OpenDiagramRequest,
    SequenceDirectoryResponse,
    ShowErrorMessageRequest,
    getSTRequest,
    getSTResponse,
    CreateProjectRequest,
    ProjectDirResponse,
    CreateProjectResponse,
    ImportProjectRequest,
    ImportProjectResponse,
    ESBConfigsResponse,
    HighlightCodeRequest,
    AIUserInput,
    WriteContentToFileRequest,
    WriteContentToFileResponse,
    CreateLocalEntryRequest,
    CreateLocalEntryResponse,
    FileDirResponse,
    CreateInboundEndpointRequest,
    CreateInboundEndpointResponse,
    UndoRedoParams,
    CreateTaskRequest,
    CreateTaskResponse,
    GetTaskRequest,
    GetTaskResponse,
    GetDefinitionRequest,
    GetDefinitionResponse,
    GetTextAtRangeRequest,
    GetTextAtRangeResponse,
    GetDiagnosticsReqeust,
    GetDiagnosticsResponse,
    GetProjectRootRequest,
    BrowseFileResponse,
    CreateRegistryResourceRequest,
    CreateRegistryResourceResponse,
    BrowseFileRequest,
    CreateMessageProcessorRequest,
    CreateMessageProcessorResponse,
    RetrieveMessageProcessorRequest,
    RetrieveMessageProcessorResponse,
    CreateProxyServiceRequest,
    CreateProxyServiceResponse,
    CreateMessageStoreRequest,
    CreateMessageStoreResponse,
    GetMessageStoreRequest,
    GetMessageStoreResponse,
    CreateTemplateRequest,
    CreateTemplateResponse,
    RetrieveTemplateRequest,
    RetrieveTemplateResponse,
    GetAvailableResourcesRequest,
    GetAvailableResourcesResponse,
    GetInboundEndpointRequest,
    GetInboundEndpointResponse,
    GetWorkspaceContextResponse,
    GetProjectUuidResponse,
    CreateClassMediatorRequest,
    CreateClassMediatorResponse,
    UpdateHttpEndpointRequest,
    UpdateHttpEndpointResponse,
    RetrieveHttpEndpointRequest,
    RetrieveHttpEndpointResponse,
    TemplatesResponse,
    UpdateAddressEndpointRequest,
    UpdateAddressEndpointResponse,
    RetrieveAddressEndpointRequest,
    RetrieveAddressEndpointResponse,
    UpdateWsdlEndpointRequest,
    UpdateWsdlEndpointResponse,
    RetrieveWsdlEndpointRequest,
    RetrieveWsdlEndpointResponse,
    UpdateDefaultEndpointRequest,
    UpdateDefaultEndpointResponse,
    RetrieveDefaultEndpointRequest,
    RetrieveDefaultEndpointResponse,
    GetLocalEntryRequest,
    GetLocalEntryResponse,
    FileListRequest,
    FileListResponse,
    UpdateLoadBalanceEPRequest,
    UpdateLoadBalanceEPResponse,
    GetLoadBalanceEPRequest,
    GetLoadBalanceEPResponse,
    UpdateFailoverEPRequest,
    UpdateFailoverEPResponse,
    GetFailoverEPRequest,
    GetFailoverEPResponse,
    UpdateRecipientEPRequest,
    UpdateRecipientEPResponse,
    GetRecipientEPRequest,
    GetRecipientEPResponse,
    UpdateTemplateEPRequest,
    UpdateTemplateEPResponse,
    GetTemplateEPRequest,
    GetTemplateEPResponse,
    GetSelectiveWorkspaceContextResponse,
    GetBackendRootUrlResponse,
    ListRegistryArtifactsResponse,
    ListRegistryArtifactsRequest, RangeFormatRequest,
    MigrateProjectRequest,
    MigrateProjectResponse,
    DownloadConnectorResponse,
    DownloadConnectorRequest,
    GetAvailableConnectorRequest,
    GetAvailableConnectorResponse,
    GetConnectorFormRequest,
    GetConnectorFormResponse,
    UpdateConnectorRequest,
} from "./types";

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
    updateLoadBalanceEndpoint: (params: UpdateLoadBalanceEPRequest) => Promise<UpdateLoadBalanceEPResponse>;
    getLoadBalanceEndpoint: (params: GetLoadBalanceEPRequest) => Promise<GetLoadBalanceEPResponse>;
    updateFailoverEndpoint: (params: UpdateFailoverEPRequest) => Promise<UpdateFailoverEPResponse>;
    getFailoverEndpoint: (params: GetFailoverEPRequest) => Promise<GetFailoverEPResponse>;
    updateRecipientEndpoint: (params: UpdateRecipientEPRequest) => Promise<UpdateRecipientEPResponse>;
    getRecipientEndpoint: (params: GetRecipientEPRequest) => Promise<GetRecipientEPResponse>;
    updateTemplateEndpoint: (params: UpdateTemplateEPRequest) => Promise<UpdateTemplateEPResponse>;
    getTemplateEndpoint: (params: GetTemplateEPRequest) => Promise<GetTemplateEPResponse>;
    createLocalEntry: (params: CreateLocalEntryRequest) => Promise<CreateLocalEntryResponse>;
    getLocalEntry: (params: GetLocalEntryRequest) => Promise<GetLocalEntryResponse>;
    getEndpointsAndSequences: () => Promise<EndpointsAndSequencesResponse>;
    getTemplates: () => Promise<TemplatesResponse>;
    getSequenceDirectory: () => Promise<SequenceDirectoryResponse>;
    createSequence: (params: CreateSequenceRequest) => Promise<CreateSequenceResponse>;
    createMessageStore: (params: CreateMessageStoreRequest) => Promise<CreateMessageStoreResponse>;
    getMessageStore: (params: GetMessageStoreRequest) => Promise<GetMessageStoreResponse>;
    getXmlFileList: (params: FileListRequest) => Promise<FileListResponse>;
    createInboundEndpoint: (params: CreateInboundEndpointRequest) => Promise<CreateInboundEndpointResponse>;
    createMessageProcessor: (params: CreateMessageProcessorRequest) => Promise<CreateMessageProcessorResponse>;
    getMessageProcessor: (params: RetrieveMessageProcessorRequest) => Promise<RetrieveMessageProcessorResponse>;
    createProxyService: (params: CreateProxyServiceRequest) => Promise<CreateProxyServiceResponse>;
    createTask: (params: CreateTaskRequest) => Promise<CreateTaskResponse>;
    getTask: (params: GetTaskRequest) => Promise<GetTaskResponse>;
    createTemplate: (params: CreateTemplateRequest) => Promise<CreateTemplateResponse>;
    getTemplate: (params: RetrieveTemplateRequest) => Promise<RetrieveTemplateResponse>;
    getInboundEndpoint: (params: GetInboundEndpointRequest) => Promise<GetInboundEndpointResponse>;
    updateHttpEndpoint: (params: UpdateHttpEndpointRequest) => Promise<UpdateHttpEndpointResponse>;
    getHttpEndpoint: (params: RetrieveHttpEndpointRequest) => Promise<RetrieveHttpEndpointResponse>;
    updateAddressEndpoint: (params: UpdateAddressEndpointRequest) => Promise<UpdateAddressEndpointResponse>;
    getAddressEndpoint: (params: RetrieveAddressEndpointRequest) => Promise<RetrieveAddressEndpointResponse>;
    updateWsdlEndpoint: (params: UpdateWsdlEndpointRequest) => Promise<UpdateWsdlEndpointResponse>;
    getWsdlEndpoint: (params: RetrieveWsdlEndpointRequest) => Promise<RetrieveWsdlEndpointResponse>;
    updateDefaultEndpoint: (params: UpdateDefaultEndpointRequest) => Promise<UpdateDefaultEndpointResponse>;
    getDefaultEndpoint: (params: RetrieveDefaultEndpointRequest) => Promise<RetrieveDefaultEndpointResponse>;
    closeWebView: () => void;
    openDiagram: (params: OpenDiagramRequest) => void;
    openFile: (params: OpenDiagramRequest) => void;
    closeWebViewNotification: () => void;
    getWorkspaceRoot: () => Promise<ProjectRootResponse>;
    getProjectRoot: (params: GetProjectRootRequest) => Promise<ProjectRootResponse>;
    askProjectDirPath: () => Promise<ProjectDirResponse>;
    askProjectImportDirPath: () => Promise<ProjectDirResponse>;
    askFileDirPath: () => Promise<FileDirResponse>;
    createProject: (params: CreateProjectRequest) => Promise<CreateProjectResponse>;
    importProject: (params: ImportProjectRequest) => Promise<ImportProjectResponse>;
    migrateProject: (params: MigrateProjectRequest) => Promise<MigrateProjectResponse>;
    getAIResponse: (params: AIUserInput) => Promise<string>;
    writeContentToFile: (params: WriteContentToFileRequest) => Promise<WriteContentToFileResponse>;
    highlightCode: (params: HighlightCodeRequest) => void;
    getWorkspaceContext: () => Promise<GetWorkspaceContextResponse>;
    getProjectUuid: () => Promise<GetProjectUuidResponse>;
    initUndoRedoManager: (params: UndoRedoParams) => void;
    undo: (params: UndoRedoParams) => void;
    redo: (params: UndoRedoParams) => void;
    getDefinition: (params: GetDefinitionRequest) => Promise<GetDefinitionResponse>;
    getTextAtRange: (params: GetTextAtRangeRequest) => Promise<GetTextAtRangeResponse>;
    getDiagnostics: (params: GetDiagnosticsReqeust) => Promise<GetDiagnosticsResponse>;
    browseFile: (params: BrowseFileRequest) => Promise<BrowseFileResponse>;
    createRegistryResource: (params: CreateRegistryResourceRequest) => Promise<CreateRegistryResourceResponse>;
    getAvailableResources: (params: GetAvailableResourcesRequest) => Promise<GetAvailableResourcesResponse>;
    createClassMediator: (params: CreateClassMediatorRequest) => Promise<CreateClassMediatorResponse>;
    getSelectiveWorkspaceContext: () => Promise<GetSelectiveWorkspaceContextResponse>;
    getBackendRootUrl: () => Promise<GetBackendRootUrlResponse>;
    getAvailableRegistryResources: (params: ListRegistryArtifactsRequest) => Promise<ListRegistryArtifactsResponse>;
    rangeFormat: (params: RangeFormatRequest) => Promise<ApplyEditResponse>;
    downloadConnector: (params: DownloadConnectorRequest) => Promise<DownloadConnectorResponse>;
    getAvailableConnectors: (params: GetAvailableConnectorRequest) => Promise<GetAvailableConnectorResponse>;
    updateConnectors: (params: UpdateConnectorRequest) => Promise<void>;
    getConnectorForm: (params: GetConnectorFormRequest) => Promise<GetConnectorFormResponse>;
}
