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
    disableFormatting?: boolean;
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
    sessionTimeout: number;
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
    sessionTimeout: number;
    description: string;
    endpoints: { type: string; value: string; }[];
    properties: { name: string; value: string; scope: string; }[];
}

export interface UpdateFailoverEPRequest {
    directory: string;
    name: string;
    buildMessage: string;
    description: string;
    endpoints: { type: string; value: string; }[];
    properties: { name: string; value: string; scope: string; }[];
    getContentOnly: boolean;
}

export interface UpdateFailoverEPResponse {
    path: string;
    content: string;
}

export interface GetFailoverEPRequest {
    path: string;
}

export interface GetFailoverEPResponse {
    name: string;
    buildMessage: string;
    description: string;
    endpoints: { type: string; value: string; }[];
    properties: { name: string; value: string; scope: string; }[];
}

export interface UpdateRecipientEPRequest {
    directory: string;
    name: string;
    description: string;
    endpoints: { type: string; value: string; }[];
    properties: { name: string; value: string; scope: string; }[];
    getContentOnly: boolean;
}

export interface UpdateRecipientEPResponse {
    path: string;
    content: string;
}

export interface GetRecipientEPRequest {
    path: string;
}

export interface GetRecipientEPResponse {
    name: string;
    description: string;
    endpoints: { type: string; value: string; }[];
    properties: { name: string; value: string; scope: string; }[];
}

export interface UpdateTemplateEPRequest {
    directory: string;
    name: string;
    uri: string;
    template: string;
    description: string;
    parameters: { name: string; value: string; }[];
}

export interface UpdateTemplateEPResponse {
    path: string;
}

export interface GetTemplateEPRequest {
    path: string;
}

export interface GetTemplateEPResponse {
    name: string;
    uri: string;
    template: string;
    description: string;
    parameters: { name: string; value: string; }[];
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

export interface GetLocalEntryRequest {
    path: string;
}

export interface GetLocalEntryResponse {
    name: string;
    type: string;
    inLineTextValue: string;
    inLineXmlValue: string;
    sourceURL: string;
}
export interface FileDirResponse {
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
    sslEnabled: boolean;
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
    enableProducerGuaranteedDelivery: boolean;
    providerClass: string;
    customParameters: Record[];
    failOverMessageStore: string;
}

export interface GetMessageStoreRequest {
    path: string;
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

export interface MigrateProjectRequest {
    source: string;
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
    getContentOnly: boolean;
    statistics: boolean;
    trace: boolean;
}
export interface CreateSequenceResponse {
    fileContent: string;
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
    initialDuration: number;
    maximumDuration: number;
    progressionFactor: number;
    retryErrorCodes: string;
    retryCount: number;
    retryDelay: number;
    timeoutDuration: number;
    timeoutAction: string;
    templateName: string;
    requireTemplateParameters: boolean;
    templateParameters: any;
    getContentOnly: boolean;
}

export interface UpdateHttpEndpointResponse {
    path: string;
    content: string;
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
    initialDuration: number;
    maximumDuration: number;
    progressionFactor: number;
    retryErrorCodes: string;
    retryCount: number;
    retryDelay: number;
    timeoutDuration: number;
    timeoutAction: string;
    templateName: string;
    requireTemplateParameters: boolean;
    templateParameters: any;
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
    initialDuration: number;
    maximumDuration: number;
    progressionFactor: number;
    retryErrorCodes: string;
    retryCount: number;
    retryDelay: number;
    timeoutDuration: number;
    timeoutAction: string;
    templateName: string;
    requireTemplateParameters: boolean;
    templateParameters: any;
    getContentOnly: boolean;
}

export interface UpdateAddressEndpointResponse {
    path: string;
    content: string;
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
    initialDuration: number;
    maximumDuration: number;
    progressionFactor: number;
    retryErrorCodes: string;
    retryCount: number;
    retryDelay: number;
    timeoutDuration: number;
    timeoutAction: string;
    templateName: string;
    requireTemplateParameters: boolean;
    templateParameters: any;
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
    initialDuration: number;
    maximumDuration: number;
    progressionFactor: number;
    retryErrorCodes: string;
    retryCount: number;
    retryDelay: number;
    timeoutDuration: number;
    timeoutAction: string;
    templateName: string;
    requireTemplateParameters: boolean;
    templateParameters: any;
    getContentOnly: boolean;
}

export interface UpdateWsdlEndpointResponse {
    path: string;
    content: string;
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
    initialDuration: number;
    maximumDuration: number;
    progressionFactor: number;
    retryErrorCodes: string;
    retryCount: number;
    retryDelay: number;
    timeoutDuration: number;
    timeoutAction: string;
    templateName: string;
    requireTemplateParameters: boolean;
    templateParameters: any;
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
    initialDuration: number;
    maximumDuration: number;
    progressionFactor: number;
    retryErrorCodes: string;
    retryCount: number;
    retryDelay: number;
    timeoutDuration: number;
    timeoutAction: string;
    templateName: string;
    requireTemplateParameters: boolean;
    templateParameters: any;
    getContentOnly: boolean;
}

export interface UpdateDefaultEndpointResponse {
    path: string;
    content: string;
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
    initialDuration: number;
    maximumDuration: number;
    progressionFactor: number;
    retryErrorCodes: string;
    retryCount: number;
    retryDelay: number;
    timeoutDuration: number;
    timeoutAction: string;
    templateName: string;
    requireTemplateParameters: boolean;
    templateParameters: any;
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
    traceEnabled: boolean;
    statisticsEnabled: boolean;
    getContentOnly: boolean;
}

export interface CreateTemplateResponse {
    path: string;
    content: string;
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
    traceEnabled: boolean;
    statisticsEnabled: boolean;
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

export interface MigrateProjectResponse {
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

export interface GetSelectiveWorkspaceContextResponse {
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
    content?: string;
}

export interface CreateRegistryResourceResponse {
    path: string;
}

export interface BrowseFileResponse {
    filePath: string;
}

export interface BrowseFileRequest {
    canSelectFiles: boolean;
    canSelectFolders: boolean;
    canSelectMany: boolean;
    defaultUri: string;
    title: string;
}

export interface GetAvailableResourcesRequest {
    documentIdentifier: string;
    resourceType: "sequence" | "endpoint" | "messageStore" | "messageProcessor" | "task" | "sequenceTemplate" | "endpointTemplate" | "proxyService" |
    "dataService" | "dataSource" | "localEntry" | "dataMapper" | "js" | "json" | "smooksConfig" | "wsdl" | "ws_policy" | "xsd" | "xsl" | "xslt" | "yaml";
}

export interface GetAvailableResourcesResponse {
    resources: { [key: string]: any }[]
    registryResources: { [key: string]: any }[]
}

export interface CreateClassMediatorRequest {
    projectDirectory: string;
    packageName: string;
    className: string;
}

export interface CreateClassMediatorResponse {
    path: string;
}
export interface GetBackendRootUrlResponse {
    url: string;
}
export interface ListRegistryArtifactsRequest {
    path: string;
}
export interface ListRegistryArtifactsResponse {
    artifacts: RegistryArtifact[];
}
export interface RegistryArtifact {
    name: string;
    file: string;
    path: string;
    isCollection: boolean;
}
export interface RangeFormatRequest {
    uri: string;
    range: Range
}

export interface DownloadConnectorRequest {
    url: string;
    connector: string;
    version: string;
}

export interface DownloadConnectorResponse {
    path: string;
}

export interface GetAvailableConnectorRequest {
    documentUri: string;
    connectorName: string;
}

export interface GetAvailableConnectorResponse {
    connectors?: any[];
    name?: string;
    path?: string;
    uiSchemaPath?: string;
    version?: string;
    iconPath?: string;
}

export interface UpdateConnectorRequest {
    documentUri: string;
}

export interface GetConnectorFormRequest {
    uiSchemaPath: string;
    operation: string;
}

export interface GetConnectorFormResponse {
    formJSON: string;
}
export interface CreateDataSourceResponse {
    path: string;
}

export interface GetDataSourceRequest {
    path: string;
}

export interface DataSourceTemplate {
    name: string;
    projectDirectory: string;
    description?: string;
    jndiConfig?: JNDIDatasource;
    driverClassName?: string;
    url?: string;
    type: string;
    username?: string;
    password?: string;
    dataSourceConfigParameters?: { [key: string]: string | number | boolean };
    dataSourceProperties?: { [key: string]: string | number | boolean };
    externalDSClassName?: string;
    customDSType?: string;
    customDSConfiguration?: string;
}

export interface JNDIDatasource {
    useDataSourceFactory: boolean;
    properties?: { [key: string]: string | number | boolean };
    JNDIConfigName: string;
}

export interface GetIconPathUriRequest {
    path: string;
    name: string;
}

export interface GetIconPathUriResponse {
    uri: any;
}
