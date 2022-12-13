/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import axios from "axios";
import { GraphQLClient } from 'graphql-request';
import { ChoreoApimToken, ChoreoToken } from "../auth/inbuilt-impl";
import { getChoreoToken } from "../auth/storage";

import { API_BASE_URL, PROJECTS_API_URL } from "./config";

export async function getChoreoClient() {
    return axios.create({
        baseURL: API_BASE_URL,
        headers: {'Authorization': 'Bearer ' + (await getChoreoToken(ChoreoToken))?.accessToken},
    });
      
}

export async function getProjectsApiClient() {
    return new GraphQLClient(PROJECTS_API_URL, {
        headers: {
            Authorization: 'Bearer '  + (await getChoreoToken(ChoreoApimToken))?.accessToken,
        },
    });
}
