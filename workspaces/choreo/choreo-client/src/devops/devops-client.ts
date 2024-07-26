/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Buildpack, ChoreoComponentType } from "@wso2-enterprise/choreo-core";
import axios from "axios";
import { IReadOnlyTokenStorage } from "../auth";
import { GetBuildpackParams, IChoreoDevopsClient } from "./types";

export class ChoreoDevopsClient implements IChoreoDevopsClient {
    
    constructor(private _tokenStore: IReadOnlyTokenStorage, private _baseURL: string) {
    }

    private async _getClient(orgId: number) {
        const token = await this._tokenStore.getToken(orgId);
        if (!token) {
            throw new Error('User is not logged in');
        }
        const client = axios.create({
            baseURL: this._baseURL,
            headers: { 'Authorization': `Bearer ${token.accessToken}` }
        });
        return client;
    }

    async getBuildPacks(params: GetBuildpackParams): Promise<Buildpack[]> {
        const orgUuid = params.orgUuid;
        const component = params.componentType;
        const client = await this._getClient(params.orgId);

        let componentType = component;
        switch (component) {
            case ChoreoComponentType.ScheduledTask:
                componentType = 'scheduleTask';
                break;
            case ChoreoComponentType.ManualTrigger:
                componentType = 'manualTask';
                break;
        }

        try {
            const response = await client.get(`/api/v1/buildpacks?orgUuid=${orgUuid}&componentType=${componentType}`);
            return response.data as Buildpack[];
        } catch (error) {
            throw new Error("Error while fetching build packs.", { cause: error });
        }
    }
}
