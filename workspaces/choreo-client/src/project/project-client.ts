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
import { Component, Project, Repository } from "@wso2-enterprise/choreo-core";
import { CreateComponentParams, CreateProjectParams, GetComponentsParams, GetProjectsParams, IChoreoProjectClient, LinkRepoMutationParams } from "./types";
import { getComponentsByProjectIdQuery, getProjectsByOrgIdQuery } from './project-queries';
import { getCreateProjectMutation, getCreateComponentMutation } from './project-mutations';
import { IReadOnlyTokenStorage } from '../auth';
import { getHttpClient } from '../http-client';
import { AxiosResponse } from 'axios';

const CHOREO_API_PF = process.env.VSCODE_CHOREO_GATEWAY_BASE_URI ?
    `${process.env.VSCODE_CHOREO_GATEWAY_BASE_URI}/performance-analyzer/2.0.0/get_estimations/4.0` :
    "https://choreocontrolplane.choreo.dev/93tu/performance-analyzer/2.0.0/get_estimations/4.0";
const API_CALL_ERROR = "API CALL ERROR";

const CHOREO_API_TEST_DATA_GEN = process.env.VSCODE_CHOREO_GATEWAY_BASE_URI ?
    `${process.env.VSCODE_CHOREO_GATEWAY_BASE_URI}/ai-test-assistant/1.0.0/generate-data` :
    "https://apis.choreo.dev/ai-test-assistant/1.0.0/generate-data";

export class ChoreoProjectClient implements IChoreoProjectClient {

    constructor(private _tokenStore: IReadOnlyTokenStorage, private _baseURL: string) {
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

    async getComponents(params: GetComponentsParams): Promise<Component[]> {
        const { orgHandle, projId } = params;
        const query = getComponentsByProjectIdQuery(orgHandle, projId);
        try {
            const client = await this._getClient();
            const data = await client.request(query);
            return data.components;
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
                .post(CHOREO_API_PF, data, {
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

    async getSwaggerExamples(data: any): Promise<JSON> {
        const choreoToken = await this._tokenStore.getToken("choreo.vscode.token");
        if (!choreoToken) {
            throw new Error('User is not logged in');
        }

        const url = new URL(CHOREO_API_PF);

        const options = {
            url: CHOREO_API_TEST_DATA_GEN,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Authorization': `Bearer ${choreoToken.accessToken}`
            },
            body: data
        };

        console.log(`Calling swagger sample generator API - ${url.toString()} - ${new Date()}`);
        const perfData = await this.httpClient.sendRequest(options);
        if (!perfData) {
            throw new Error();
        }
        return perfData;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    linkRepo(_params: LinkRepoMutationParams): Promise<Repository> {
        throw new Error("Method not implemented."); // TODO: Kavith
    }
}
