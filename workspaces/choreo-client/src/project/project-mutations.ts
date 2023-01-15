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
import { CreateProjectParams, CreateComponentParams } from './types';

export function getCreateProjectMutation(params: CreateProjectParams) {
    const { name, description, orgId, orgHandle, version = "1.0.0", region = "US" } = params;
    return gql`
        mutation{ 
            createProject(project: {
                name: "${name}", description: "${description}",
                orgId: ${orgId}, orgHandler: "${orgHandle}",
                version: "${version}", region: "${region}",
            }){ 
                id, orgId, name, version, createdDate, handler, region, description,
            } 
        }
    `;
}

export function getCreateComponentMutation(params: CreateComponentParams) {
    const { name, displayName, description, orgId, orgHandle, projectId,
        accessibility, srcGitRepoUrl, repositorySubPath, repositoryBranch } = params;
    return gql`mutation
        { createComponent(component: {  
            name: "${name}",  
            orgId: ${orgId},  
            orgHandler: "${orgHandle}",
            displayName: "${displayName}",  
            displayType: "restAPI",  
            projectId: "${projectId}",  
            labels: "", 
            version: "1.0.0", 
            description: "${description}",
            apiId: "",
            ballerinaVersion: "swan-lake-alpha5",
            triggerChannels: "", 
            triggerID: null,  
            httpBase: true,
            sampleTemplate: "", 
            accessibility: "${accessibility}",
            srcGitRepoUrl: "${srcGitRepoUrl}" 
            repositorySubPath: "${repositorySubPath}", 
            repositoryType: "UserManagedNonEmpty",
            repositoryBranch: "${repositoryBranch}",})
            {  id, orgId, projectId, handler}
        }
    `;
}

