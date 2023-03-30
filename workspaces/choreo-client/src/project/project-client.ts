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
import { Component, Project, Repository, Environment, Deployments } from "@wso2-enterprise/choreo-core";
import { CreateComponentParams, CreateProjectParams, GetDiagramModelParams, GetComponentsParams, GetProjectsParams, IChoreoProjectClient, LinkRepoMutationParams, DeleteComponentParams } from "./types";
import {
    getComponentDeploymentQuery,
    getComponentEnvsQuery,
    getComponentsByProjectIdQuery,
    getComponentsWithCellDiagramQuery,
    getDeleteComponentQuery,
    getProjectsByOrgIdQuery,
} from './project-queries';
import { getCreateProjectMutation, getCreateComponentMutation } from './project-mutations';
import { IReadOnlyTokenStorage } from '../auth';
import { getHttpClient } from '../http-client';
import { AxiosResponse } from 'axios';

const API_CALL_ERROR = "API CALL ERROR";

export class ChoreoProjectClient implements IChoreoProjectClient {

    constructor(private _tokenStore: IReadOnlyTokenStorage, private _baseURL: string, private _perfAPI: string, private _swaggerExamplesAPI: string) {
    }

    private async _getClient() {
        const token = await this._tokenStore.getToken("choreo.apim.token");
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
            const client = await this._getClient();
            const data = await client.request(query);
            return data.projects;
        } catch (error) {
            throw new Error("Error while fetching projects. ", { cause: error });
        }

    }

    async deleteComponent(params: DeleteComponentParams): Promise<void> {
        const query = getDeleteComponentQuery(params.orgHandler, params.component?.id, params.projectId);
        try {
            const client = await this._getClient();
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
            const client = await this._getClient();
            const data = await client.request(query);

            const envQuery = getComponentEnvsQuery(params.orgUuid, params.projId);
            const envData = await client.request(envQuery);
            const devEnv = envData?.environments?.find((env: Environment) => env.name === 'Development');
            const prodEnv = envData?.environments?.find((env: Environment) => env.name === 'Production')

            const components: Component[] = await Promise.all(data.components.map(async (component: Component) => {
                const deployments: Deployments = {}
                const queryData = {
                    componentId: component.id,
                    orgHandler: orgHandle,
                    versionId: component.apiVersions[component.apiVersions.length - 1]?.id,
                    orgUuid: params.orgUuid,
                    environmentId: ""
                }

                const deploymentQueries: string[] = [];
                if (devEnv) {
                    queryData.environmentId = devEnv.id;
                    deploymentQueries.push(getComponentDeploymentQuery(queryData))
                }

                if (prodEnv) {
                    queryData.environmentId = prodEnv.id;
                    deploymentQueries.push(getComponentDeploymentQuery(queryData))
                }

                const deploymentRes = await Promise.all(deploymentQueries.map(async query => {
                    try{
                        const deploymentData = await client.request(query);
                        return deploymentData;
                    } catch {
                        // If the component has never been deployed, this call would return a 404
                        console.error(`Failed to get component deployment details for ${component.displayName}`);
                        return;
                    }
                }));
                deploymentRes?.forEach(deploymentData => {
                    if (devEnv && deploymentData?.componentDeployment?.environmentId === devEnv.id) {
                        deployments.dev = deploymentData.componentDeployment;
                    } else if (prodEnv && deploymentData?.componentDeployment?.environmentId === prodEnv.id) {
                        deployments.prod = deploymentData.componentDeployment
                    }
                })

                component.deployments = deployments;
                return component;
            }));

            return components;
        } catch (error) {
            throw new Error("Error while fetching components.", { cause: error });
        }
    }

    async createProject(params: CreateProjectParams): Promise<Project> {
        const mutation = getCreateProjectMutation(params);
        try {
            const client = await this._getClient();
            const data = await client.request(mutation);
            return data.createProject;
        } catch (error) {
            throw new Error("Error while creating project.", { cause: error });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createComponent(params: CreateComponentParams): Promise<Component> {
        const mutation = getCreateComponentMutation(params);
        console.log(mutation);
        try {
            const client = await this._getClient();
            const data = await client.request(mutation);
            console.log(data);
            return data.createComponent;
        } catch (error) {
            throw new Error("Error while creating component.", { cause: error });
        }
    }

    async getPerformanceForecastData(data: string): Promise<AxiosResponse> {
        const choreoToken = await this._tokenStore.getToken("choreo.vscode.token");
        if (!choreoToken) {
            throw new Error('User is not logged in');
        }

        console.log(`Calling perf API - ${new Date()}`);
        try {
            return await getHttpClient()
                .post(this._perfAPI, data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length,
                        'Authorization': `Bearer ${choreoToken.accessToken}`
                    }
                });
        } catch (err) {
            throw new Error(API_CALL_ERROR, { cause: err });
        }
    }

    async getSwaggerExamples(data: any): Promise<AxiosResponse> {
        const choreoToken = await this._tokenStore.getToken("choreo.vscode.token");
        if (!choreoToken) {
            throw new Error('User is not logged in');
        }

        console.log(`Calling swagger sample generator API - ${new Date()}`);
        try {
            return await getHttpClient()
                .post(this._swaggerExamplesAPI, data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length,
                        'Authorization': `Bearer ${choreoToken.accessToken}`
                    },
                    timeout: 15000
                });
        } catch (err) {
            throw new Error(API_CALL_ERROR, { cause: err });
        }
    }

    async getDiagramModel(params: GetDiagramModelParams): Promise<Component[]> {
        const { orgHandle, projId } = params;
        const query = getComponentsWithCellDiagramQuery(orgHandle, projId);
        try {
            const client = await this._getClient();
            const data = await client.request(query);
            return data.components;
        } catch (error) {
            throw new Error("Error while fetching components.", { cause: error });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    linkRepo(_params: LinkRepoMutationParams): Promise<Repository> {
        throw new Error("Method not implemented."); // TODO: Kavith
    }
}
