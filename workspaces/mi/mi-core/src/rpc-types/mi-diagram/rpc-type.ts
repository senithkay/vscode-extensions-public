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
    CreateDataSourceResponse,
    DataSourceTemplate,
    GetDataSourceRequest,
    GetIconPathUriRequest,
    GetIconPathUriResponse,
    GetUserAccessTokenResponse,
    CreateConnectionRequest,
    CreateConnectionResponse,
    GetConnectorConnectionsRequest,
    GetConnectorConnectionsResponse,
    GetAllRegistryPathsRequest,
    GetAllRegistryPathsResponse,
    GetAllArtifactsRequest,
    GetAllArtifactsResponse,
} from "./types";
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
export const createEndpoint: RequestType<CreateEndpointRequest, CreateEndpointResponse> = { method: `${_preFix}/createEndpoint` };
export const updateLoadBalanceEndpoint: RequestType<UpdateLoadBalanceEPRequest, UpdateLoadBalanceEPResponse> = { method: `${_preFix}/updateLoadBalanceEndpoint` };
export const getLoadBalanceEndpoint: RequestType<GetLoadBalanceEPRequest, GetLoadBalanceEPResponse> = { method: `${_preFix}/getLoadBalanceEndpoint` };
export const updateFailoverEndpoint: RequestType<UpdateFailoverEPRequest, UpdateFailoverEPResponse> = { method: `${_preFix}/updateFailoverEndpoint` };
export const getFailoverEndpoint: RequestType<GetFailoverEPRequest, GetFailoverEPResponse> = { method: `${_preFix}/getFailoverEndpoint` };
export const updateRecipientEndpoint: RequestType<UpdateRecipientEPRequest, UpdateRecipientEPResponse> = { method: `${_preFix}/updateRecipientEndpoint` };
export const getRecipientEndpoint: RequestType<GetRecipientEPRequest, GetRecipientEPResponse> = { method: `${_preFix}/getRecipientEndpoint` };
export const updateTemplateEndpoint: RequestType<UpdateTemplateEPRequest, UpdateTemplateEPResponse> = { method: `${_preFix}/updateTemplateEndpoint` };
export const getTemplateEndpoint: RequestType<GetTemplateEPRequest, GetTemplateEPResponse> = { method: `${_preFix}/getTemplateEndpoint` };
export const createLocalEntry: RequestType<CreateLocalEntryRequest, CreateLocalEntryResponse> = { method: `${_preFix}/createLocalEntry` };
export const getLocalEntry: RequestType<GetLocalEntryRequest, GetLocalEntryResponse> = { method: `${_preFix}/getLocalEntry` };
export const getEndpointsAndSequences: RequestType<void, EndpointsAndSequencesResponse> = { method: `${_preFix}/getEndpointsAndSequences` };
export const getTemplates: RequestType<void, TemplatesResponse> = { method: `${_preFix}/getTemplates` };
export const getSequenceDirectory: RequestType<void, SequenceDirectoryResponse> = { method: `${_preFix}/getSequenceDirectory` };
export const createSequence: RequestType<CreateSequenceRequest, CreateSequenceResponse> = { method: `${_preFix}/createSequence` };
export const createMessageStore: RequestType<CreateMessageStoreRequest, CreateMessageStoreResponse> = { method: `${_preFix}/createMessageStore` };
export const getMessageStore: RequestType<GetMessageStoreRequest, GetMessageStoreResponse> = { method: `${_preFix}/getMessageStore` };
export const createInboundEndpoint: RequestType<CreateInboundEndpointRequest, CreateInboundEndpointResponse> = { method: `${_preFix}/createInboundEndpoint` };
export const createMessageProcessor: RequestType<CreateMessageProcessorRequest, CreateMessageProcessorResponse> = { method: `${_preFix}/createMessageProcessor` };
export const getMessageProcessor: RequestType<RetrieveMessageProcessorRequest, RetrieveMessageProcessorResponse> = { method: `${_preFix}/getMessageProcessor` };
export const createProxyService: RequestType<CreateProxyServiceRequest, CreateProxyServiceResponse> = { method: `${_preFix}/createProxyService` };
export const createTask: RequestType<CreateTaskRequest, CreateTaskResponse> = { method: `${_preFix}/createTask` };
export const getTask: RequestType<GetTaskRequest, GetTaskResponse> = { method: `${_preFix}/getTask` };
export const createTemplate: RequestType<CreateTemplateRequest, CreateTemplateResponse> = { method: `${_preFix}/createTemplate` };
export const getTemplate: RequestType<RetrieveTemplateRequest, RetrieveTemplateResponse> = { method: `${_preFix}/getTemplate` };
export const getInboundEndpoint: RequestType<GetInboundEndpointRequest, GetInboundEndpointResponse> = { method: `${_preFix}/getInboundEndpoint` };
export const updateHttpEndpoint: RequestType<UpdateHttpEndpointRequest, UpdateHttpEndpointResponse> = { method: `${_preFix}/updateHttpEndpoint` };
export const getHttpEndpoint: RequestType<RetrieveHttpEndpointRequest, RetrieveHttpEndpointResponse> = { method: `${_preFix}/getHttpEndpoint` };
export const updateAddressEndpoint: RequestType<UpdateAddressEndpointRequest, UpdateAddressEndpointResponse> = { method: `${_preFix}/updateAddressEndpoint` };
export const getAddressEndpoint: RequestType<RetrieveAddressEndpointRequest, RetrieveAddressEndpointResponse> = { method: `${_preFix}/getAddressEndpoint` };
export const updateWsdlEndpoint: RequestType<UpdateWsdlEndpointRequest, UpdateWsdlEndpointResponse> = { method: `${_preFix}/updateWsdlEndpoint` };
export const getWsdlEndpoint: RequestType<RetrieveWsdlEndpointRequest, RetrieveWsdlEndpointResponse> = { method: `${_preFix}/getWsdlEndpoint` };
export const updateDefaultEndpoint: RequestType<UpdateDefaultEndpointRequest, UpdateDefaultEndpointResponse> = { method: `${_preFix}/updateDefaultEndpoint` };
export const getDefaultEndpoint: RequestType<RetrieveDefaultEndpointRequest, RetrieveDefaultEndpointResponse> = { method: `${_preFix}/getDefaultEndpoint` };
export const closeWebView: NotificationType<void> = { method: `${_preFix}/closeWebView` };
export const openDiagram: NotificationType<OpenDiagramRequest> = { method: `${_preFix}/openDiagram` };
export const openFile: NotificationType<OpenDiagramRequest> = { method: `${_preFix}/openFile` };
export const closeWebViewNotification: NotificationType<void> = { method: `${_preFix}/closeWebViewNotification` };
export const getWorkspaceRoot: RequestType<void, ProjectRootResponse> = { method: `${_preFix}/getWorkspaceRoot` };
export const getProjectRoot: RequestType<GetProjectRootRequest, ProjectRootResponse> = { method: `${_preFix}/getProjectRoot` };
export const askProjectDirPath: RequestType<void, ProjectDirResponse> = { method: `${_preFix}/askProjectDirPath` };
export const askProjectImportDirPath: RequestType<void, ProjectDirResponse> = { method: `${_preFix}/askProjectImportDirPath` };
export const askFileDirPath: RequestType<void, FileDirResponse> = { method: `${_preFix}/askFileDirPath` };
export const createProject: RequestType<CreateProjectRequest, CreateProjectResponse> = { method: `${_preFix}/createProject` };
export const importProject: RequestType<ImportProjectRequest, ImportProjectResponse> = { method: `${_preFix}/importProject` };
export const migrateProject: RequestType<MigrateProjectRequest, MigrateProjectResponse> = { method: `${_preFix}/migrateProject` };
export const getAIResponse: RequestType<AIUserInput, string> = { method: `${_preFix}/getAIResponse` };
export const writeContentToFile: RequestType<WriteContentToFileRequest, WriteContentToFileResponse> = { method: `${_preFix}/writeContentToFile` };
export const highlightCode: NotificationType<HighlightCodeRequest> = { method: `${_preFix}/highlightCode` };
export const getWorkspaceContext: RequestType<void, GetWorkspaceContextResponse> = { method: `${_preFix}/getWorkspaceContext` };
export const getProjectUuid: RequestType<void, GetProjectUuidResponse> = { method: `${_preFix}/getProjectUuid` };
export const initUndoRedoManager: NotificationType<UndoRedoParams> = { method: `${_preFix}/initUndoRedoManager` };
export const undo: NotificationType<UndoRedoParams> = { method: `${_preFix}/undo` };
export const redo: NotificationType<UndoRedoParams> = { method: `${_preFix}/redo` };
export const getDefinition: RequestType<GetDefinitionRequest, GetDefinitionResponse> = { method: `${_preFix}/getDefinition` };
export const getTextAtRange: RequestType<GetTextAtRangeRequest, GetTextAtRangeResponse> = { method: `${_preFix}/getTextAtRange` };
export const getDiagnostics: RequestType<GetDiagnosticsReqeust, GetDiagnosticsResponse> = { method: `${_preFix}/getDiagnostics` };
export const browseFile: RequestType<BrowseFileRequest, BrowseFileResponse> = { method: `${_preFix}/browseFile` };
export const createRegistryResource: RequestType<CreateRegistryResourceRequest, CreateRegistryResourceResponse> = { method: `${_preFix}/createRegistryResource` };
export const getAvailableResources: RequestType<GetAvailableResourcesRequest, GetAvailableResourcesResponse> = { method: `${_preFix}/getAvailableResources` };
export const createClassMediator: RequestType<CreateClassMediatorRequest, CreateClassMediatorResponse> = { method: `${_preFix}/createClassMediator` };
export const getSelectiveWorkspaceContext: RequestType<void, GetSelectiveWorkspaceContextResponse> = { method: `${_preFix}/getSelectiveWorkspaceContext` };
export const getBackendRootUrl: RequestType<void, GetBackendRootUrlResponse> = { method: `${_preFix}/getBackendRootUrl` };
export const getAvailableRegistryResources: RequestType<ListRegistryArtifactsRequest, ListRegistryArtifactsResponse> = { method: `${_preFix}/getAvailableRegistryResources` };
export const rangeFormat: RequestType<RangeFormatRequest, ApplyEditResponse> = { method: `${_preFix}/rangeFormat` };
export const downloadConnector: RequestType<DownloadConnectorRequest, DownloadConnectorResponse> = { method: `${_preFix}/downloadConnector` };
export const getAvailableConnectors: RequestType<GetAvailableConnectorRequest, GetAvailableConnectorResponse> = { method: `${_preFix}/getAvailableConnectors` };
export const updateConnectors: NotificationType<UpdateConnectorRequest> = { method: `${_preFix}/updateConnectors` };
export const getConnectorForm: RequestType<GetConnectorFormRequest, GetConnectorFormResponse> = { method: `${_preFix}/getConnectorForm` };
export const createDataSource: RequestType<DataSourceTemplate, CreateDataSourceResponse> = { method: `${_preFix}/createDataSource` };
export const getDataSource: RequestType<GetDataSourceRequest, DataSourceTemplate> = { method: `${_preFix}/getDataSource` };
export const getIconPathUri: RequestType<GetIconPathUriRequest, GetIconPathUriResponse> = { method: `${_preFix}/getIconPathUri` };
export const getUserAccessToken: RequestType<void, GetUserAccessTokenResponse> = { method: `${_preFix}/getUserAccessToken` };
export const createConnection: RequestType<CreateConnectionRequest, CreateConnectionResponse> = { method: `${_preFix}/createConnection` };
export const getConnectorConnections: RequestType<GetConnectorConnectionsRequest, GetConnectorConnectionsResponse> = { method: `${_preFix}/getConnectorConnections` };
export const getAllRegistryPaths: RequestType<GetAllRegistryPathsRequest, GetAllRegistryPathsResponse> = { method: `${_preFix}/getAllRegistryPaths` };
export const getAllArtifacts: RequestType<GetAllArtifactsRequest, GetAllArtifactsResponse> = { method: `${_preFix}/getAllArtifacts` };
