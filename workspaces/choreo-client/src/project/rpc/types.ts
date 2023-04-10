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
import { BuildStatus, Component, Deployment, Project, Repository } from '@wso2-enterprise/choreo-core';
import { RequestType } from 'vscode-messenger-common';
import { ComponentMutationParams, CreateByocComponentParams, CreateProjectParams, DeleteComponentParams, GetComponentsParams, GetProjectsParams, GitHubRepoValidationRequestParams, GitHubRepoValidationResponse, LinkRepoMutationParams, GetComponentDeploymentStatusParams, GetComponentBuildStatusParams } from '../types';

// queries
export const GetProjectsRequest: RequestType<GetProjectsParams, Project[]> = { method: 'project/getProjects' };
export const GetComponentsRequest: RequestType<GetComponentsParams, Component[]> = { method: 'project/getComponents' };
export const GetComponentDeploymentStatus: RequestType<GetComponentDeploymentStatusParams, Deployment | null> = { method: 'project/getComponentDeploymentStatus' };
export const GetComponentBuildStatus: RequestType<GetComponentBuildStatusParams, BuildStatus | null> = { method: 'project/getComponentBuildStatus' };
export const GetRepoMetaDataRequest: RequestType<GitHubRepoValidationRequestParams, GitHubRepoValidationResponse> = { method: 'project/getRepoMetaData' };


// mutations
export const CreateProjectRequest: RequestType<CreateProjectParams, Project> = { method: 'project/createProject' };
export const CreateComponentRequest: RequestType<ComponentMutationParams, Component> = { method: 'project/createComponent' };
export const CreateByocComponentRequest: RequestType<CreateByocComponentParams, Component> = { method: 'project/createByocComponent' };

export const LinkRepoRequest: RequestType<LinkRepoMutationParams, Repository> = { method: 'project/linkRepo' };
export const DeleteComponentRequest: RequestType<DeleteComponentParams, void> = { method: 'project/deleteComponent' };
