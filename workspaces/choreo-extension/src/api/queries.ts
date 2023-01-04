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
import { gql } from 'graphql-request';
import { getProjectsApiClient } from '.';
import { Component, ComponentDetailed, Project } from '@wso2-enterprise/choreo-core';

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