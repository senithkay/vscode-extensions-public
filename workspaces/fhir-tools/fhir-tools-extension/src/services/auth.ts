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

import axios from 'axios';
import { ERROR_MESSAGES } from '../constants/messages';
import { TOKEN_ENDPOINT, APIKEY, ENABLE_AUTHORIZATION } from '../constants/config';

let cachedToken: string | undefined = undefined;

const auth = axios.create({
    baseURL: TOKEN_ENDPOINT,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
});

/**
 * @description Clear the cached token
 * @returns - void
 */
export function clearCachedToken() {
    cachedToken = undefined;
}

/**
 * @description Get the auth token from the server
 * @param clientId - The client id
 * @param clientSecret - The client secret
 * @returns - The auth token
 */
export async function getToken(refresh = false): Promise<string | Error> {
    if (!ENABLE_AUTHORIZATION) {
        return '';
    }
    
    if (refresh) {
        cachedToken = undefined;
    }

    if (cachedToken) {
        return cachedToken;
    }

    if (APIKEY === '' || APIKEY === undefined) {
        return new Error(
            ERROR_MESSAGES.API_KEY_NOT_FOUND +
                '::LOG::' +
                ERROR_MESSAGES.API_KEY_NOT_FOUND,
        );
    }

    if (TOKEN_ENDPOINT === '' || TOKEN_ENDPOINT === undefined) {
        return new Error(
            ERROR_MESSAGES.TOKEN_ENDPOINT_NOT_FOUND +
                '::LOG::' +
                ERROR_MESSAGES.TOKEN_ENDPOINT_NOT_FOUND,
        );
    }

    const response = await auth.post('/', "grant_type=client_credentials", {
        headers: {
            Authorization: `Basic ${Buffer.from(APIKEY).toString('base64')}`
        }
    });

    if (response.status !== 200) {
        return new Error(
            ERROR_MESSAGES.INVALID_AUTH_CREDETIALS +
                '::LOG::' +
                ERROR_MESSAGES.INVALID_AUTH_CREDENTIALS_LOG,
        );
    }

    cachedToken = response.data.access_token;

    return cachedToken;
}
