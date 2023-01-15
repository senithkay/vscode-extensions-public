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
import { Project, Component, Repository } from "@wso2-enterprise/choreo-core";

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
    ballerinaVersion: string;
    accessibility: string;
    version: string;
    srcGitRepoUrl: string;
    repositorySubPath: string;
    repositoryType: string;
    repositoryBranch: string;
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
}

export interface IChoreoProjectClient {
    // queries
    getProjects(params: GetProjectsParams): Promise<Project[]>;
    getComponents(params: GetComponentsParams): Promise<Component[]>;

    // mutations
    createProject(params: CreateProjectParams): Promise<Project>;
    createComponent(params: ComponentMutationParams): Promise<Component>;
    linkRepo(params: LinkRepoMutationParams): Promise<Repository>;
}
