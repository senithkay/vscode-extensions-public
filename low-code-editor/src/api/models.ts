/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: no-empty-interface
export const APP_TYPE_JOB = "Schedule";
export const APP_TYPE_API = "API";
export const APP_TYPE_CUSTOM = "Custom";
export const APP_TYPE_EXTERNAL = "External";
export const APP_TYPE_WEBHOOK = "Webhook";
export const APP_TYPE_MANUAL = "Manual";
export const APP_TYPE_EMAIL = "Email";
export const APP_TYPE_SERVICE_DRAFT = "Service Draft";
export const APP_TYPE_INTEGRATION_DRAFT = "Integration Draft";
export const TYPE_INTEGRATION = "Integration";
export const TYPE_SERVICE = "Service";
export const TYPE_API = "API";
export const APP_CODE = "Code";
export const APP_ANALYZE = "Analyze";
export const APP_SETTINGS = "Settings";
export const TYPE_REMOTE = 'Remote App';

export type AppType = typeof APP_TYPE_JOB | typeof APP_TYPE_API | typeof APP_TYPE_CUSTOM | typeof APP_TYPE_WEBHOOK
    | typeof APP_TYPE_MANUAL | typeof APP_TYPE_EMAIL | typeof APP_TYPE_SERVICE_DRAFT | typeof APP_TYPE_INTEGRATION_DRAFT | typeof APP_TYPE_EXTERNAL;
export type ArtifactType = typeof TYPE_INTEGRATION | typeof TYPE_SERVICE | typeof TYPE_API | typeof APP_TYPE_SERVICE_DRAFT | typeof APP_TYPE_INTEGRATION_DRAFT | typeof TYPE_REMOTE;

export const LOG_LEVEL_TRACE = "TRACE";
export const LOG_LEVEL_DEBUG = "DEBUG";
export const LOG_LEVEL_INFO = "INFO";
export const LOG_LEVEL_WARN = "WARN";
export const LOG_LEVEL_ERROR = "ERROR";

export type LogLevel = typeof LOG_LEVEL_TRACE | typeof LOG_LEVEL_DEBUG | typeof LOG_LEVEL_INFO | typeof LOG_LEVEL_WARN
    | typeof LOG_LEVEL_ERROR;

export const STAGE_QUEUED = "queued"
export const STAGE_IN_PROGRESS = "in_progress"
export const STAGE_SUCCESS = "success"
export const STAGE_FAILURE = "failure"
export const STAGE_SKIPPED = "skipped"
export const STAGE_UNDEFINED = "undefined"

export const CONNECTION_TYPE_CONNECTED = "Connected";

export type DEPLOY_STATE = typeof STAGE_QUEUED | typeof STAGE_IN_PROGRESS |
    typeof STAGE_SUCCESS | typeof STAGE_FAILURE | typeof STAGE_SKIPPED | typeof STAGE_UNDEFINED;

export interface LogMessage {
    type: "control" | "data" | "error",
    message: {
        type: "STDOUT" | "STDERR",
        data?: string
    }
}

export interface DeployDataMessage {
    Build: {
        state?: DEPLOY_STATE;
    }
    Checkout: {
        state?: DEPLOY_STATE;
    }
    Deploy: {
        state?: DEPLOY_STATE;
    }
}

export interface DeployLogMessage {
    type: "control" | "data" | "error",
    msg: DeployDataMessage | string
}

export interface DeployLogs {
    appId: number,
    Organization: string,
    appName: string,
    buildId: string,
    logs: string,
}


export interface EnvInfo {
    observabilityUrl: string;
    accessUrl: string;
    status: "running" | "stopped" | "deploy in progress" | "undeploy in progress" | "pending";
}

export interface AppRuntimeInfo {
    test: EnvInfo;
    prod: EnvInfo;
}

export interface OnPremKeyModel {
    displayName: string,
    key?: string,
    handle?: string
    status?: string
}

export interface GroupTags {
    handle: string
}

export interface GroupModel {
    displayName: string;
    description: string;
    tags: GroupTags[];
    createdAt?: string;
    handle?: string;
    users: any;
    defaultGroup?: boolean;
}

export interface InvitationMemberModel {
    email: string,
    handle: string,
    groups: string[]
}

export interface MemberForGroupModel {
    id: number,
    description: string,
    defaultGroup: string,
    displayName: string,
    handle: string
}

export interface MemberModel {
    id: number,
    idpId: string,
    pictureUrl: string,
    email: string,
    displayName: string,
    groups: MemberForGroupModel[]
}

export interface SubscriptionModel {
    id: number,
    orgName: string,
    plan: string,
    isExpired: boolean,
    startDate: string,
    endDate: string,
}

export interface InviteMembers {
    application: string;
    emails: string[];
    groups: string[]
}

export interface WorkspaceInfo {
    langServerUrl?: string;
}

export interface ObservabilityDetails {
    observabilityId: string;
    latestVersion: string;
}

export type DeploymentType = "Job" | "Service" | "Custom";

export interface AppPatchData {
    displayType?: AppType;
    deployType?: DeploymentType;
    displayName?: string;
    cronSchedule?: string;
}

export interface AppInfo {
    id: number;
    name: string;
    displayName: string;
    workingFile: string;
    org: string,
    organizationId: number;
    template: AppType;
    displayType?: AppType;
    deployType?: DeploymentType;
    preBuilt?: boolean;
    sampleReference?: string;
    dockerImage?: string;
    observability?: ObservabilityDetails;
    gitRemote?: string;
    status?: string;
    workspace?: WorkspaceInfo;
    createdAt: string;
    cronSchedule?: string;
    type?: string;
}

export interface AppQuotaResponse {
    isIntegrationThrottled: boolean;
    isServiceThrottled: boolean;
}

export interface PerformanceAnalysis {
    sequenceDiagramData: SequenceDiagramAnalysisData[],
    graphData: GraphAnalysisData[]
}

export interface SequenceDiagramAnalysisData {
    concurrency: number,
    thinkTime: number,
    values: SequenceAnalysisDataPoint[]
}

export interface SequenceAnalysisDataPoint {
    latency: number,
    name: string,
    tps: number
}

export interface GraphAnalysisData {
    concurrency: number,
    latency?: number,
    thinkTime?: number,
    tps?: number
}

export interface ServiceAnalysis {
    sequenceDiagramData: SequenceDiagramAnalysisData[],
    graphData: GraphAnalysisData[]
}

export interface AnalyzerErrorMessage {
    type: "error" | "info",
    message: "NO_DATA" | "ESTIMATOR_ERROR" | "COMMUNICATION_ISSUE" | "MODEL_NOT_FOUND" | "SOURCE_NOT_FOUND",
}

export interface JobAnalysis {
    sequenceDiagramData: SequenceDiagramAnalysisData[],
    graphData: GraphAnalysisData[]
}

export interface AppStatus {
    status: "running" | "stopped";
}

export interface ApplicationFile {
    type: "File" | "Folder"
    path: string,
    size: number,
    content: string
}

export interface Organization {
    id: number;
    name: string;
    handle: string;
    uuid: string;
}

export interface TimeRange {
    from: Date;
    to: Date;
}

export interface TimeRangeISO {
    from: string;
    to: string;
}

export interface CollectedLogLine {
    timestamp: string;
    level: LogLevel;
    logLine: string;
}

export interface GroupedLogLine {
    bin: string;
    groupLogs: string;
}

export interface SystemMetrics {
    timestamp: string;
    cpu: string;
    memory: string;
}

export interface PostmanWorkspaceInfo {
    id: number;
    name: string;
    type: string;
    description?: string;
}

export interface PostmanCollectionInfo {
    uid: number;
    name: string;
    description?: string;
    url?: string;
}

export interface SelectedPostmanWorkspaceInfo {
    id: number;
    name: string;
    description?: string;
    collections?: PostmanCollectionInfo[];
}

export interface SelectedPostmanCollectionUidInfo {
    name: string;
    uid: string;
    description: string
}

export interface PostmanRequestInfo {
    name: string;
    url: string;
    method: string;
    description: string;
}


/**
 * Test Case Related Models Start
 */

export interface TestCasePatchData {
    displayName?: string;
}

export interface TestCaseInfo {
    id?: string;
    name?: string;
    orgSlug?: string;
    appId?: string;
    displayName?: string;
    workingFile?: string;
    createdAt?: string;
    updatedAt?: string;
    age?: any;
}

export interface TestCaseFile {
    type: "File" | "Folder"
    path: string,
    size: number,
    content: string
}

export interface TestCaseRuntimeInfo {
    test: EnvInfo;
    prod: EnvInfo;
}
/**
 * Test Case Related Models End
 */
export interface AiSuggestionsRes {
    jobNumber: string,
    suggestedMappings: string[]
}

export interface AiSuggestionsReq {
    userID: string,
    mapTo: [{ [key: string]: any }],
    mapFrom: [{ [key: string]: any }]
}

// data object that used to create org connection
export interface ConnectionRequest {
    handle?: string;
    displayName: string;
    connectorName: string;
    oauth2: {
        authCode: string;
    }
}

export const CONNECTION_TYPE_MANUAL = "manual";
export const CONNECTION_TYPE_SSO = "sso";

export type CONNECTION_TYPE = typeof CONNECTION_TYPE_MANUAL | typeof CONNECTION_TYPE_SSO;

// connection api response
export interface ConnectionDetails {
    id?: string;
    handle: string;
    displayName: string;
    connectorName: string;
    userAccountIdentifier: string;
    codeVariableKeys: ConnectionMetadata[];
    isUsed?: boolean;
    type?: string;
    code?: number;
    message?: string;
}
export interface ConnectorApiResponse {
    data?: ConnectionDetails;
    status: number;
}
export interface ConnectionMetadata {
    name: string;
    codeVariableKey: string;
}

// oauth provider config response
export interface OauthProviderConfig {
    connectorName: string;
    oauth2Config: OauthInitConfig;
}
export interface OauthInitConfig {
    apiBaseUrl: string;
    clientId: string;
    authUrl: string;
    redirectUrl: string;
    scopes: string[];
    params: OauthInfoParam[];
}
export interface OauthInfoParam {
    key: string;
    value: string;
}

export interface ApiInfo {
    id: string,
    name: string,
    apiVersion: string,
    status: string,
}

export interface ApiRevisionInfo {
    displayName: string,
    id: string,
    description: string,
    createdTime: string,
    apiInfo: {
        id: string
    },
    deploymentInfo: ApiDeploymentInfo[]
}

export interface ApiDeploymentInfo {
    revisionUuid: string,
    name: string,
    displayOnDevportal: boolean,
    deployedTime: string
}

export interface BusinessPlan {
    name: string,
    displayName: string,
    description: string,
    requestCount: number,
    timeUnit: string,
    unitTime: number,
    checked?: boolean
}

export interface ApiSubscriptions {
    count: number,
}

export interface ApiThrottlingPolicy {
    name: string,
    description: string,
    policylevel: string,
    displayName: string
}

export interface ApiManagerApiObj {
    id: string,
    name: string,
    description?: string,
    context?: string,
    policies: string[],
    provider: string,
    businessInformation?: ApiBusinessInfo,
    createdTime: string,
    tags?: string[],
    operations: ApiOperation[],
    transport?: string[],
    securityScheme?: string[],
    corsConfiguration?: CorsConfiguration,
    additionalProperties?: AdditionalProperties,
    endpointConfig?: EndpointConfiguration,
    additionalPropertiesMap?: AdditionalProperties,
    version?: string,
    lifeCycleStatus?: ApiState,
    thumbnail?: ApiThumbnail,
    isRevision: boolean,
    revisionedApiId: string,
    revisionId: number
}

export interface EndpointConfiguration {
    endpoint_type: string,
    production_endpoints: {
        url: string,
    },
    sandbox_endpoints: {
        url: string
    }
}

export interface ApiTestJwt {
    apikey: string,
    validityTime: number
}

// export interface AdditionalProperties {
//     application?: AdditionalProperty,
//     applicationId?: AdditionalProperty,
//     organization?: AdditionalProperty,
//     apiEndpoint?: AdditionalProperty
// }

export interface AdditionalProperties {
    application: string,
    applicationId: string,
    organization: string,
    appIngressEnabled: string,
}

export interface AdditionalProperty {
    value?: string,
    display?: boolean
}

export interface ApiBusinessInfo {
    businessOwner?: string,
    businessOwnerEmail?: string,
    technicalOwner?: string,
    technicalOwnerEmail?: string
}

export interface ApiOperation {
    target: string,
    verb: string
}

export interface ApiSubscribedAppInfo {
    applicationId: string,
    name: string,
    subscriber: string,
    description: string,
    subscriptionCount: number
}

export interface ApiSubscriptionList {
    count: number,
    list?: ApiSubscriptionObj[]
}

export interface ApiSubscriptionObj {
    subscriptionId: string,
    applicationInfo?: ApiSubscribedAppInfo,
    throttlingPolicy: string,
    subscriptionStatus: string
}

export interface CorsConfiguration {
    corsConfigurationEnabled: boolean,
    accessControlAllowOrigins: string[],
    accessControlAllowHeaders: string[],
    accessControlAllowMethods: string[],
    accessControlAllowCredentials: boolean
}

export interface Document {
    documentId?: string,
    name: string,
    type: string,
    sourceType: string,
    summary: string,
    visibility: string,
    content?: any,
    sourceUrl?: string,
}

export interface ApiDevelopView {
    designConfigView: DesignConfigView,
    runtimeConfigView: RuntimeConfigView,
    subscriptionView: SubscriptionView,
    businessInfoView: BusinessInfoView,
    documentsView: DocumentsView,
    definitionView: DefinitionView,
    resourcesView: ResourcesView,
    endpointConfigView: EndpointConfigView,
    isUnsavedChangesAvailable: boolean
}

export interface ApiRevisions {
    count: number,
    list: ApiRevisionInfo[]
}

export interface ApiDeployView {
    isRevisionCreating: boolean,
    isRevisionDeploying: boolean,
    isRevisionsFetching: boolean,
    isRevisionDeleting: boolean,
    isRevisionUndeploying: boolean,
    isRevisionRestoring: boolean,
    isRevisionCreatingAndDeploying: boolean,
    isDeploymentsFetching: boolean,
    revisions?: ApiRevisions,
    deploymentInfo?: ApiDeploymentInfo[]
}

export interface SwitchableRevisionObject {
    uuid: string,
    displayName: string
}

export const API_STATE_PUBLISHED = "Published"
export const API_STATE_CREATED = "Created"
export const API_STATE_PROTOTYPED = "Prototyped"
export const API_STATE_BLOCKED = "Blocked"
export const API_STATE_DEPRECATED = "Deprecated"
export const API_STATE_RETIRED = "Retired"

export const API_STATE_PUBLISHED_C = "PUBLISHED"
export const API_STATE_CREATED_C = "CREATED"
export const API_STATE_PROTOTYPED_C = "PROTOTYPED"
export const API_STATE_BLOCKED_C = "BLOCKED"
export const API_STATE_DEPRECATED_C = "DEPRECATED"
export const API_STATE_RETIRED_C = "RETIRED"

export type ApiState = typeof API_STATE_PUBLISHED | typeof API_STATE_CREATED | typeof API_STATE_PROTOTYPED
    | typeof API_STATE_BLOCKED | typeof API_STATE_DEPRECATED | typeof API_STATE_RETIRED | typeof API_STATE_PUBLISHED_C
    | typeof API_STATE_CREATED_C | typeof API_STATE_PROTOTYPED_C | typeof API_STATE_BLOCKED_C | typeof API_STATE_DEPRECATED_C
    | typeof API_STATE_RETIRED_C;

export const API_STATE_ACTION_PUBLISH = "Publish"
export const API_STATE_ACTION_DEPLOY_AS_PROTOTYPE = "Deploy as a Prototype"
export const API_STATE_ACTION_DEMOTE_TO_CREATED = "Demote to Created"
export const API_STATE_ACTION_BLOCK = "Block"
export const API_STATE_ACTION_DEPRECATE = "Deprecate"
export const API_STATE_ACTION_RE_PUBLISH = "Re-Publish"
export const API_STATE_ACTION_RETIRE = "Retire"

export type ApiStateAction = typeof API_STATE_ACTION_PUBLISH | typeof API_STATE_ACTION_DEPLOY_AS_PROTOTYPE
    | typeof API_STATE_ACTION_DEMOTE_TO_CREATED | typeof API_STATE_ACTION_RETIRE
    | typeof API_STATE_ACTION_BLOCK | typeof API_STATE_ACTION_DEPRECATE | typeof API_STATE_ACTION_RE_PUBLISH;

export interface ApiLifecycleView {
    isApiLifecycleFetching: boolean;
    isApiLifecycleHistoryFetching: boolean;
    isApiLifecycleUpdating: boolean;
    apiLifecycleState: ApiLifecycleState;
    apiLifecycleStateChangeHistory?: ApiLifecycleChangeHistory;
}

// The lifecycle state objects are partially defined here considering usage
export interface ApiLifecycleUpdateResponse {
    lifecycleState: ApiLifecycleState
}

export interface ApiLifecycleState {
    state: ApiState;
    availableTransitions: ApiLifecycleAvailableTransition[]
}

export interface ApiLifecycleAvailableTransition {
    event: ApiStateAction,
    targetState: ApiState
}

export interface ApiLifecycleChangeHistory {
    count: number,
    list: ApiLifecycleChangeRecord[]
}

export interface ApiLifecycleChangeRecord {
    previousState: ApiState,
    postState: ApiState,
    user: string,
    updatedTime: string
}

export interface RuntimeConfigView {
    isRuntimeConfigurationsUpdating: boolean;
    isApplicationIngressUpdating: boolean;
}

export interface SubscriptionView {
    isSubscriptionPlanUpdating: boolean;
    isBusinessPlansFetching: boolean;
    isApiSubscriptionListUpdating: boolean;
    isApiSubscriptionBlocking: boolean;
    isApiSubscriptionUnblocking: boolean;
    apiSubscriptionList: ApiSubscriptionList;
    updatedSubscription: ApiSubscriptionObj;
}

export interface BusinessInfoView {
    isBusinessInfoUpdating: boolean;
}

export interface DocumentsView {
    isApiDocumentsFetching: boolean;
    isAddingApiDocument: boolean;
    isApiDocumentFetching: boolean;
    isApiDocumentUpdating: boolean;
    isApiDocumentDeleting: boolean;
    documents?: Document[];
    currentDocument?: Document;
}

export interface ApiThumbnail {
    isApiThumbnailFetching?: boolean,
    isApiThumbnailUpdating?: boolean,
    thumbnailApiId?: string,
    apiThumbnailFile?: Blob,
    isThumbnailAvailable?: boolean
}

export interface ApiCreateView {
    isApiCreating: boolean,
    isBusinessPlansFetching: boolean,
}

export interface DesignConfigView {
    isDesignConfigsUpdating: boolean,
}

export interface EndpointConfigView {
    isEndpointConfigsUpdating: boolean,
}

export interface ValidationInfo {
    isValid: boolean,
    content: {},
    info: any,
    errors: any[]
}

export interface DefinitionView {
    isSwaggerFetching: boolean;
    isSwaggerUpdating: boolean;
    isSwaggerValidating: boolean
    swagger?: string;
    validationInfo?: ValidationInfo
}

export interface ResourcesView {
    isApiThrottlingPoliciesFetching: boolean;
    isApiThrottlingPolicyUpdating: boolean;
    apiThrottlingPolicies?: ApiThrottlingPolicy[]
}

export interface ConnectorRequest {
    organization: string,
    connectionHandle: string,
    connectorName: string,
    operationName: string,
    arguments: {}
}
export interface GithubRepoRequest extends ConnectorRequest {
    arguments: {
        user: string;
        recordCount: number;
    }
}
// export interface GithubUserRequest extends ConnectorRequest{
// 	arguments: {}
// }
// export interface GsheetListRequest extends ConnectorRequest{
// 	arguments: {}
// }
// export interface GcalendarListRequest extends ConnectorRequest{
// 	arguments: {}
// }
export interface ModelCodePosition {
    endColumn: number;
    endLine: number;
    startColumn: number;
    startLine: number;
}

export interface EndpointValidationStatus {
    error: string;
    statusCode: number;
    statusMessage: string;
}

export enum ApiCreationMethod  {
    NONE,
    API_FROM_REST,
    API_FROM_CHOREO_APP,
    API_FROM_SWAGGER_DEFINITION
}

export interface MetricDensityType {
    count: number;
    range: string;
}

export interface MetricDensityHistogramType {
    time: string;
    value: number;
}

export interface ConfigObject {
    id?: string;
    displayName: string;
    environment?: 'choreo-prod' | 'choreo-dev';
    configMapping: ConfigMap[];
}

export interface ConfigMap {
    id?: string;
    connectionId?: string;
    keyType: 'refreshTokenEndpointKey' | 'accessTokenKey' | 'invocationUrlKey' | 'customKey' | 'clientIdKey' | 'clientSecretKey' | 'tokenEpKey' | 'refreshTokenKey' | string;
    keyName?: string;
    value?: string;
    configKeyName: string;
}
export const INTEGRATION_DISPLAY_TYPES = [APP_TYPE_WEBHOOK, APP_TYPE_MANUAL, APP_TYPE_INTEGRATION_DRAFT, APP_TYPE_JOB];
export const SERVICE_APP_DISPLAY_TYPES = [APP_TYPE_API, APP_TYPE_SERVICE_DRAFT];

export interface Resource { }
export interface DraftUpdateStatement {
    startLine: number;
    endLine: number;
    startColumn: number;
    endColumn: number;
}
