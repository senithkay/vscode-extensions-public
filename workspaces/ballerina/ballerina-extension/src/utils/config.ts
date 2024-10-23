/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
    return workspace.getConfiguration('kolab');
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

export function isSupportedSLVersion(ballerinaExtInstance: BallerinaExtension, minSupportedVersion: number) {
    const ballerinaVersion: string = ballerinaExtInstance.ballerinaVersion.toLocaleLowerCase();
    const isGA: boolean = !ballerinaVersion.includes(VERSION.ALPHA) && !ballerinaVersion.includes(VERSION.BETA) && !ballerinaVersion.includes(VERSION.PREVIEW);

    const regex = /(\d+)\.(\d+)\.(\d+)/;
    const match = ballerinaVersion.match(regex);
    const currentVersionNumber = match ? Number(match.slice(1).join("")) : 0;

    if (minSupportedVersion <= currentVersionNumber && isGA) {
        return true;
    }
    return false;
}

