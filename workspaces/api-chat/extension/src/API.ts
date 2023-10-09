/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: 'https://f2c7f522-ef47-48ce-a429-3fc2f15d2011-prod.e1-us-east-azure.choreoapis.dev/dlsm/testgptservice/endpoint-9090-803/v1'
});

const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const auth = axios.create({
    baseURL: 'https://sts.choreo.dev/oauth2'
})

const apiKey = process.env.API_KEY;
let refreshToken = "";
// Resolve Oauth client credential
const resolveOauthClientCredential = async () => {
    // Your code here to resolve Oauth client credential
    try {
        if (!apiKey) {
            throw new Error('API_KEY is not defined in the environment variables');
        }

        const response = await auth.post('/token', "grant_type=client_credentials", {
            headers: {
                Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}`
            }
        });
        const accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;
        instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch (error) {
        console.error('Failed to resolve Oauth client credential:', error);
    }
};

const API = {
    ready: new Promise((resolve, reject) => {
        resolveOauthClientCredential()
            .then(() => {
                resolve(instance);
            })
            .catch((error) => {
                reject(error);
            });
    })
};

// Function to refresh the access token
const refreshAccessToken = async () => {
    try {
        const response = await auth.post('/token', "grant_type=refresh_token", {
            headers: {
                Authorization: `Bearer ${refreshToken}`
            }
        });
        const newAccessToken = response.data.access_token;
        instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        return newAccessToken;
    } catch (error) {
        console.error('Failed to refresh access token:', error);
        throw error;
    }
};

// Interceptor to automatically refresh token on 401 error
instance.interceptors.response.use(
    response => response,
    async error => {
        if (error.response && error.response.status === 401) {
            try {
                const newAccessToken = await refreshAccessToken();
                error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axios.request(error.config);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default API;