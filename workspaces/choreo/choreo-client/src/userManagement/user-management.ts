/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { UserInfo } from "@wso2-enterprise/choreo-core";
import { IChoreoUserManagementClient } from "./types";
import { getHttpClient } from "../http-client";

export class ChoreoUserManagementClient implements IChoreoUserManagementClient {
    
    constructor(private _baseApiURL: string) {  
    }

    private async _getClient(asgardioToken: string) {
        if (!asgardioToken) {
            throw new Error('Asgardio token is not provided');
        }
        return getHttpClient(asgardioToken, this._baseApiURL)
    }

    async validateUser(asgardioToken: string): Promise<UserInfo> {
        const client = await this._getClient(asgardioToken);
        try {
            const response = await client.get('/validate/user');
            return response.data as UserInfo;
        } catch (error) {
            throw new Error("Error while fetching user info.", { cause: error });
        }
    }
}
