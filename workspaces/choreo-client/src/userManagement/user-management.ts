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

import { UserInfo } from "@wso2-enterprise/choreo-core";
import { IReadOnlyTokenStorage } from "../auth";
import { IChoreoUserManagementClient } from "./types";
import { getHttpClient } from "../http-client";

export class ChoreoUserManagementClient implements IChoreoUserManagementClient {
    
    constructor(private _tokenStore: IReadOnlyTokenStorage, private _baseApiURL: string) {  
    }

    private async _getClient() {
        const token = await this._tokenStore.getToken("choreo.token");
        if (!token) {
            throw new Error('User is not logged in');
        }
        return getHttpClient(token.accessToken, this._baseApiURL)
    }

    async validateUser(): Promise<UserInfo> {
        const client = await this._getClient();
        try {
            const response = await client.get('/validate/user');
            return response.data as UserInfo;
        } catch (error) {
            throw new Error("Error while fetching user info.", { cause: error });
        }
    }
}
