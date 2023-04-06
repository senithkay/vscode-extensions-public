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
import { Project, Component, Repository, Deployment } from "@wso2-enterprise/choreo-core";

export interface CreateProjectParams {
    name: string;
    description: string;
    orgId: number;
    orgHandle: string;
    version?: string;
    region?: string;
}

export interface CreateComponentParams {
    name: string;
    displayName: string;
    displayType: string;
    description: string;
    orgId: number;
    orgHandle: string;
    projectId: string;
    accessibility: string;
    srcGitRepoUrl: string;
    repositorySubPath: string;
    repositoryType: string;
    repositoryBranch: string;
}

export interface CreateByocComponentParams {
    name: string;
    displayName: string;
    description: string;
    orgId: number;
    orgHandler: string;
    projectId: string;
    accessibility: string;
    labels: string;
    componentType: string;
    port: number;
    oasFilePath: string;
    byocConfig: {
        dockerfilePath: string;
        dockerContext: string;
        srcGitRepoUrl: string;
        srcGitRepoBranch: string;
    }
}

export interface GetProjectEnvParams {
    orgUuid: string;
    projId: string;
}

export interface DeleteComponentParams {
    orgHandler: string;
    component: Component;
    projectId: string;
}

export interface RepoParams {
    orgApp: string;
    repoApp: string;
    branchApp: string;
    subPath: string;
}

export interface ComponentMutationParams {
    projectId: string;
    name: string;
    description: string;
}

export interface LinkRepoMutationParams {
    componentId: string;
    repoOwner: string;
    repoName: string;
    repoPath: string;
}

export interface GetProjectsParams {
    orgId: number;
}

export interface GetComponentsParams {
    orgHandle: string;
    projId: string;
    orgUuid: string;
}

export interface GetComponentDeploymentStatusParams {
    orgHandle: string;
    projId: string;
    orgUuid: string;
    component: Component;
    envId: string;
    versionId: string;
}

export interface GetDiagramModelParams {
    orgHandle: string;
    projId: string;
}

export interface GitHubRepoValidationResponse {
    isBareRepo: boolean;
    isSubPathValid: boolean;
    isSubPathEmpty: boolean;
    isValidRepo: boolean;
    hasBallerinaTomlInPath: boolean;
    hasBallerinaTomlInRoot: boolean;
    isDockerfilePathValid: boolean;
    hasDockerfileInPath: boolean;
    isDockerContextPathValid: boolean;
    isOpenApiFilePathValid: boolean;
    hasOpenApiFileInPath: boolean;
    hasPomXmlInPath: boolean;
    hasPomXmlInRoot: boolean;
  }
  
  export interface GitHubRepoValidationRequestParams {
    organization: string;
    repo: string;
    branch: string;
    path?: string;
    dockerfile?: string;
    dockerContextPath?: string;
    openApiPath?: string;
    componentId?: string;
  }

export interface IChoreoProjectClient {
    // queries
    getProjects(params: GetProjectsParams): Promise<Project[]>;
    getComponents(params: GetComponentsParams): Promise<Component[]>;
    getComponentDeploymentStatus(params: GetComponentDeploymentStatusParams): Promise<Deployment | null>;
    getDiagramModel(params: GetComponentsParams): Promise<Component[]>;
    getRepoMetadata(params: GitHubRepoValidationRequestParams): Promise<GitHubRepoValidationResponse>;

    // mutations
    createProject(params: CreateProjectParams): Promise<Project>;
    createComponent(params: ComponentMutationParams): Promise<Component>;
    createByocComponent(params: CreateByocComponentParams): Promise<Component>;
    deleteComponent(params: DeleteComponentParams): Promise<void>;
    linkRepo(params: LinkRepoMutationParams): Promise<Repository>;
}
