/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { LibraryDocResponse } from "../core";
import https from "https";
import { debug } from "../utils";

export function getBallerinaLibrariesList(version: string): Promise<LibraryDocResponse> {

    return new Promise((resolve, reject) => {

        const options = {
            hostname: 'api.staging-central.ballerina.io',
            path: `/2.0/docs/stdlib/${version}`,
            port: 443,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        let body = '';
        const req = https.request(options, res => {
            res.on('data', function (chunk) {
                body = body + chunk;
            });

            res.on('end',function(){
                console.log("Body :" + body);
                if (res.statusCode !== 200) {
                    debug('Failed to fetch the libraries list');
                } else {
                    const responseJson = JSON.parse(body);
                    return resolve({'librariesList': responseJson.langLibs});
                }
            });
        });

        req.on('error', error => {
            debug(error.message);
            reject();
        });

        req.end();
    });
}
