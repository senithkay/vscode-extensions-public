/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
export type ChoreoLoginStatus = 'Initializing' | 'LoggingIn' | 'LoggedIn' | 'LoggedOut';

export type ComponentAccessibility = 'internal' | 'external';

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

export interface UserInfo {
    displayName: string;
    userEmail: string;
    userProfilePictureUrl: string;
    idpId: string;
    organizations: Organization[];
    userId: string;
    userCreatedAt: Date;
}

export interface Project {
    createdData: string;
    handler: string;
    id: string;
    name: string;
    orgId: string;
    region: string;
    version: string;
}

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
    isInRemoteRepo?: boolean;
    deployments?: Deployments;
    buildStatus?: BuildStatus;
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

export interface Repository {
    nameApp: string;
    nameConfig: string;
    branch: string;
    branchApp: string;
    organizationApp: string;
    organizationConfig: string;
    isUserManage: boolean;
    appSubPath?: string;
    byocBuildConfig?: {
        componentId: string;
        containerId: string;
        dockerContext: string;
        dockerfilePath: string;
        id: string;
        isMainContainer: string;
        oasFilePath: string;
        repositoryId: string;
    }
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
        }
    }
}
export interface WorkspaceComponentMetadata {
    org: {
        id: number;
        handle: string;
    };
    displayName: string;
    displayType: ChoreoComponentType;
    description: string;
    projectId: string;
    accessibility: ComponentAccessibility;
    repository: {
        orgApp: string;
        nameApp: string;
        branchApp: string;
        appSubPath: string;
    };
    byocConfig?: {
        dockerfilePath: string;
        dockerContext: string;
        srcGitRepoUrl: string;
        srcGitRepoBranch: string;
    }
}

export enum ChoreoComponentType {
    RestApi = 'restAPI',
    ManualTrigger = 'manualTrigger',
    ScheduledTask = 'scheduledTask',
    Webhook = 'webhook',
    Websocket = 'webSocket',
    Proxy = 'proxy',
    ByocMicroservice = 'byocMicroservice',
    ByocCronjob = 'byocCronjob',
    ByocJob = 'byocJob',
    GraphQL = 'graphql',
    ByocWebApp = 'byocWebApp',
    ByocRestApi = 'byocRestApi',
    ByocWebhook = 'byocWebhook',
    MiRestApi = 'miRestApi',
    MiEventHandler = 'miEventHandler',
    Service = 'ballerinaService',
    ByocService = 'byocService',
}

export interface ChoreoComponentCreationParams {
    name: string;
    projectId: string;
    org: Organization;
    description: string;
    displayType: ChoreoComponentType;
    accessibility: ComponentAccessibility;
    repositoryInfo: RepositoryDetails|BYOCRepositoryDetails;
    trigger?: TriggerDetails;
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
}

export interface BYOCRepositoryDetails extends RepositoryDetails {
    dockerFile: string;
    dockerContext: string;
}

export interface ProjectDeleteResponse {
    status: string,
    details: string,
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
