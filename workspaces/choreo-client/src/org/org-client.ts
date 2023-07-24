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

import { Organization } from "@wso2-enterprise/choreo-core";
import { IChoreoOrgClient } from "./types";
import { getHttpClient } from "../http-client";

export class ChoreoOrgClient implements IChoreoOrgClient {
    
    constructor(private _orgApiURL: string) {  
    }

    private async _getOrgClient(choreoAccessToken: string) {
        if (!choreoAccessToken) {
            throw new Error('No access token provided');
        }
        return getHttpClient(choreoAccessToken, this._orgApiURL)
    }

    async getOrganizations(choreoAccessToken: string): Promise<Organization[]> {
        const client = await this._getOrgClient(choreoAccessToken);
        try {
            const response = await client.get('');
            return response.data as Organization[];
        } catch (error) {
            throw new Error("Error while fetching user organizations.", { cause: error });
        }
    }
}
