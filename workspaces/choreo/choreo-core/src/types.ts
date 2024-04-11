/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export type WebviewTypes = "NewComponentForm" | "ComponentsListActivityView" | "AccountActivityView" | "ChoreoCellView"
// "ActivityBarProjectView" | "ChoreoCellView" | "ProjectOverview" | "ProjectCreateForm" | "ComponentCreateForm" |

// TODO: delete
export interface OldProps {
    type: WebviewTypes;
	projectId?: string;
	orgName?: string;
	componentLimit?: number;
	choreoUrl?: string;
}


export interface NewComponentWebview {
    type: "NewComponentForm";
    directoryPath: string;
    organization: Organization;
    gitInstallUrl: string;
    project?: Project;
}

export interface ComponentsListActivityView {
    type: "ComponentsListActivityView";
    directoryPath?: string;
}

export interface AccountActivityView {
    type: "AccountActivityView";
}

export type WebviewProps = OldProps | NewComponentWebview

export interface Owner {
    id: string;
    idpId: string;
    createdAt: Date;
}
export interface Organization {
    id: number;
    uuid: string;
    handle: string;
    name: string;
    owner: Owner;
}


export interface DataCacheState {
    orgs?: {
        [orgHandle: string]: {
            projects?: {
                [projectHandle: string]: {
                    data?: Project;
                    components?: { [componentHandle: string]: { data?: ComponentKind; }; };
                };
            };
            data?: Organization;
        };
    };
    loading?: boolean;
}


/*
export interface DataCacheState {
    orgs?: {
        data?:Organization;
        projects?: {
            data?: Project;
            components?: ComponentKind[];
        }[]
    }[];
    loading?: boolean;
}
*/

export interface UserInfo {
    displayName: string;
    userEmail: string;
    userProfilePictureUrl: string;
    idpId: string;
    organizations: Organization[];
    userId: string;
    userCreatedAt: Date;
}

export interface AuthState {
    userInfo: UserInfo | null;
    loading: boolean;
}

export interface LinkFileContent {
    component: string;
    project: string;
    org: string;
}

export interface ComponentLinkContent {
    componentHandle: string;
    projectHandle: string;
    orgHandle: string;
}
export interface ComponentLink {
    workspaceName: string;
    workspacePath: string;
    componentRelativePath: string;
    componentFullPath: string;
    linkFullPath: string;
    linkRelativePath: string;
    linkContent: ComponentLinkContent;
    organization?: Organization;
    project?: Project;
    component?: ComponentKind;
}

export interface LinkedDirectoryState {
    links: ComponentLink[];
    loading?: boolean;
    error?: Error;
}

export interface ComponentKindBitbucketSource {
    repository: string;
    branch: string;
    path: string;
}

export interface ComponentKindGithubSource {
    repository: string;
    branch: string;
    path: string;
}

export interface ComponentKindSource {
    bitbucket?: ComponentKindBitbucketSource;
    github?: ComponentKindGithubSource;
}

export interface ComponentKindBuildDocker {
    dockerFilePath: string;
    dockerContextPath: string;
    port?: number;
}

export interface ComponentKindBuildBallerina {
    sampleTemplate: string;
    enableCellDiagram: boolean;
}

export interface ComponentKindBuildWebapp {
    buildCommand: string;
    nodeVersion: string;
    outputDir: string;
    type: string;
}

export interface ComponentKindBuildBuildpack {
    language: string;
    version: string;
    port?: number;
}

export interface ComponentKindSpecBuild {
    docker?: ComponentKindBuildDocker;
    ballerina?: ComponentKindBuildBallerina;
    webapp?: ComponentKindBuildWebapp;
    buildpack?: ComponentKindBuildBuildpack;
}

export interface ComponentKindMetadata {
    name: string;
    displayName: string;
    projectName: string;
}

export interface ComponentKindSpec {
    type: string;
    source: ComponentKindSource;
    build: ComponentKindSpecBuild;
}

export interface ComponentKind {
    apiVersion: string;
    kind: string;
    metadata: ComponentKindMetadata;
    spec: ComponentKindSpec;
}

export enum ChoreoComponentType {
    Service = 'service',
    ScheduledTask = 'scheduleTask',
    ManualTrigger = 'manualTask',
    Webhook = 'webhook',
    WebApplication = 'webApp'
}

export interface Project {
    createdData: string;
    handler: string;
    id: string;
    name: string;
    orgId: string;
    region: string;
    version: string;
    description: string;
    repository?: string,
    credentialId?: string,
    branch?: string,
    gitOrganization?: string;
    gitProvider?: string,
}

export interface Buildpack {
    id: string;
    buildpackImage: string;
    language: string;
    supportedVersions: string;
    displayName: string;
    isDefault: true;
    versionEnvVariable: string;
    iconUrl: string;
    provider: string;
    builder: {
        id: string;
        builderImage: string;
        displayName: string;
        imageHash: string;
    };
    componentTypes: {
        id: string;
        displayName: string;
        type: string
    }[];
}

export enum ChoreoBuildPackNames {
    Ballerina = "ballerina",
    Docker = "docker",
    React = "react",
    Angular = "angular",
    Vue = "vuejs",
    StaticFiles = "staticweb",
    MicroIntegrator = "microintegrator",
}

/////////////////////////////////////
/////////////////////////////////////
// TODO: remove OLD /////////////////
/////////////////////////////////////
/////////////////////////////////////

export type ChoreoLoginStatus = 'Initializing' | 'LoggingIn' | 'LoggedIn' | 'LoggedOut';

export type ComponentAccessibility = 'internal' | 'external';

export type ComponentNetworkVisibility = 'Project' | 'Organization' | 'Public';



export interface ComponentCount {
    orgId: number; 
    componentCount: number;
}

export interface ApiVersion {
    apiVersion: string;
    proxyName: string;
    proxyUrl: string;
    proxyId: string;
    id: string;
    state: string;
    latest: boolean;
    branch: string;
    accessibility: string;
    cellDiagram?: CellDiagram;
}

export interface CellDiagram {
    data: string;
    errorName: string;
    message: string;
    success: boolean;
}

export interface Deployments {
    dev?: Deployment;
    prod?: Deployment
}

export interface Component {
    projectId: string;
    id: string;
    description: string;
    name: string;
    handler: string;
    displayName: string;
    displayType: string;
    version: string;
    createdAt?: Date;
    orgHandler: string;
    repository?: Repository;
    apiVersions: ApiVersion[];
    // To store the accessibility of the component which are not created using Choreo
    accessibility?: string;
    local?: boolean;
    hasUnPushedLocalCommits?: boolean;
    hasDirtyLocalRepo?: boolean;
    isRemoteOnly?: boolean;
    sourcePath?: string;
    endpointsPath?: string;
}

export interface StateReason {
    code: string;
    message: string;
    details: string;
    workerId: string;
}

export interface ComponentEP {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    releaseId: string;
    environmentId: string;
    displayName: string;
    port: number;
    type: string;
    apiContext: string;
    apiDefinitionPath: string;
    invokeUrl: string;
    visibility: string;
    hostName: string;
    isAutoGenerated: boolean;
    apimId: string;
    apimRevisionId: string;
    apimName: string;
    projectUrl: string;
    organizationUrl: string;
    publicUrl: string;
    state: string;
    stateReason: StateReason;
    isDeleted: boolean;
    deletedAt: Date;
}

export interface EndpointData {
    componentEndpoints: ComponentEP[];
}

export interface PushedComponent {
    path: string;
    name: string;
}

export interface Environment {
    id: string;
    name: string;
    organizationUuid: string;
    projectId?: string;
    description: string;
    promoteFrom?: string[]
    orgShared?: boolean;
    choreoEnv: string;
    critical: boolean;
    apiEnvName: string;
    internalApiEnvName: string;
    externalApiEnvName: string;
    sandboxApiEnvName: string;
    namespace: string;
    vhost?: string
    sandboxVhost?: string
    apimSandboxEnvId?: string
    apimEnvId?: string
    isMigrating: boolean;
}

export interface Deployment {
    deploymentCount?: number
    apiId?: string;
    releaseId: string;
    componentId: string;
    environmentId: string;
    environment?: Environment;
    versionId: string;
    version: string;
    build: {
        buildId: string;
        deployedAt: string;
        commitHash: string;
        branch: string;
        commit?: {
            author: {
                name: string;
                email: string;
                date: string;
                avatarUrl?: string;
            },
            message: string;
            sha: string;
            isLatest: boolean;
        }
    }
    deploymentStatus: string;
    deploymentStatusV2: string;
    cron: string;
    invokeUrl?: string;
    configCount?: number;
    scheduleLastRun?: string;
    lifecycleStatus?: string;
    apiRevision?: {
        displayName: string;
        id: string;
        description: string;
        createdTime: number;
        apiInfo: { id: string; }
        deploymentInfo: {
            revisionUuid: number;
            name: string;
            vhost: number;
            displayOnDevportal: boolean
            deployedTime?: number;
            successDeployedTime?: number
        }[]
    };
}

export interface BuildStatus {
    id: string;
    name: string;
    conclusion?: string;
    status: string;
    started_at?: string;
    completed_at?: string
    sha?: string
    isAutoDeploy?: boolean;
    failureReason?: number;
    sourceCommitId?: string;
}

export interface WebAppBuildConfig {
    id: string;
    containerId: string;
    componentId: string;
    repositoryId: string;
    dockerContext: string;
    webAppType: string;
    buildCommand: string;
    packageManagerVersion: string;
    outputDirectory: string;
}

export interface Repository {
    nameApp: string;
    nameConfig: string;
    branch: string;
    branchApp: string;
    organizationApp: string;
    organizationConfig: string;
    isUserManage: boolean;
    appSubPath?: string;
    gitProvider: string;
    bitbucketCredentialId: string;
    byocBuildConfig?: {
        componentId: string;
        containerId: string;
        dockerContext: string;
        dockerfilePath: string;
        id: string;
        isMainContainer: string;
        oasFilePath: string;
        repositoryId: string;
    };
    buildpackConfig?: BuildpackBuildConfig[];
    byocWebAppBuildConfig?: WebAppBuildConfig;
}

export interface BuildpackBuildConfig {
    versionId: string;
    buildContext: string;
    languageVersion: string;
    buildpack: {
        id: string;
        language: string;
    };
}

export interface Metadata {
    choreoEnv: string;
}

export interface Release {
    id: string;
    metadata: Metadata;
    environmentId: string;
    environment?: unknown;
    gitHash?: unknown;
    gitOpsHash?: unknown;
}

export interface AppEnvVersion {
    environmentId: string;
    releaseId: string;
    release: Release;
}

export interface ApiVersionDetailed extends ApiVersion {
    appEnvVersions: AppEnvVersion[];
}

export interface ComponentDetailed extends Component {
    ownerName: string;
    orgId: number;
    labels: unknown[];
    updatedAt: Date;
    apiId?: unknown;
    httpBased: boolean;
    isMigrationCompleted: boolean;
    apiVersions: ApiVersionDetailed[];
}

export interface WorkspaceItem {
    name: string;
    path: string;
    metadata?: WorkspaceComponentMetadata;
}
export interface WorkspaceConfig {
    folders: WorkspaceItem[];
    metadata?: {
        choreo?: {
            projectID: string;
            orgId: number;
            monoRepo?: string;
            branch?: string;
            gitProvider?: string;
        }
    }
}
export enum ComponentDisplayType {
    RestApi = 'restAPI',
    ManualTrigger = 'manualTrigger',
    ScheduledTask = 'scheduledTask',
    Webhook = 'webhook',
    Websocket = 'webSocket',
    Proxy = 'proxy',
    ByocCronjob = 'byocCronjob',
    ByocJob = 'byocJob',
    GraphQL = 'graphql',
    ThirdPartyAPI = 'thirdPartyAPI',
    ByocWebApp = 'byocWebApp',
    ByocWebAppDockerLess = 'byocWebAppsDockerfileLess',
    ByocRestApi = 'byocRestApi',
    ByocWebhook = 'byocWebhook',
    MiRestApi = 'miRestApi',
    MiEventHandler = 'miEventHandler',
    Service = 'ballerinaService',
    ByocService = 'byocService',
    MiApiService = 'miApiService',
    MiCronjob = 'miCronjob',
    MiJob = 'miJob',
    ByoiService = 'byoiService',
    ByoiJob = 'byoiJob',
    ByoiCronjob = 'byoiCronjob',
    ByoiWebApp = 'byoiWebApp',
    ByocTestRunner = 'byocTestRunner',
    BuildpackService = 'buildpackService',
    BuildpackWebhook = 'buildpackWebhook',
    BuildpackJob = 'buildpackJob',
    BuildpackTestRunner = 'buildpackTestRunner',
    BuildpackCronJob = 'buildpackCronjob',
    BuildpackWebApp = 'buildpackWebApp',
    BuildpackRestApi = 'buildpackRestApi',
    PostmanTestRunner = 'byocTestRunnerDockerfileLess',
    BallerinaEventHandler = 'ballerinaEventHandler',
}

export interface ComponentWizardWebAppConfig {
    dockerContext?: string;
    webAppType?: string;
    webAppBuildCommand?: string;
    webAppPackageManagerVersion?: string;
    webAppOutputDirectory?: string;
    srcGitRepoUrl?: string,
    srcGitRepoBranch?: string,
}

export interface WorkspaceComponentMetadata {
    org: {
        id: number;
        handle: string;
    };
    displayName: string;
    displayType: ComponentDisplayType;
    description: string;
    projectId: string;
    accessibility?: ComponentAccessibility;
    repository: {
        orgApp: string;
        nameApp: string;
        branchApp: string;
        appSubPath: string;
        gitProvider: string;
        bitbucketCredentialId: string;
    };
    byocConfig?: {
        dockerfilePath: string;
        dockerContext: string;
        srcGitRepoUrl: string;
        srcGitRepoBranch: string;
    },
    buildpackConfig?: {
        buildContext: string;
        srcGitRepoUrl: string;
        srcGitRepoBranch: string;
        languageVersion: string;
        buildpackId: string;
    },
    byocWebAppsConfig?: ComponentWizardWebAppConfig;
    port?: number;
}

export enum ChoreoImplementationType {
    Ballerina = "ballerina",
    Docker = "docker",
    React = "react",
    Angular = "angular",
    Vue = "vuejs",
    StaticFiles = "staticweb",
    Java = "java",
    Python = "python",
    NodeJS = "nodejs",
    Go = "go",
    PHP = "php",
    Ruby = "ruby",
    MicroIntegrator = "microintegrator",
}

export enum GoogleProviderBuildPackNames {
    JAVA = "java",
    NODEJS = "nodejs",
    PYTHON = "python",
    GO = "go",
    RUBY = "ruby",
    PHP = "php",
}


export enum ChoreoServiceType {
    RestApi = "REST",
    GraphQL = "GraphQL",
    GRPC = "GRPC"
}

export const ChoreoServiceTypeList = [ChoreoServiceType.RestApi, ChoreoServiceType.GraphQL, ChoreoServiceType.GRPC]



export interface ChoreoComponentCreationParams {
    name: string;
    projectId: string;
    org: Organization;
    description: string;
    displayType: ComponentDisplayType;
    repositoryInfo: RepositoryDetails|BYOCRepositoryDetails;
    initializeNewDirectory?: boolean;
    /** Relevant for webhook types */
    accessibility?: ComponentAccessibility;
    /** Relevant for webhook types */
    trigger?: TriggerDetails;
    /** Relevant for non-ballerina types */
    port?: number;
    /** Whether its a REST, GraphQL or GRPC type */
    serviceType?: ChoreoServiceType;
    /** Relevant for web app types (React, Angular, Vue & static files) */
    webAppConfig?: ComponentWizardWebAppConfig;
    /** Relevant for non-ballerina service types */
    networkVisibility?: ComponentNetworkVisibility;
    /** Relevant for non-ballerina rest and gql APIs */
    endpointContext?: string;
    /** Relevant for build pack types */
    implementationType?: string;
    /** Version of the build pack language */
    languageVersion?: string;
    /** ID of the selected buildpack */
    buildPackId?: string;
}

export interface TriggerDetails {
    id: string;
    services?: string[];
}

export interface RepositoryDetails {
    org: string;
    repo: string;
    branch: string;
    subPath: string;
    gitProvider: string;
    bitbucketCredentialId: string;
}

export interface BYOCRepositoryDetails extends RepositoryDetails {
    dockerFile: string;
    dockerContext: string;
    templateSubPath?: string;
    openApiFilePath?: string;
}

export interface ProjectDeleteResponse {
    status: string,
    details: string,
}

export interface SubscriptionResponse {
    count: number;
    list: {
        subscriptionId: string;
        subscriptionType: string
        tierId: string;
    }[];
}

export interface getLocalComponentDirMetaDataRequest {
    projectId: string;
    orgName: string;
    repoName: string;
    subPath: string;
    dockerFilePath?: string;
    dockerContextPath?: string;
    openApiFilePath?: string;
    buildPackId?: string;
}

export interface LocalComponentDirMetaDataRes {
    isRepoPathAvailable: boolean;
    isBareRepo: boolean;
    isSubPathValid: boolean;
    isSubPathEmpty: boolean;
    hasBallerinaTomlInPath: boolean;
    hasBallerinaTomlInRoot: boolean;
    hasComponentYaml: boolean;
    dockerFilePathValid: boolean;
    isDockerContextPathValid: boolean;
    isBuildpackPathValid: boolean;
    hasPomXmlInPath: boolean;
    hasPomXmlInInRoot: boolean;
}

export interface InboundConfig {
    name: string;
    port: number;
    type?: string;
    context?: string;
    schemaFilePath?: string;
}

export interface Endpoint extends InboundConfig {
    networkVisibility?: string;
}

export interface Inbound extends InboundConfig {
    visibility?: string;
}

export interface Outbound {
    serviceReferences: ServiceReference[];
}

export interface ComponentMetadata {
    name: string;
    projectName: string;
    annotations: Record<string, string>;
}

export enum DeploymentStatus {
    NotDeployed = 'NOT_DEPLOYED',
    Active = 'ACTIVE',
    Suspended = 'SUSPENDED',
    Error = 'ERROR',
    InProgress = 'IN_PROGRESS'
}

export enum Status {
    LocalOnly = "LOCAL_ONLY",
    UnavailableLocally= "NOT_AVAILABLE_LOCALLY",
    ChoreoAndLocal= "CHOREO_AND_LOCAL"
}


export enum GitProvider {
    GITHUB = 'github',
    BITBUCKET = 'bitbucket',
}

export interface GitRepo {
    provider: GitProvider;
    orgName: string;
    repoName: string;
    bitbucketCredentialId?: string;
}

export interface ChoreoWorkspaceMetaData {
    projectID?: string;
    orgId?: string | number;
}

export enum ServiceTypes {
    HTTP = "HTTP",
    GRPC = "GRPC",
    WEBSOCKET = "Websocket",
    GRAPHQL = "GraphQL",
    WEBHOOK = "Webhook",
    WEBAPP = "WebApp",
    OTHER = "other"
}

export interface ServiceReferenceEnv {
    from: string;
    to: string;
}

export interface ServiceReference {
    name: string;
    connectionConfig: string;
    connectionType: string;
    env?: ServiceReferenceEnv[];
}

export interface ComponentYamlSchema {
    $schema?: string;
    $id?: string;
    title?: string;
    description?: string;
    type: string;
    properties?: {
        [key: string]: ComponentYamlSchema;
    };
    definitions?: {
        [key: string]: ComponentYamlSchema;
    };
    allOf?: [
        {
            [key: string]: ComponentYamlSchema;
        }
    ];
    default?: string;
    const?: string;
    enum?: string[];
    pattern?: string;
    format?: string;
    minLength?: number;
    items?: ComponentYamlSchema;
    required?: string[];
    $ref?: string;
}

export interface ComponentYamlContent {
    apiVersion: "core.choreo.dev/v1alpha1";
    kind: "ComponentConfig";
    metadata: ComponentMetadata;
    spec: {
        build?: { branch: string; revision?: string };
        image?: { registry: string; repository: string; tag: string };
        inbound?: Inbound[];
        outbound?: Outbound;
        configurations?: {
            keys?: {
                name: string;
                envName?: string;
                volume?: { mountPath: string };
            }[];
            groups?: {
                name: string;
                env?: { from: string; to: string }[];
                volume?: { mountPath: string; files: { from: string; to: string }[] }[];
            }[];
        };
    };
}


export enum CellComponentType {
    SERVICE = 'service',
    WEB_APP = 'web-app',
    SCHEDULED_TASK = 'scheduled-task',
    MANUAL_TASK = 'manual-task',
    API_PROXY = 'api-proxy',
    WEB_HOOK = 'web-hook',
    EVENT_HANDLER = 'event-handler',
    TEST = 'test',
}

export function getGeneralizedCellComponentType(
    type: ComponentDisplayType
): CellComponentType {
    switch (type) {
        case ComponentDisplayType.RestApi:
        case ComponentDisplayType.Service:
        case ComponentDisplayType.ByocService:
        case ComponentDisplayType.GraphQL:
        case ComponentDisplayType.MiApiService:
        case ComponentDisplayType.MiRestApi:
        case ComponentDisplayType.BuildpackService:
        case ComponentDisplayType.BuildpackRestApi:
        case ComponentDisplayType.Websocket:
            return CellComponentType.SERVICE;
        case ComponentDisplayType.ManualTrigger:
        case ComponentDisplayType.ByocJob:
        case ComponentDisplayType.BuildpackJob:
        case ComponentDisplayType.MiJob:
            return CellComponentType.MANUAL_TASK;
        case ComponentDisplayType.ScheduledTask:
        case ComponentDisplayType.ByocCronjob:
        case ComponentDisplayType.BuildpackCronJob:
        case ComponentDisplayType.MiCronjob:
            return CellComponentType.SCHEDULED_TASK;
        case ComponentDisplayType.Webhook:
        case ComponentDisplayType.ByocWebhook:
        case ComponentDisplayType.BuildpackWebhook:
            return CellComponentType.WEB_HOOK;
        case ComponentDisplayType.Proxy:
            return CellComponentType.API_PROXY;
        case ComponentDisplayType.ByocWebApp:
        case ComponentDisplayType.ByocWebAppDockerLess:
        case ComponentDisplayType.BuildpackWebApp:
            return CellComponentType.WEB_APP;
        case ComponentDisplayType.MiEventHandler:
        case ComponentDisplayType.BallerinaEventHandler:
            return CellComponentType.EVENT_HANDLER;
        case ComponentDisplayType.BuildpackTestRunner:
            return CellComponentType.TEST;
        default:
            return CellComponentType.SERVICE;
    }
}