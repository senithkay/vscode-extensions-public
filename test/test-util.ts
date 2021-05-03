'use strict';
/**
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it

// Ballerina tools distribution will be copied to following location by maven
import * as fs from 'fs';
import * as path from 'path';
import { killPortProcess } from 'kill-port-process';

const TEST_RESOURCES = path.join(__dirname, '..', '..', 'extractedDistribution').toString();
const PLATFORM_PREFIX = /jballerina-tools-/;


function findBallerinaDistribution() {
    const directories = fs.readdirSync(TEST_RESOURCES);
    if (directories.length === 1) {
        return directories[0];
    }
    if (directories.length > 1) {
        directories.forEach(directory => {
            if (directory.startsWith('ballerina')) {
                return directory;
            }
        });
    }
    throw new Error("Unable to find ballerina distribution in test resources.");
}

export function getBallerinaHome(): string {
    const filePath = TEST_RESOURCES + path.sep + findBallerinaDistribution();
    return fs.realpathSync(filePath);
}

export function getBallerinaCmd(): string {
    const ballerinaDistribution = TEST_RESOURCES + path.sep + findBallerinaDistribution();
    const prefix = path.join(fs.realpathSync(ballerinaDistribution), "bin") + path.sep;
    return prefix + (process.platform === 'win32' ? 'bal.bat' : 'bal');
}

export function getBallerinaVersion() {
    return findBallerinaDistribution().replace(PLATFORM_PREFIX, '').replace('\n', '').trim();
}

export function getBBEPath(): any {
    return path.join(__dirname, '..', '..', 'resources', 'templates');
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function killPort(port: number) {
    if (process.platform !== 'win32') {
        (async () => {
            await killPortProcess(port);
        })();
    }
}
