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

import https from "https";
import { debug } from "../utils";
import { BallerinaExtension } from "../core";
import { LibrariesListResponse, LibraryDataResponse, LibraryKind, LibrarySearchResponse } from "./model";

export const cachedLibrariesList = new Map<string, LibrariesListResponse>();
export const cachedSearchList = new Map<string, LibrarySearchResponse>();
export const cachedLibraryData = new Map<string, LibraryDataResponse>();
export const LANG_LIB_LIST_CACHE = "LANG_LIB_LIST_CACHE";
export const STD_LIB_LIST_CACHE = "STD_LIB_LIST_CACHE";
export const LIBRARY_SEARCH_CACHE = "LIBRARY_SEARCH_CACHE";
const BAL_VERSION_CAPTURING_REGEXP = /\/ballerina-([a-z]+\d+)/g;
const options = {
    hostname: 'api.central.ballerina.io',
    port: 443,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};
let balVersion = 'slbeta6'; // This will overwrite if the ballerina version can be derived from the ballerina home (Cannot be derived when using the custom packs).
const DOC_API_PATH = '/2.0/docs';
const LIBRARIES_LIST_ENDPOINT = DOC_API_PATH + '/stdlib' + balVersion;
const LIBRARIES_SEARCH_ENDPOINT = LIBRARIES_LIST_ENDPOINT + '/search';

export function activate(ballerinaExtInstance: BallerinaExtension) {
    const balHome = ballerinaExtInstance.getBallerinaHome();
    const match = BAL_VERSION_CAPTURING_REGEXP.exec(balHome);
    if (match) {
        [, balVersion] = match;
    }
}

export function getLanguageLibrariesList(): Promise<LibrariesListResponse | undefined> {

    return new Promise((resolve, reject) => {

        if (cachedLibrariesList.has(LANG_LIB_LIST_CACHE)) {
            return resolve(cachedLibrariesList.get(LANG_LIB_LIST_CACHE));
        }

        let body = '';
        const req = https.request({ path: LIBRARIES_LIST_ENDPOINT, ...options }, res => {
            res.on('data', function (chunk) {
                body = body + chunk;
            });

            res.on('end',function(){
                if (res.statusCode !== 200) {
                    debug('Failed to fetch the language libraries list');
                } else {
                    const responseJson = {
                        'librariesList': JSON.parse(body)[LibraryKind.langLib]
                    };
                    return resolve(responseJson);
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

export function getStandardLibrariesList(): Promise<LibrariesListResponse | undefined> {

    return new Promise((resolve, reject) => {

        if (cachedLibrariesList.has(STD_LIB_LIST_CACHE)) {
            return resolve(cachedLibrariesList.get(STD_LIB_LIST_CACHE));
        }

        let body = '';
        const req = https.request({ path: LIBRARIES_LIST_ENDPOINT, ...options }, res => {
            res.on('data', function (chunk) {
                body = body + chunk;
            });

            res.on('end',function(){
                if (res.statusCode !== 200) {
                    debug('Failed to fetch the standard libraries list');
                } else {
                    const responseJson = {
                        'librariesList': JSON.parse(body)[LibraryKind.stdLib]
                    };
                    return resolve(responseJson);
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

export function getAllResources(): Promise<LibrarySearchResponse | undefined> {

    return new Promise((resolve, reject) => {

        if (cachedSearchList.has(LIBRARY_SEARCH_CACHE)) {
            return resolve(cachedSearchList.get(LIBRARY_SEARCH_CACHE));
        }

        let body = '';
        const req = https.request({ path: LIBRARIES_SEARCH_ENDPOINT, ...options }, res => {
            res.on('data', function (chunk) {
                body = body + chunk;
            });

            res.on('end',function(){
                if (res.statusCode !== 200) {
                    debug('Failed to fetch the library data');
                } else {
                    return resolve(JSON.parse(body));
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

export function getLibraryData(orgName: string, moduleName: string, version: string)
    : Promise<LibraryDataResponse | undefined> {

    return new Promise((resolve, reject) => {

        if (cachedLibraryData.has(`${orgName}_${moduleName}_${version}`)) {
            return resolve(cachedLibraryData.get(`${orgName}_${moduleName}_${version}`));
        }

        let body = '';
        const req = https.request({ path: `${DOC_API_PATH}/${orgName}/${moduleName}/${version}`, ...options }, res => {
            res.on('data', function (chunk) {
                body = body + chunk;
            });

            res.on('end',function(){
                if (res.statusCode !== 200) {
                    debug(`Failed to fetch the library data for ${orgName}:${moduleName}`);
                } else {
                    const libraryData = JSON.parse(body);
                    cachedLibraryData.set(`${orgName}_${moduleName}_${version}`, libraryData);
                    return resolve(libraryData);
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
