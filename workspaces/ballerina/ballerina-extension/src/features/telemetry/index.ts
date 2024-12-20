/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import TelemetryReporter from "vscode-extension-telemetry";
import { BallerinaExtension } from "../../core";

//Ballerina-VSCode-Extention repo key as default
const DEFAULT_KEY = "3a82b093-5b7b-440c-9aa2-3b8e8e5704e7";
const INSTRUMENTATION_KEY = process.env.CODE_SERVER_ENV && process.env.VSCODE_CHOREO_INSTRUMENTATION_KEY ? process.env.VSCODE_CHOREO_INSTRUMENTATION_KEY : DEFAULT_KEY;
const isWSO2User = process.env.VSCODE_CHOREO_USER_EMAIL ? process.env.VSCODE_CHOREO_USER_EMAIL.endsWith('@wso2.com') : false;
const isAnonymous = process.env.VSCODE_CHOREO_USER_EMAIL ? process.env.VSCODE_CHOREO_USER_EMAIL.endsWith('@choreo.dev') : false;
const CORRELATION_ID = process.env.VSCODE_CHOREO_CORRELATION_ID ? process.env.VSCODE_CHOREO_CORRELATION_ID : '';
const CHOREO_COMPONENT_ID = process.env.VSCODE_CHOREO_COMPONENT_ID ? process.env.VSCODE_CHOREO_COMPONENT_ID : '';
const CHOREO_PROJECT_ID = process.env.VSCODE_CHOREO_PROJECT_ID ? process.env.VSCODE_CHOREO_PROJECT_ID : '';
const CHOREO_ORG_ID = process.env.VSCODE_CHOREO_ORG_ID ? process.env.VSCODE_CHOREO_ORG_ID : '';

export function createTelemetryReporter(ext: BallerinaExtension): TelemetryReporter {
    const reporter = new TelemetryReporter(ext.getID(), ext.getVersion(), INSTRUMENTATION_KEY);
    if (ext.context) {
        ext.context.subscriptions.push(reporter);
    }
    return reporter;
}

export function sendTelemetryEvent(extension: BallerinaExtension, eventName: string, componentName: string,
    customDimensions: { [key: string]: string; } = {}, measurements: { [key: string]: number; } = {}) {
    // temporarily disabled in codeserver due to GDPR issue
    if (extension.isTelemetryEnabled() && !extension.getCodeServerContext().codeServerEnv) {
        extension.telemetryReporter.sendTelemetryEvent(eventName, getTelemetryProperties(extension, componentName,
            customDimensions), measurements);
    }
}

export function sendTelemetryException(extension: BallerinaExtension, error: Error, componentName: string,
    params: { [key: string]: string } = {}) {
    // temporarily disabled in codeserver due to GDPR issue
    if (extension.isTelemetryEnabled() && !extension.getCodeServerContext().codeServerEnv) {
        extension.telemetryReporter.sendTelemetryException(error, getTelemetryProperties(extension, componentName,
            params));
    }
}

export function getTelemetryProperties(extension: BallerinaExtension, component: string, params: { [key: string]: string; } = {})
    : { [key: string]: string; } {
    return {
        ...params,
        'kolab.version': extension ? extension.ballerinaVersion : '',
        'scope': component,
        'idpId': process.env.VSCODE_CHOREO_USER_IDP_ID ? process.env.VSCODE_CHOREO_USER_IDP_ID : '',
        'isWSO2User': isWSO2User ? 'true' : 'false',
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'AnonymousUser': isAnonymous ? 'true' : 'false',
        'correlationId': CORRELATION_ID,
        'component': CHOREO_COMPONENT_ID,
        'project': CHOREO_PROJECT_ID,
        'org': CHOREO_ORG_ID,
    };
}

export function getMessageObject(message?: string): { [key: string]: string; } {
    if (message) {
        return { 'kolab.message': message };
    }
    return {};
}

export * from "./events";
export * from "./exceptions";
export * from "./components";
export * from "./activator";
