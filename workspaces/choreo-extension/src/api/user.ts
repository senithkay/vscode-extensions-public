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
/* eslint-disable @typescript-eslint/naming-convention */

import { getChoreoClient } from ".";
import { UserInfo } from "./types";

export async function getUserInfo(): Promise<UserInfo> {
    const client = await getChoreoClient();
    return new Promise(async (resolve, reject) => {
        try {
            const resp = await client.get('/validate-user', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            resolve(resp.data as UserInfo);
        } catch (error) {
            reject(error);
        }
    });
}

