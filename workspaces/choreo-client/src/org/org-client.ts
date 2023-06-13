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

import { ComponentCount, Organization, UserInfo } from "@wso2-enterprise/choreo-core";
import { IReadOnlyTokenStorage } from "../auth";
import { IChoreoOrgClient } from "./types";
import { getHttpClient } from "../http-client";

export class ChoreoOrgClient implements IChoreoOrgClient {
    
    constructor(private _tokenStore: IReadOnlyTokenStorage, private _baseApiURL: string, private _orgApiURL: string) {  
    }

    private async _getBaseClient() {
        const token = await this._tokenStore.getToken("choreo.token");
        if (!token) {
            throw new Error('User is not logged in');
        }
        return getHttpClient(token.accessToken, this._baseApiURL)
    }

    private async _getOrgClient() {
        const token = await this._tokenStore.getToken("choreo.vscode.token");
        if (!token) {   
            throw new Error('User is not logged in');
        }
        return getHttpClient(token.accessToken, this._orgApiURL)
    }

    async validateUser(): Promise<UserInfo> {
        const client = await this._getBaseClient();
        try {
            const response = await client.get('/validate-user');
            return response.data as UserInfo;
        } catch (error) {
            throw new Error("Error while fetching user info.", { cause: error });
        }
    }

    async getOrganizations(): Promise<Organization[]> {
        const client = await this._getOrgClient();
        try {
            const response = await client.get('');
            return response.data as Organization[];
        } catch (error) {
            throw new Error("Error while fetching user organizations.", { cause: error });
        }
    }

    async getComponentCount(orgId: number): Promise<ComponentCount> {
        const client = await this._getOrgClient();
        try {
            const response = await client.get(`/${orgId}/component-count`);
            return response.data?.data as ComponentCount;
        } catch (error) {
            throw new Error("Error while fetching component usage", { cause: error });
        }
    }
}
