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
import { gql } from 'graphql-request';
import { getProjectsApiClient } from '.';
import { Component, ComponentDetailed, Project } from './types';

export async function getProjectsByOrg(orgId: string): Promise<Project[]> {
    const query = gql`
        query{
            projects(orgId: ${orgId}){
                id, orgId, name, version, createdDate, handler, region,
            }
        }
    `;

    return (await (await getProjectsApiClient()).request(query)).projects;
}

export async function getComponentsByProject(orgHandle: string, projectId: string): Promise<Component[]> {
    const query = gql`   
            query { 
                components(orgHandler: "${orgHandle}", projectId: "${projectId}") {
                    projectId, 
                    id, 
                    description, 
                    name, 
                    handler, 
                    displayName, 
                    displayType, 
                    version, 
                    createdAt, 
                    orgHandler,
                    repository{
                        nameApp,
                        nameConfig,
                        branch,
                        branchApp,
                        organizationApp,
                        organizationConfig,
                        isUserManage,
                        appSubPath,
                        byocBuildConfig {
                        id,
                        isMainContainer,
                        containerId,
                        componentId,
                        repositoryId,
                        dockerContext,
                        dockerfilePath,
                        oasFilePath,
                        }
                    }, 
                    apiVersions { 
                        apiVersion,
                        proxyName,
                        proxyUrl,
                        proxyId,
                        id,
                        state,
                        latest,
                        branch,
                        accessibility
                    }
                } 
            }
    `;

    return (await (await getProjectsApiClient()).request(query)).components;
}

export async function getComponent(projectId: string, componentHandler: string): Promise<ComponentDetailed> {
    const query = gql`
        query{
            component(
                projectId: "${projectId}",
                componentHandler: "${componentHandler}"
            ){
            id,
            name,
            handler,
            description,
            displayType,
            displayName,
            ownerName,
            orgId,
            orgHandler,
            version,
            labels,
            createdAt,
            updatedAt,
            projectId,
            apiId,
            httpBased,
            isMigrationCompleted,
            repository{
                nameApp,
                nameConfig,
                branch,
                branchApp,
                organizationApp,
                organizationConfig,
                isUserManage,
                appSubPath,
                byocBuildConfig {
                id,
                isMainContainer,
                containerId,
                componentId,
                repositoryId,
                dockerContext,
                dockerfilePath,
                oasFilePath,
                }
            },
            apiVersions{
                apiVersion,
                proxyName,
                proxyUrl,
                proxyId,
                id,
                state,
                latest,
                branch,
                accessibility,
                appEnvVersions{
                environmentId,
                releaseId,
                release{
                    id,
                    metadata{
                    choreoEnv
                    },
                    environmentId,
                    environment,
                    gitHash,
                    gitOpsHash,
                }
                }
            }
            }
        }
    `;
    return (await (await getProjectsApiClient()).request(query)).component;
}