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
