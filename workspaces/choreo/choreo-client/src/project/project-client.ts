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
import { GraphQLClient } from 'graphql-request';
import {
    Component,
    Project,
    Repository,
    Environment,
    Deployment,
    BuildStatus,
    ProjectDeleteResponse,
    EndpointData,
    ComponentYamlContent
} from "@wso2-enterprise/choreo-core";
import {
    CreateComponentParams,
    CreateProjectParams,
    GetDiagramModelParams,
    GetComponentsParams,
    GetProjectsParams,
    IChoreoProjectClient,
    LinkRepoMutationParams,
    DeleteComponentParams,
    GitHubRepoValidationRequestParams,
    GetComponentDeploymentStatusParams,
    GitHubRepoValidationResponse,
    CreateByocComponentParams,
    GetProjectEnvParams,
    GetComponentBuildStatusParams,
    DeleteProjectParams,
    PerformanceForecastDataRequest,
    GetSwaggerExamplesRequest, CreateBuildpackComponentParams, CreateMiComponentParams,
} from "./types";
import {
    getRepoMetadataQuery,
    getComponentBuildStatus,
    getComponentDeploymentQuery,
    getComponentEnvsQuery,
    getComponentsByProjectIdQuery,
    getComponentsWithCellDiagramQuery,
    getDeleteComponentQuery,
    getEndpointsForVersion,
    getProjectsByOrgIdQuery,
} from './project-queries';
import { getCreateProjectMutation, getCreateComponentMutation, getCreateBYOCComponentMutation as getCreateByocComponentMutation, deleteProjectMutation, getCreateWebAppBYOCComponentMutation, getCreateBuildpackComponentMutation, getCreateMiComponentMutation } from './project-mutations';
import { IReadOnlyTokenStorage } from '../auth';
import { getHttpClient } from '../http-client';
import { AxiosResponse } from 'axios';

const API_CALL_ERROR = "API CALL ERROR";

export class ChoreoProjectClient implements IChoreoProjectClient {
    constructor(
        private _tokenStore: IReadOnlyTokenStorage,
        private _baseURL: string,
        private _perfAPI?: string,
        private _swaggerExamplesAPI?: string,
        private _declarativeAPI?: string
    ) {}

    private async _getClient(orgId: number) {
        const token = await this._tokenStore.getToken(orgId);
        if (!token) {
            throw new Error('User is not logged in');
        }
        const client = new GraphQLClient(this._baseURL, {
            headers: {
                Authorization: 'Bearer ' + token.accessToken,
            },
        });
        return client;
    }

    async getProjects(params: GetProjectsParams): Promise<Project[]> {
        const query = getProjectsByOrgIdQuery(params.orgId);
        try {
            const client = await this._getClient(params.orgId);
            const data = await client.request(query);
            return data.projects;
        } catch (error) {
            throw new Error("Error while fetching projects. ", { cause: error });
        }

    }

    async deleteComponent(params: DeleteComponentParams): Promise<void> {
        const query = getDeleteComponentQuery(params.orgHandle, params.component?.id, params.projectId);
        try {
            const client = await this._getClient(params.orgId);
            const data = await client.request(query);
            return data.projects;
        } catch (error) {
            throw new Error("Error while deleting component ", { cause: error });
        }
    }

    async getComponents(params: GetComponentsParams): Promise<Component[]> {
        const { orgHandle, projId } = params;
        const query = getComponentsByProjectIdQuery(orgHandle, projId);
        try {
            const client = await this._getClient(params.orgId);
            const data = await client.request(query);
            return data.components;
        } catch (error) {
            throw new Error("Error while fetching components.", { cause: error });
        }
    }

    async getProjectEnv(params: GetProjectEnvParams): Promise<Environment[]> {
        const client = await this._getClient(params.orgId);
        try {
            const envQuery = getComponentEnvsQuery(params.orgUuid, params.projId);
            const envDataRes = await client.request(envQuery);
            return envDataRes?.environments;
        } catch (error) {
            throw new Error("Error while creating component.", { cause: error });
        }
    }

    async getComponentBuildStatus(params: GetComponentBuildStatusParams): Promise<BuildStatus | null> {
        const client = await this._getClient(params.orgId);
        try {
            const query = getComponentBuildStatus(params.componentId, params.versionId);
            const response = await client.request(query);
            return response?.deploymentStatusByVersion?.[0] || null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            // If the component has never been built, this call would return a 404
            if (error.response?.status === 404) {
                return null;
            }
            throw new Error(`Failed to get component build details for ${params.componentId}` , { cause: error });
        }
    }

    async getComponentDeploymentStatus(params: GetComponentDeploymentStatusParams): Promise<Deployment | null> {
        const client = await this._getClient(params.orgId);
        try {
            const queryData = {
                componentId: params.component.id,
                orgHandler: params.orgHandle,
                versionId: params.versionId,
                orgUuid: params.orgUuid,
                environmentId: params.envId
            }

            const query = getComponentDeploymentQuery(queryData);
            const deploymentData = await client.request(query);

            return deploymentData?.componentDeployment;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            // If the component has never been deployed, this call would return a 404
            if (error.response?.status === 404) {
                return null;
            }
            throw new Error(`Failed to get component deployment details for ${params.component.displayName}`, { cause: error });
        }
    }

    async createProject(params: CreateProjectParams): Promise<Project> {
        const mutation = getCreateProjectMutation(params);
        try {
            const client = await this._getClient(params.orgId);
            const data = await client.request(mutation);
            return data.createProject;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error("Project limit exceeded.", { cause: error });
            }
            throw new Error("Error while creating project.", { cause: error });
        }
    }

    async deleteProject(params: DeleteProjectParams): Promise<ProjectDeleteResponse> {
        const mutation = deleteProjectMutation(params);
        try {
            const client = await this._getClient(params.orgId);
            const data = await client.request(mutation);
            return data.deleteProject;
        } catch (error) {
            throw new Error("Error while deleting project.", { cause: error });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createComponent(params: CreateComponentParams): Promise<Component> {
        const mutation = getCreateComponentMutation(params);
        console.log(mutation);
        try {
            const client = await this._getClient(params.orgId);
            const data = await client.request(mutation);
            console.log(data);
            return data.createComponent;
        } catch (error) {
            throw new Error("Error while creating component.", { cause: error });
        }
    }

    async createByocComponent(params: CreateByocComponentParams): Promise<Component> {
        const mutation = getCreateByocComponentMutation(params);
        try {
            const client = await this._getClient(params.orgId);
            const data = await client.request(mutation);
            return data.createComponent;
        } catch (error) {
            throw new Error("Error while creating component.", { cause: error });
        }
    }

    async createWebAppByocComponent(params: CreateByocComponentParams): Promise<Component> {
        const mutation = getCreateWebAppBYOCComponentMutation(params);
        try {
            const client = await this._getClient(params.orgId);
            const data = await client.request(mutation);
            return data.createComponent;
        } catch (error) {
            throw new Error("Error while creating component.", { cause: error });
        }
    }

    async createBuildPackComponent(params: CreateBuildpackComponentParams): Promise<Component> {
        const mutation = getCreateBuildpackComponentMutation(params);
        try {
            const client = await this._getClient(params.orgId);
            const data = await client.request(mutation);
            return data.createComponent;
        } catch (error) {
            throw new Error("Error while creating component.", { cause: error });
        }
    }

    

    async createMiComponent(params: CreateMiComponentParams): Promise<Component> {
        const mutation = getCreateMiComponentMutation(params);
        try {
            const client = await this._getClient(params.orgId);
            const data = await client.request(mutation);
            return data.createComponent;
        } catch (error) {
            throw new Error("Error while creating component.", { cause: error });
        }
    }

    async getPerformanceForecastData(params: PerformanceForecastDataRequest): Promise<AxiosResponse> {
        const { orgId, data } = params;
        const token = await this._tokenStore.getToken(orgId);
        if (!token) {
            throw new Error('User is not logged in');
        }

        console.log(`Calling perf API - ${new Date()}`);
        try {
            if(!this._perfAPI){
                throw new Error('Performance API endpoint not provided');
            }
            return await getHttpClient()
                .post(this._perfAPI, data, {
                headers: {
                    'Content-Type': 'application/json',
                        'Content-Length': data.length,
                    'Authorization': `Bearer ${token.accessToken}`
                    }
            });
        } catch (err) {
            throw new Error(API_CALL_ERROR, { cause: err });
        }
    }

    async getSwaggerExamples(params: GetSwaggerExamplesRequest): Promise<AxiosResponse> {
        const { orgId, data } = params;
        const token = await this._tokenStore.getToken(orgId);
        if (!token) {
            throw new Error('User is not logged in');
        }

        console.log(`Calling swagger sample generator API - ${new Date()}`);
        try {
            if(!this._swaggerExamplesAPI){
                throw new Error('Swagger examples API endpoint not provided');
            }
            return await getHttpClient()
                .post(this._swaggerExamplesAPI, data, {
                headers: {
                    'Content-Type': 'application/json',
                        'Content-Length': data.length,
                    'Authorization': `Bearer ${token.accessToken}`
                },
                timeout: 15000
            });
        } catch (err) {
            throw new Error(API_CALL_ERROR, { cause: err });
        }
    }

    async getRepoMetadata(params: GitHubRepoValidationRequestParams): Promise<GitHubRepoValidationResponse> {
        const { orgId, organization, repo, branch, path, dockerfile, dockerContextPath, openApiPath, componentId, credentialId } = params;
        const query = getRepoMetadataQuery(organization, repo, branch, credentialId, path, dockerfile, dockerContextPath, openApiPath, componentId);

        try {
            const client = await this._getClient(orgId);
            const data = await client.request(query);
            return data.repoMetadata;
        } catch (error) {
            throw new Error("Error while executing " + query, { cause: error, });
        }
    }

    async getDiagramModel(params: GetDiagramModelParams): Promise<Component[]> {
        const { orgHandle, projId } = params;
        const query = getComponentsWithCellDiagramQuery(orgHandle, projId);
        try {
            const client = await this._getClient(params.orgId);
            const data = await client.request(query);
            return data.components;
        } catch (error) {
            throw new Error("Error while fetching components.", { cause: error });
        }
    }

    async getEndpointData(componentId: string, version: string, orgId: number): Promise<EndpointData | null> {
        const query = getEndpointsForVersion(componentId, version);
        try {
            const client = await this._getClient(`${orgId}` as any);
            return await client.request(query);
        } catch (error) {
            throw new Error("Error while fetching endpoint data.", { cause: error });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    linkRepo(_params: LinkRepoMutationParams): Promise<Repository> {
        throw new Error("Method not implemented."); // TODO: Kavith
    }

    async getComponentConfig(orgId: number, projectHandler: string, componentName: string): Promise<ComponentYamlContent[] | undefined> {
        const token = await this._tokenStore.getToken(orgId);
        if (!token) {
            throw new Error("User is not logged in");
        }

        console.log(`Calling declarative API - ${new Date()}`);

        try {
            if (!this._declarativeAPI) {
                throw new Error("Declarative API endpoint not provided");
            }
            const res = await getHttpClient().get(
                `${this._declarativeAPI}/projectName/${projectHandler}/componentName/${componentName}/component-config`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token.accessToken}`,
                    },
                }
            );
            return res.data as ComponentYamlContent[];
        } catch (err) {
            throw new Error(API_CALL_ERROR, { cause: err });        
        }    
    }
}
