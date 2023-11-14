/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ComponentCount } from "@wso2-enterprise/choreo-core";
import axios from "axios";
import { IReadOnlyTokenStorage } from "../auth";
import { IComponentMgtClient } from "./types";

export class ComponentManagementClient implements IComponentMgtClient {
    
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


    async getComponentCount(orgId: number): Promise<ComponentCount> {
        const client = await this._getClient(orgId);
        try {
            const response = await client.get(`/${orgId}/component-count`);
            return response.data?.data as ComponentCount;
        } catch (error) {
            throw new Error("Error while fetching component count", { cause: error });
        }
    }
}
