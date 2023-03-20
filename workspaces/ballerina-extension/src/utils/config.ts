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

import { BallerinaExtension } from '../core';
import { WorkspaceConfiguration, workspace } from 'vscode';

export enum VERSION {
    BETA = 'beta',
    ALPHA = 'alpha',
    PREVIEW = 'preview'
}

interface BallerinaPluginConfig extends WorkspaceConfiguration {
    home?: string;
    debugLog?: boolean;
    classpath?: string;
}

export function getPluginConfig(): BallerinaPluginConfig {
    return workspace.getConfiguration('ballerina');
}

export function isWindows(): boolean {
    return process.platform === "win32";
}

export function isSupportedVersion(ballerinaExtInstance: BallerinaExtension, supportedRelease: VERSION,
    supportedVersion: number): boolean {
    const ballerinaVersion: string = ballerinaExtInstance.ballerinaVersion.toLocaleLowerCase();
    const isPreview: boolean = ballerinaVersion.includes(VERSION.PREVIEW);
    const isAlpha: boolean = ballerinaVersion.includes(VERSION.ALPHA);
    if ((supportedRelease == VERSION.BETA && (isAlpha || isPreview)) || (supportedRelease == VERSION.ALPHA &&
        isPreview)) {
        return false;
    }

    const isBeta: boolean = ballerinaVersion.includes(VERSION.BETA);
    if ((!isAlpha && !isBeta && !isPreview) || (supportedRelease == VERSION.ALPHA && isBeta)) {
        return true;
    }

    if ((supportedRelease == VERSION.ALPHA && isAlpha) || (supportedRelease == VERSION.BETA && isBeta)) {
        const digits = ballerinaVersion.replace(/[^0-9]/g, "");
        const versionNumber = +digits;
        if (supportedVersion <= versionNumber) {
            return true;
        }
    }
    return false;
}
