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
    byocBuildConfig?: unknown;
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
    displayType: ChoreoServiceComponentType;
    description: string;
    projectId: string;
    accessibility: ComponentAccessibility;
    repository: {
        orgApp: string;
        nameApp: string;
        branchApp: string;
        appSubPath: string;
    };
}

export enum ChoreoServiceComponentType {
    REST_API = 'restAPI',
    GQL_API = 'graphql',
    WEBSOCKET_API = 'WEBSOCKET_API',
    GRPC_API = 'GRPC_API',
}

export interface ChoreoComponentCreationParams {
    name: string;
    projectId: string;
    org: Organization;
    description: string;
    displayType: ChoreoServiceComponentType;
    accessibility: ComponentAccessibility;
    repositoryInfo: RepositoryDetails;
}

export interface RepositoryDetails {
    org: string;
    repo: string;
    branch: string;
    subPath: string;
}

export interface Location {
    filePath: string;
    startPosition: LinePosition;
    endPosition: LinePosition;
}

export interface DeploymentMetadata {
    gateways: {
        internet: {
            isExposed: boolean;
        },
        intranet: {
            isExposed: boolean;
        }
    };
}

export interface Service {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    annotation: any;
    path: string;
    serviceId: string;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    resources: any[];
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    remoteFunctions: any[];
    serviceType: string;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    dependencies: any[];
    deploymentMetadata: DeploymentMetadata;
    elementLocation: Location;
}

interface LinePosition {
    line: number;
    offset: number;
}
export interface Entity {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    attributes: any[];
    inclusions: string[];
    elementLocation: Location;
    isAnonymous: boolean;
}

export interface ComponentModel {
    packageId: {
        name: string,
        org: string,
        version: string
    };
    services: Map<string, Service>;
    entities: Map<string, Entity>;
    hasCompilationErrors: boolean;
}
