export const APP_TYPE_JOB = "Schedule";
export const APP_TYPE_API = "API";
export const APP_TYPE_CUSTOM = "Custom";
export const APP_TYPE_EXTERNAL = "External";
export const APP_TYPE_WEBHOOK = "Webhook";
export const APP_TYPE_MANUAL = "Manual";
export const APP_TYPE_EMAIL = "Email";
export const APP_TYPE_UNKNOWN = "Unknown";
export const APP_CODE = "Code";
export const APP_ANALYZE = "Analyze";
export const APP_SETTINGS = "Settings";

export type AppType = typeof APP_TYPE_JOB | typeof APP_TYPE_API | typeof APP_TYPE_CUSTOM | typeof APP_TYPE_WEBHOOK
    | typeof APP_TYPE_MANUAL | typeof APP_TYPE_EMAIL | typeof APP_TYPE_UNKNOWN | typeof APP_TYPE_EXTERNAL;

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

export type DEPLOY_STATE = typeof STAGE_QUEUED | typeof STAGE_IN_PROGRESS |
    typeof STAGE_SUCCESS | typeof STAGE_FAILURE | typeof STAGE_SKIPPED | typeof STAGE_UNDEFINED;

export interface LogMessage {
    type: "control" | "data" | "error",
    message: {
        type: "STDOUT" | "STDERR",
        data: string
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
    status: "running" | "stopped" | "deploy in progress" | "undeploy in progress";
}

export interface AppRuntimeInfo {
    test: EnvInfo;
    prod: EnvInfo;
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
    observability?: ObservabilityDetails;
    gitRemote?: string;
    status?: string;
    workspace?: WorkspaceInfo;
    createdAt: string;
    cronSchedule?: string;
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
    appSlug?: string;
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
    mapTo: [{[key: string]: any}],
    mapFrom: [{[key: string]: any}]
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

// connection api response
export interface ConnectionDetails {
    handle: string;
    displayName: string;
    connectorName: string;
    userAccountIdentifier: string;
    codeVariableKeys: ConnectionMetadata[];
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

export interface APIInfo {
    id: string,
    name: string,
    apiVersion: string,
    status: string,
}

export interface BusinessPlan {
    name: string,
    displayName: string,
    description: string,
    checked?: boolean
}

export interface APIManagerAPIObj {
    id: string,
    name: string,
    description?: string,
    policies: string[],
    provider: string,
    businessInformation?: APIBusinessInfo,
    createdTime: string,
    tags?: string[],
    operations: APIOperation[],
    transport?: string[],
    securityScheme?: string[],
    corsConfiguration?: CorsConfiguration,
    additionalProperties?: AdditionalProperties,
    version?: string,
    lifeCycleStatus?: string,
    status?: string,
    thumbnail?: APIThumbnail,
}

export interface AdditionalProperties{
    application: string,
    applicationId: string,
    organization: string,
    appIngressEnabled: string,
}

export interface APIBusinessInfo {
    businessOwner?: string,
    businessOwnerEmail?: string,
    technicalOwner?: string,
    technicalOwnerEmail?: string
}

export interface APIOperation {
    target: string,
    verb: string
}

export interface CorsConfiguration {
    corsConfigurationEnabled: boolean,
    accessControlAllowOrigins: string[],
    accessControlAllowHeaders: string[],
    accessControlAllowMethods: string[]
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

export interface ConfigView {
    designConfigView: DesignConfigView,
    runtimeConfigView: RuntimeConfigView;
    subscriptionView: SubscriptionView;
    businessInfoView: BusinessInfoView;
    documentsView: DocumentsView;
    isUnsavedChangesAvailable: boolean;
}

export interface RuntimeConfigView {
    isRuntimeConfigurationsUpdating: boolean;
    isApplicationIngressUpdating: boolean;
}

export interface SubscriptionView {
    isSubscriptionPlanUpdating: boolean;
    isBusinessPlansFetching: boolean;
}

export interface BusinessInfoView {
    isBusinessInfoUpdating: boolean;
}

export interface DocumentsView {
    isAPIDocumentsFetching: boolean;
    isAddingAPIDocument: boolean;
    isAPIDocumentFetching: boolean;
    isAPIDocumentUpdating: boolean;
    isAPIDocumentDeleting: boolean;
    documents?: Document[];
    currentDocument?: Document;
}

export interface APIThumbnail {
    isApiThumbnailFetching?: boolean,
    isApiThumbnailUpdating?: boolean,
    thumbnailApiId?: string,
    apiThumbnailFile?: Blob,
    isThumbnailAvailable?: boolean
}

export interface APICreateView {
    isApiCreating: boolean,
    isBusinessPlansFetching: boolean,
}

export interface DesignConfigView {
    isDesignConfigsUpdating: boolean,
}

export interface ConnectorRequest {
    organization: string,
	   connectionHandle: string,
	   connectorName: string,
    operationName: string,
    arguments: {}
}
export interface GithubRepoRequest extends ConnectorRequest{
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
