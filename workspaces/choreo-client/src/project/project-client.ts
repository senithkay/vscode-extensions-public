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
import { ComponentMutationParams, CreateProjectParams, GetComponentsParams, GetProjectsParams, IChoreoProjectClient, LinkRepoMutationParams } from "./types";
import { getComponentsByProjectIdQuery, getProjectsByOrgIdQuery } from './project-queries';
import { getCreateProjectMutation } from './project-mutations';
import { IReadOnlyTokenStorage } from '../auth';

export const PROJECTS_API_URL = 'https://apis.choreo.dev/projects/1.0.0/graphql';

export class ChoreoProjectClient implements IChoreoProjectClient {

    constructor(private _tokenStore: IReadOnlyTokenStorage, private _baseURL: string = PROJECTS_API_URL) {
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
            throw new Error("Error while fetching projects. " , { cause: error });
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
    createComponent(_params: ComponentMutationParams): Promise<Component> {
        throw new Error("Method not implemented."); // TODO: Summaya
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    linkRepo(_params: LinkRepoMutationParams): Promise<Repository> {
        throw new Error("Method not implemented."); // TODO: Kavith
    }
}
