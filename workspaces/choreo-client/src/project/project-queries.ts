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

export function getProjectsByOrgIdQuery(orgId: number) {
    return gql`
        query {
            projects(orgId: ${orgId}) {
                id, orgId, name, version, createdDate, handler, region, description
            }
        }
    `;
}

export function getComponentsByProjectIdQuery(orgHandle: string, projectId: string) {
    return gql`   
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
                repository {
                    nameApp,
                    nameConfig,
                    branch,
                    branchApp,
                    organizationApp,
                    organizationConfig,
                    isUserManage,
                    appSubPath,
                    gitProvider,
                    byocBuildConfig {
                        id,
                        isMainContainer,
                        containerId,
                        componentId,
                        repositoryId,
                        dockerContext,
                        dockerfilePath,
                        oasFilePath,
                    },
                    byocWebAppBuildConfig {
                        id,
                        containerId,
                        componentId,
                        repositoryId,
                        dockerContext,
                        webAppType,
                        buildCommand,
                        packageManagerVersion,
                        outputDirectory,
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
}

export function getComponentEnvsQuery(orgUuid: string, projectId: string) {
    return gql`   
        query { 
            environments(orgUuid: "${orgUuid}", projectId: "${projectId}") {
                name,
                id,
                choreoEnv,
                vhost,
                apiEnvName,
                isMigrating,
                apimEnvId,
                namespace,
                sandboxVhost,
            }
        }
    `;
}

interface getComponentDeploymentArgs {
    orgHandler: string;
    orgUuid: string;
    componentId: string;
    versionId: string;
    environmentId: string;
}

export function getComponentDeploymentQuery({ orgHandler, orgUuid, componentId, versionId, environmentId }:getComponentDeploymentArgs) {
    return gql`   
        query { 
            componentDeployment( orgHandler: "${orgHandler}", orgUuid: "${orgUuid}", componentId: "${componentId}", versionId: "${versionId}", environmentId: "${environmentId}") {
                environmentId
                configCount
                apiId
                releaseId
                apiRevision {
                    id
                    displayName
                }
                build{
                    buildId
                    deployedAt
                    commit {
                        author {
                            name
                            date
                            email
                            avatarUrl
                        }
                        sha
                        message
                        isLatest
                    }
                }
                invokeUrl
                versionId
                deploymentStatus
                deploymentStatusV2
                version
                cron
            }
        }
    `;
}

export function getComponentBuildStatus(componentId: string, versionId: string) {
    return gql`   
        query { 
            deploymentStatusByVersion(componentId: "${componentId}", versionId: "${versionId}") {
                id
                sha
                completed_at
                started_at
                name
                status
                conclusion
                isAutoDeploy
                failureReason
                sourceCommitId
            }
        }
    `;
}

export function getDeleteComponentQuery(orgHandler: string, componentId: string, projectId: string) {
    return gql`   
        mutation { 
            deleteComponentV2(orgHandler: "${orgHandler}", componentId: "${componentId}", projectId: "${projectId}") {
                status, canDelete, message
            }
        }
    `;
}

export function getRepoMetadataQuery(organizationName: string, repoName: string, branch: string, subPath?: string, dockerFilePath = "", dockerContextPath = "", openAPIPath = "", componentId = "") {
    return gql`
        query {
            repoMetadata (organizationName: "${organizationName}", repoName: "${repoName}", branch: "${branch}", subPath: "${subPath}", dockerFilePath: "${dockerFilePath}", dockerContextPath: "${dockerContextPath}", openAPIPath: "${openAPIPath}", componentId: "${componentId}") {
                 isBareRepo,
                 isSubPathEmpty
                 isSubPathValid
                 isValidRepo
                 hasBallerinaTomlInPath
                 hasBallerinaTomlInRoot
                 isDockerfilePathValid
                 hasDockerfileInPath
                 isDockerContextPathValid
                 isOpenApiFilePathValid
                 hasOpenApiFileInPath
                 hasPomXmlInPath
                 hasPomXmlInRoot
            }
        }`;
}


export function getBitBucketRepoMetadataQuery(organizationName: string, repoName: string, branch: string, credentialId: string, subPath?: string, dockerFilePath = "", dockerContextPath = "", openAPIPath = "", componentId = "") {
    return gql`
        query {
            repoMetadata (organizationName: "${organizationName}", repoName: "${repoName}", branch: "${branch}", subPath: "${subPath}", dockerFilePath: "${dockerFilePath}", dockerContextPath: "${dockerContextPath}", openAPIPath: "${openAPIPath}", componentId: "${componentId}", secretRef: "${credentialId}") {
                 isBareRepo,
                 isSubPathEmpty
                 isSubPathValid
                 isValidRepo
                 hasBallerinaTomlInPath
                 hasBallerinaTomlInRoot
                 isDockerfilePathValid
                 hasDockerfileInPath
                 isDockerContextPathValid
                 isOpenApiFilePathValid
                 hasOpenApiFileInPath
                 hasPomXmlInPath
                 hasPomXmlInRoot
            }
        }`;
}

export function getComponentsWithCellDiagramQuery(orgHandle: string, projectId: string) {
    return gql`   
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
                repository {
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
                    },
                    byocWebAppBuildConfig {
                        id,
                        containerId,
                        componentId,
                        repositoryId,
                        dockerContext,
                        webAppType,
                        buildCommand,
                        packageManagerVersion,
                        outputDirectory,
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
                    accessibility,
                    cellDiagram {
                        data,
                        message,
                        errorName,
                        success
                    }
                }
            } 
        }
    `;
}
