/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
