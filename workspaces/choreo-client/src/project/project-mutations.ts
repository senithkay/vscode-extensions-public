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
import { CreateProjectParams, CreateComponentParams, CreateByocComponentParams, DeleteProjectParams } from './types';

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

export function deleteProjectMutation(params: DeleteProjectParams) {
    const { orgId, projectId } = params;
    return gql`
        mutation{ 
            deleteProject(orgId: ${orgId}, projectId: "${projectId}"){
                status,
                details 
            } 
      }
    `;
}

export function getCreateComponentMutation(params: CreateComponentParams) {
    const { name, displayName, displayType, description, orgId, orgHandle, projectId,
        accessibility, srcGitRepoUrl, repositorySubPath, repositoryBranch, bitbucketCredentialId } = params;
    return gql`mutation
        { createComponent(component: {  
            name: "${name}",  
            orgId: ${orgId},  
            orgHandler: "${orgHandle}",
            displayName: "${displayName}",  
            displayType: "${displayType}",  
            projectId: "${projectId}",  
            labels: "", 
            version: "1.0.0", 
            description: "${description}",
            apiId: "",
            triggerChannels: "", 
            triggerID: null,  
            httpBase: true,
            sampleTemplate: "", 
            accessibility: "${accessibility}",
            srcGitRepoUrl: "${srcGitRepoUrl}" 
            repositorySubPath: "${repositorySubPath}", 
            repositoryType: "UserManagedNonEmpty",
            repositoryBranch: "${repositoryBranch}",
            enableCellDiagram: true,
            secretRef: "${bitbucketCredentialId}"})
            {  id, orgId, projectId, handler }
        }
    `;
}

export function getCreateBYOCComponentMutation(params: CreateByocComponentParams) {
    const { name, displayName, componentType, description, orgId, orgHandler, projectId,
        accessibility, byocConfig, port } = params;
    if(!byocConfig){
        throw new Error('byocConfig not found')
    }
    const { dockerfilePath, dockerContext, srcGitRepoUrl, srcGitRepoBranch } = byocConfig;
    return gql`mutation
        { createByocComponent(component: {  
                name: "${name}", 
                displayName: "${displayName}",        
                description: "${description}", 
                orgId: ${orgId},  
                orgHandler: "${orgHandler}",
                projectId: "${projectId}",  
                labels: "", 
                componentType: "${componentType}", 
                port: ${port ?? 8090},
                oasFilePath: "",
                accessibility: "${accessibility}",
                byocConfig: {
                    dockerfilePath: "${dockerfilePath}", 
                    dockerContext: "${dockerContext}",
                    srcGitRepoBranch: "${srcGitRepoBranch}",
                    srcGitRepoUrl: "${srcGitRepoUrl}" 
                }
            })
            {  id, organizationId, projectId, handle }
        }
    `;
}

export function getCreateWebAppBYOCComponentMutation(params: CreateByocComponentParams) {
    const { name, displayName, componentType, description, orgId, orgHandler, projectId,
        accessibility, byocWebAppsConfig } = params;
    if(!byocWebAppsConfig){
        throw new Error('byocWebAppsConfig not found');
    }
    const { 
        dockerContext, 
        srcGitRepoUrl, 
        srcGitRepoBranch, 
        webAppBuildCommand, 
        webAppOutputDirectory, 
        webAppPackageManagerVersion, 
        webAppType 
    } = byocWebAppsConfig;
    return gql`mutation
        { createByocComponent(component: {  
                name: "${name}", 
                displayName: "${displayName}",        
                description: "${description}", 
                orgId: ${orgId},  
                orgHandler: "${orgHandler}",
                projectId: "${projectId}",  
                labels: "", 
                componentType: "${componentType}", 
                oasFilePath: "",
                accessibility: "${accessibility}",
                byocWebAppsConfig: {
                    dockerContext: "${dockerContext}",
                    srcGitRepoUrl: "${srcGitRepoUrl}",
                    srcGitRepoBranch: "${srcGitRepoBranch}",
                    webAppType: "${webAppType}"
                    webAppBuildCommand: "${webAppBuildCommand}"
                    webAppPackageManagerVersion: "${webAppPackageManagerVersion}"
                    webAppOutputDirectory: "${webAppOutputDirectory}"
                }
            })
            {  id, organizationId, projectId, handle }
        }
    `;
}