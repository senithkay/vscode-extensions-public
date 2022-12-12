/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
export interface Owner {
    id: string;
    idpId: string;
    createdAt: Date;
}

export interface Organization {
    id: string;
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
    createdAt: Date;
    orgHandler: string;
    repository: Repository;
    apiVersions: ApiVersion[];
}

export interface Repository {
    nameApp: string;
    nameConfig: string;
    branch: string;
    branchApp: string;
    organizationApp: string;
    organizationConfig: string;
    isUserManage: boolean;
    appSubPath?: any;
    byocBuildConfig?: any;
}

export interface Metadata {
    choreoEnv: string;
}

export interface Release {
    id: string;
    metadata: Metadata;
    environmentId: string;
    environment?: any;
    gitHash?: any;
    gitOpsHash?: any;
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
    labels: any[];
    updatedAt: Date;
    apiId?: any;
    httpBased: boolean;
    isMigrationCompleted: boolean;
    apiVersions: ApiVersionDetailed[];
}