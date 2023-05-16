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
import axios, { CreateAxiosDefaults } from "axios";

export function getHttpClient(authToken?: string, baseURL?: string) {
    const config: CreateAxiosDefaults = {
    };
    if (authToken) {
        config.headers = { 'Authorization': `Bearer ${authToken}` };
    }
    if (baseURL) {
        config.baseURL = baseURL;
    }
    const client = axios.create(config);
    client.interceptors.response.use(null, (error) => {
        const maxRetries = 3;
        const config = error.config;

        // Keep track of the number of retries
        config.retryCount = config.retryCount || 0;
        config.retryCount++;

        if (config.retryCount > maxRetries) {
            // If all retries are exhausted, reject the promise with the last error
            return Promise.reject(error);
        }

        if (error.config && error.response && error.response.status === 429) {
            // If rate limited, retry after the specified time
            const retryAfter = parseInt(error.response.headers['retry-after'], 10) * 1000;
            return new Promise((resolve) => setTimeout(() => resolve(client(error.config)), retryAfter));
        }

        // ENOTFOUND: The DNS resolution failed, which means the hostname couldn't be resolved.
        // ETIMEDOUT: The connection timed out. This could happen if the server is taking too long to respond.
        // ECONNRESET: The connection was reset by the server. This could happen if the server closed the connection unexpectedly.
        // ESOCKETTIMEDOUT: The socket timed out. This could happen if the server is taking too long to send data.
        // ENETUNREACH: The network is unreachable. This could happen if there is no internet connection or if there is a problem with the network.
        // EHOSTUNREACH: The host is unreachable. This could happen if the server is down or if there is a problem with the network.
        // EPIPE: The pipe is broken. This could happen if the server closed the connection while data was being sent.
        // EAI_AGAIN: The DNS lookup failed temporarily. This could happen if there is a problem with the DNS server.
        if (error.code === 'ENOTFOUND'
            || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' 
            || error.code === 'ESOCKETTIMEDOUT'
            || error.code === 'ENETUNREACH' || error.code === 'EHOSTUNREACH' 
            || error.code === 'EPIPE' || error.code === 'EAI_AGAIN') {
            // If network error or timeout, retry the request
            return client(config);
        }

        // If some other error, throw it
        return Promise.reject(error);
    });
    return client;
}
