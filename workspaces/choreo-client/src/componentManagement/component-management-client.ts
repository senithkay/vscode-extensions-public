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

import { ComponentCount } from "@wso2-enterprise/choreo-core";
import axios from "axios";
import { IReadOnlyTokenStorage } from "../auth";
import { IComponentMgtClient } from "./types";

export class ComponentManagementClient implements IComponentMgtClient {
    
    constructor(private _tokenStore: IReadOnlyTokenStorage, private _baseURL: string) {  
    }

    private async _getClient() {
        const token = await this._tokenStore.getTokenForCurrentOrg();
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
        const client = await this._getClient();
        try {
            const response = await client.get(`/${orgId}/component-count`);
            return response.data?.data as ComponentCount;
        } catch (error) {
            throw new Error("Error while fetching component count", { cause: error });
        }
    }
}
