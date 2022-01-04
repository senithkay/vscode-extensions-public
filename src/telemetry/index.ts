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

import TelemetryReporter from "vscode-extension-telemetry";
import { BallerinaExtension } from "../core";

//Ballerina-VSCode-Extention repo key as default
const DEFAULT_KEY = "3a82b093-5b7b-440c-9aa2-3b8e8e5704e7";
const INSTRUMENTATION_KEY = process.env.CODE_SERVER_ENV && process.env.VSCODE_CHOREO_INSTRUMENTATION_KEY ? process.env.VSCODE_CHOREO_INSTRUMENTATION_KEY : DEFAULT_KEY;
const isWSO2User = process.env.VSCODE_CHOREO_USER_EMAIL ? process.env.VSCODE_CHOREO_USER_EMAIL.endsWith('@wso2.com') : false;

export function createTelemetryReporter(ext: BallerinaExtension): TelemetryReporter {
    const reporter = new TelemetryReporter(ext.getID(), ext.getVersion(), INSTRUMENTATION_KEY);
    if (ext.context) {
        ext.context.subscriptions.push(reporter);
    }
    return reporter;
}

export function sendTelemetryEvent(extension: BallerinaExtension, eventName: string, componentName: string,
    message: string = '', measurements?: any) {
    if (extension.isTelemetryEnabled()) {
        if (measurements) {
            let properties = {};
            Object.keys(measurements).forEach(key => {
                properties[key] = measurements[key];
            });
            extension.telemetryReporter.sendTelemetryEvent(eventName, getTelemetryProperties(extension, componentName,
                message), properties);
        } else {
            extension.telemetryReporter.sendTelemetryEvent(eventName, getTelemetryProperties(extension, componentName,
                message));
        }
    }
}

export function sendTelemetryException(extension: BallerinaExtension, error: Error, componentName: string,
    message: string = '') {
    if (extension.isTelemetryEnabled()) {
        extension.telemetryReporter.sendTelemetryException(error, getTelemetryProperties(extension, componentName,
            message));
    }
}

export function getTelemetryProperties(extension: BallerinaExtension, component: string, message: string)
    : { [key: string]: string; } {
    return {
        'ballerina.version': extension ? extension.ballerinaVersion : '',
        'ballerina.message': message,
        'scope': component,
        'idpId': process.env.VSCODE_CHOREO_USER_IDP_ID ? process.env.VSCODE_CHOREO_USER_IDP_ID : '',
        'isWSO2User' : isWSO2User ? 'true' : 'false',
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
    };
}

export * from "./events";
export * from "./exceptions";
export * from "./components";
export * from "./activator";
