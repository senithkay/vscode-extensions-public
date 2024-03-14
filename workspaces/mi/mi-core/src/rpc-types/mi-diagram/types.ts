/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { Diagnostic, Position, TextDocumentIdentifier } from "vscode-languageserver-types";

interface Record {
    name: string;
    value: string;
}

export interface ApplyEditRequest {
    text: string;
    documentUri: string;
    range: Range;
}

export interface ApplyEditResponse {
    status: boolean;
}

export interface CreateAPIRequest {
    directory: string;
    name: string;
    context: string;
    swaggerDef: string;
    type: string;
    version: string;
}

export interface GetInboundEpDirRequest {
    path: string;

}

export interface CreateEndpointRequest {
    directory: string;
    name: string;
    type: string;
    configuration: string;
    address: string;
    uriTemplate: string;
    method: string;
    wsdlUri: string;
    wsdlService: string;
    wsdlPort: string;
    targetTemplate: string;
    uri: string;
}

export interface CreateEndpointResponse {
    path: string;
}

export interface UpdateLoadBalanceEPRequest {
    directory: string;
    name: string;
    algorithm: string;
    failover: string;
    buildMessage: string;
    sessionManagement: string;
    sessionTimeout: string;
    description: string;
    endpoints: { type: string; value: string; }[];
    properties: { name: string; value: string; scope: string; }[];
}

export interface UpdateLoadBalanceEPResponse {
    path: string;
}

export interface GetLoadBalanceEPRequest {
    path: string;
}

export interface GetLoadBalanceEPResponse {
    name: string;
    algorithm: string;
    failover: string;
    buildMessage: string;
    sessionManagement: string;
    sessionTimeout: string;
    description: string;
    endpoints: { type: string; value: string; }[];
    properties: { name: string; value: string; scope: string; }[];
}

export interface CreateInboundEndpointRequest {
    directory: string;
    name: string;
    type: string;
    sequence: string;
    errorSequence: string;
    parameters?: { [key: string]: string | number | boolean };
    additionalParameters?: { [key: string]: string | number | boolean };
}

export interface CreateInboundEndpointResponse {
    path: string;
}

export interface GetInboundEndpointResponse {
    name: string;
    type: string;
    sequence: string;
    errorSequence: string;
    parameters: { [key: string]: string | number | boolean };
    additionalParameters: { [key: string]: string | number | boolean };
}

export interface GetInboundEndpointRequest {
    path: string;
}

export interface CreateLocalEntryRequest {
    directory: string;
    name: string;
    type: string;
    value: string;
    URL: string;
}

export interface CreateLocalEntryResponse {
    path: string;
}

export interface GetLocalEntryRequest{
    path: string;
}

export interface GetLocalEntryResponse{
    name: string;
    type: string;
    inLineTextValue: string;
    inLineXmlValue: string;
    sourceURL: string;
}
export interface FileDirResponse  {
    path: string;
}

export interface CreateMessageStoreRequest {
    directory: string;
    name: string;
    type: string;
    initialContextFactory: string;
    providerURL: string;
    connectionFactory: string;
    jndiQueueName: string;
    userName: string;
    password: string;
    cacheConnection: string;
    jmsAPIVersion: string;
    rabbitMQServerHostName: string;
    rabbitMQServerPort: string;
    sslEnabled: string;
    trustStoreLocation: string;
    trustStoreType: string;
    trustStorePassword: string;
    keyStoreLocation: string;
    keyStoreType: string;
    keyStorePassword: string;
    sslVersion: string;
    rabbitMQQueueName: string;
    rabbitMQExchangeName: string;
    routineKey: string;
    virtualHost: string;
    dataBaseTable: string;
    driver: string;
    url: string;
    user: string;
    dataSourceName: string;
    queueConnectionFactory: string;
    pollingCount: string;
    xPath: string;
    enableProducerGuaranteedDelivery: string;
    providerClass: string;
    customParameters: Record[];
    failOverMessageStore: string;
}

export interface CreateMessageStoreResponse {
    path: string;
}

export interface GetMessageStoreResponse {
    name: string;
    type: string;
    initialContextFactory: string;
    providerURL: string;
    connectionFactory: string;
    jndiQueueName: string;
    userName: string;
    password: string;
    cacheConnection: string;
    jmsAPIVersion: string;
    rabbitMQServerHostName: string;
    rabbitMQServerPort: string;
    sslEnabled: string;
    trustStoreLocation: string;
    trustStoreType: string;
    trustStorePassword: string;
    keyStoreLocation: string;
    keyStoreType: string;
    keyStorePassword: string;
    sslVersion: string;
    rabbitMQQueueName: string;
    rabbitMQExchangeName: string;
    routineKey: string;
    virtualHost: string;
    dataBaseTable: string;
    driver: string;
    url: string;
    user: string;
    dataSourceName: string;
    queueConnectionFactory: string;
    pollingCount: string;
    xPath: string;
    enableProducerGuaranteedDelivery: string;
    providerClass: string;
    customParameters: Record[];
    failOverMessageStore: string;
}

export interface GetMessageStoreRequest {
    path: string;
}

export interface FileListRequest {
    path: string;
}

export interface FileListResponse {
    files: string[];
}

export interface CreateProjectRequest {
    directory: string;
    name: string;
    open: boolean;
    groupID?: string;
    artifactID?: string;
}

export interface ImportProjectRequest {
    source: string;
    directory: string;
    open: boolean;
}

export interface Connector {
    path: string;
    name: string;
    description: string;
    icon: string;
}
export interface ConnectorsResponse {
    data: Connector[];
}

export interface ESBConfigsResponse {
    data: string[];
}

export interface CommandsRequest {
    commands: any[];
}

export interface CommandsResponse {
    data: string;
}

export interface getSTRequest {
    documentUri: string;
}
export interface getSTResponse {
    syntaxTree: any;
    defFilePath: string;
}

export interface GetProjectRootRequest {
    path: string;

}

export interface ConnectorRequest {
    path: string;
}
export interface ConnectorResponse {
    data: string[];
}

export interface ApiDirectoryResponse {
    data: string;
}

export interface EndpointDirectoryResponse {
    data: string;
}

export interface ShowErrorMessageRequest {
    message: string;
}

export interface OpenDiagramRequest {
    path: string;
}

export interface CreateAPIResponse {
    path: string;
}

export interface EndpointsAndSequencesResponse {
    data: any;
}

export interface TemplatesResponse {
    data: any;
}

export interface SequenceDirectoryResponse {
    data: string;
}

export interface CreateSequenceRequest {
    directory: string;
    name: string;
    endpoint: string;
    onErrorSequence: string;
}
export interface CreateSequenceResponse {
    filePath: string;
}

export interface CreateMessageProcessorRequest {
    directory: string;
    messageProcessorName: string;
    messageProcessorType: string;
    messageStoreType: string;
    failMessageStoreType: string;
    sourceMessageStoreType: string;
    targetMessageStoreType: string;
    processorState: string;
    dropMessageOption: string;
    quartzConfigPath: string;
    cron: string;
    forwardingInterval: number | null;
    retryInterval: number | null;
    maxRedeliveryAttempts: number | null;
    maxConnectionAttempts: number | null;
    connectionAttemptInterval: number | null;
    taskCount: number | null;
    statusCodes: string;
    clientRepository: string;
    axis2Config: string;
    endpointType: string;
    sequenceType: string;
    replySequenceType: string;
    faultSequenceType: string;
    deactivateSequenceType: string;
    endpoint: string;
    sequence: string;
    replySequence: string;
    faultSequence: string;
    deactivateSequence: string;
    samplingInterval: number | null;
    samplingConcurrency: number | null;
    providerClass: string;
    properties: any;
}

export interface CreateMessageProcessorResponse {
    path: string;
}

export interface RetrieveMessageProcessorRequest {
    path: string;
}

export interface RetrieveMessageProcessorResponse {
    messageProcessorName: string;
    messageProcessorType: string;
    messageStoreType: string;
    failMessageStoreType: string;
    sourceMessageStoreType: string;
    targetMessageStoreType: string;
    processorState: string;
    dropMessageOption: string;
    quartzConfigPath: string;
    cron: string;
    forwardingInterval: number | null;
    retryInterval: number | null;
    maxRedeliveryAttempts: number | null;
    maxConnectionAttempts: number | null;
    connectionAttemptInterval: number | null;
    taskCount: number | null;
    statusCodes: string;
    clientRepository: string;
    axis2Config: string;
    endpointType: string;
    sequenceType: string;
    replySequenceType: string;
    faultSequenceType: string;
    deactivateSequenceType: string;
    endpoint: string;
    sequence: string;
    replySequence: string;
    faultSequence: string;
    deactivateSequence: string;
    samplingInterval: number | null;
    samplingConcurrency: number | null;
    providerClass: string;
    properties: any;
    hasCustomProperties: boolean;
}

export interface CreateProxyServiceRequest {
    directory: string;
    proxyServiceName: string;
    proxyServiceType: string;
    selectedTransports: string;
    endpointType: string;
    endpoint: string;
    requestLogLevel: string;
    responseLogLevel: string;
    securityPolicy: string;
    requestXslt: string;
    responseXslt: string;
    transformResponse: string;
    wsdlUri: string;
    wsdlService: string;
    wsdlPort: number | null;
    publishContract: string;
}

export interface CreateProxyServiceResponse {
    path: string;
}

export interface UpdateHttpEndpointRequest {
    directory: string;
    endpointName: string;
    traceEnabled: string;
    statisticsEnabled: string;
    uriTemplate: string;
    httpMethod: string;
    description: string;
    requireProperties: boolean;
    properties: any;
    authType: string;
    basicAuthUsername: string;
    basicAuthPassword: string;
    authMode: string;
    grantType: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    tokenUrl: string;
    username: string;
    password: string;
    requireOauthParameters: boolean;
    oauthProperties: any;
    addressingEnabled: string;
    addressingVersion: string;
    addressListener: string;
    securityEnabled: string;
    suspendErrorCodes: string;
    initialDuration: string;
    maximumDuration: string;
    progressionFactor: string;
    retryErrorCodes: string;
    retryCount: string;
    retryDelay: string;
    timeoutDuration: string;
    timeoutAction: string;
}

export interface UpdateHttpEndpointResponse {
    path: string;
}

export interface RetrieveHttpEndpointRequest {
    path: string;
}

export interface RetrieveHttpEndpointResponse {
    endpointName: string;
    traceEnabled: string;
    statisticsEnabled: string;
    uriTemplate: string;
    httpMethod: string;
    description: string;
    requireProperties: boolean;
    properties: any;
    authType: string;
    basicAuthUsername: string;
    basicAuthPassword: string;
    authMode: string;
    grantType: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    tokenUrl: string;
    username: string;
    password: string;
    requireOauthParameters: boolean;
    oauthProperties: any;
    addressingEnabled: string;
    addressingVersion: string;
    addressListener: string;
    securityEnabled: string;
    suspendErrorCodes: string;
    initialDuration: string;
    maximumDuration: string;
    progressionFactor: string;
    retryErrorCodes: string;
    retryCount: string;
    retryDelay: string;
    timeoutDuration: string;
    timeoutAction: string;
}

export interface UpdateAddressEndpointRequest {
    directory: string;
    endpointName: string;
    format: string;
    traceEnabled: string;
    statisticsEnabled: string;
    uri: string;
    optimize: string;
    description: string;
    requireProperties: boolean;
    properties: any;
    addressingEnabled: string;
    addressingVersion: string;
    addressListener: string;
    securityEnabled: string;
    suspendErrorCodes: string;
    initialDuration: string;
    maximumDuration: string;
    progressionFactor: string;
    retryErrorCodes: string;
    retryCount: string;
    retryDelay: string;
    timeoutDuration: string;
    timeoutAction: string;
}

export interface UpdateAddressEndpointResponse {
    path: string;
}

export interface RetrieveAddressEndpointRequest {
    path: string;
}

export interface RetrieveAddressEndpointResponse {
    endpointName: string;
    format: string;
    traceEnabled: string;
    statisticsEnabled: string;
    uri: string;
    optimize: string;
    description: string;
    requireProperties: boolean;
    properties: any;
    addressingEnabled: string;
    addressingVersion: string;
    addressListener: string;
    securityEnabled: string;
    suspendErrorCodes: string;
    initialDuration: string;
    maximumDuration: string;
    progressionFactor: string;
    retryErrorCodes: string;
    retryCount: string;
    retryDelay: string;
    timeoutDuration: string;
    timeoutAction: string;
}

export interface UpdateWsdlEndpointRequest {
    directory: string;
    endpointName: string;
    format: string;
    traceEnabled: string;
    statisticsEnabled: string;
    optimize: string;
    description: string;
    wsdlUri: string;
    wsdlService: string;
    wsdlPort: string;
    requireProperties: boolean;
    properties: any;
    addressingEnabled: string;
    addressingVersion: string;
    addressListener: string;
    securityEnabled: string;
    suspendErrorCodes: string;
    initialDuration: string;
    maximumDuration: string;
    progressionFactor: string;
    retryErrorCodes: string;
    retryCount: string;
    retryDelay: string;
    timeoutDuration: string;
    timeoutAction: string;
}

export interface UpdateWsdlEndpointResponse {
    path: string;
}

export interface RetrieveWsdlEndpointRequest {
    path: string;
}

export interface RetrieveWsdlEndpointResponse {
    endpointName: string;
    format: string;
    traceEnabled: string;
    statisticsEnabled: string;
    optimize: string;
    description: string;
    wsdlUri: string;
    wsdlService: string;
    wsdlPort: string;
    requireProperties: boolean;
    properties: any;
    addressingEnabled: string;
    addressingVersion: string;
    addressListener: string;
    securityEnabled: string;
    suspendErrorCodes: string;
    initialDuration: string;
    maximumDuration: string;
    progressionFactor: string;
    retryErrorCodes: string;
    retryCount: string;
    retryDelay: string;
    timeoutDuration: string;
    timeoutAction: string;
}

export interface UpdateDefaultEndpointRequest {
    directory: string;
    endpointName: string;
    format: string;
    traceEnabled: string;
    statisticsEnabled: string;
    optimize: string;
    description: string;
    requireProperties: boolean;
    properties: any;
    addressingEnabled: string;
    addressingVersion: string;
    addressListener: string;
    securityEnabled: string;
    suspendErrorCodes: string;
    initialDuration: string;
    maximumDuration: string;
    progressionFactor: string;
    retryErrorCodes: string;
    retryCount: string;
    retryDelay: string;
    timeoutDuration: string;
    timeoutAction: string;
}

export interface UpdateDefaultEndpointResponse {
    path: string;
}

export interface RetrieveDefaultEndpointRequest {
    path: string;
}

export interface RetrieveDefaultEndpointResponse {
    endpointName: string;
    format: string;
    traceEnabled: string;
    statisticsEnabled: string;
    optimize: string;
    description: string;
    requireProperties: boolean;
    properties: any;
    addressingEnabled: string;
    addressingVersion: string;
    addressListener: string;
    securityEnabled: string;
    suspendErrorCodes: string;
    initialDuration: string;
    maximumDuration: string;
    progressionFactor: string;
    retryErrorCodes: string;
    retryCount: string;
    retryDelay: string;
    timeoutDuration: string;
    timeoutAction: string;
}

export interface CreateTaskRequest {
    directory: string;
    name: string;
    group: string;
    implementation: string;
    pinnedServers: string;
    triggerType: "simple" | "cron";
    triggerCount: number;
    triggerInterval: number;
    triggerCron: string;
}

export interface CreateTaskResponse {
    path: string;
}

export interface GetTaskRequest {
    path: string;
}

export interface GetTaskResponse {
    name: string;
    group: string;
    implementation: string;
    pinnedServers: string;
    triggerType: "simple" | "cron";
    triggerCount: number;
    triggerInterval: number;
    triggerCron: string;
}

export interface CreateTemplateRequest {
    directory: string;
    templateName: string;
    templateType: string;
    address: string;
    uriTemplate: string;
    httpMethod: string;
    wsdlUri: string;
    wsdlService: string;
    wsdlPort: number | null;
}

export interface CreateTemplateResponse {
    path: string;
}

export interface RetrieveTemplateRequest {
    path: string;
}

export interface RetrieveTemplateResponse {
    templateName: string;
    templateType: string;
    address: string;
    uriTemplate: string;
    httpMethod: string;
    wsdlUri: string;
    wsdlService: string;
    wsdlPort: number | null;
}

export interface ProjectRootResponse {
    path: string;
}

export interface ProjectDirResponse {
    path: string;
}

export interface CreateProjectResponse {
    filePath: string;
}

export interface ImportProjectResponse {
    filePath: string;
}

export interface FileStructure {
    [key: string]: string | FileStructure;
}

export interface ChatEntry {
    role: string;
    content: string;
}

export interface AIUserInput {
    chat_history: ChatEntry[];
}

export interface WriteContentToFileRequest {
    content: string[];
}

export interface WriteContentToFileResponse {
    status: boolean;
}

export interface HighlightCodeRequest {
    range: Range;
    force?: boolean;
}


export interface GetWorkspaceContextResponse {
    context: string[];
}

export interface GetProjectUuidResponse {
    uuid: string;
}

export interface UndoRedoParams {
    path: string;
}

export interface GetDefinitionRequest {
    document: TextDocumentIdentifier;
    position: Position;
}

export interface GetDefinitionResponse {
    uri: string,
    range: Range
}

export interface GetTextAtRangeRequest {
    documentUri: string;
    range: Range;
}

export interface GetTextAtRangeResponse {
    text: string | undefined;
}

export interface GetDiagnosticsReqeust {
    documentUri: string;
}

export interface GetDiagnosticsResponse {
    documentUri: string;
    diagnostics: Diagnostic[];
}

export interface CreateRegistryResourceRequest {
    projectDirectory: string;
    templateType: string;
    filePath: string;
    resourceName: string;
    artifactName: string;
    registryPath: string;
    registryRoot: string;
    createOption: string;
}

export interface CreateRegistryResourceResponse {
    path: string;
}

export interface BrowseFileResponse {
    filePath: string;
}

export interface BrowseFileRequest {
    dialogTitle: string;
}

export interface GetAvailableResourcesRequest {
    documentIdentifier: string;
    resourceType: "sequence" | "endpoint" | "messageStore" | "messageProcessor" | "task" | "sequenceTemplate" | "endpointTemplate";
}

export interface GetAvailableResourcesResponse {
    resources: { [key: string]: any }[]
}

export interface CreateClassMediatorRequest {
    projectDirectory: string;
    packageName: string;
    className: string;
}

export interface CreateClassMediatorResponse {
    path: string;
}
