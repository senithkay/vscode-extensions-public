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
                id, orgId, name, version, createdDate, handler, region,
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
}
