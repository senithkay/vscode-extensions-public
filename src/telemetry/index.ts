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

const INSTRUMENTATION_KEY = "3a82b093-5b7b-440c-9aa2-3b8e8e5704e7";

export function createTelemetryReporter(ext: BallerinaExtension): TelemetryReporter {
    const reporter = new TelemetryReporter(ext.getID(), ext.getVersion(), INSTRUMENTATION_KEY);
    if (ext.context) {
        ext.context.subscriptions.push(reporter);
    }
    return reporter;
}

export function sendTelemetryEvent(extension: BallerinaExtension, eventName: string, componentName: string,
    message: any = '') {
    if (extension.isTelemetryEnabled()) {
        extension.telemetryReporter.sendTelemetryEvent(eventName, getTelemetryProperties(extension, componentName,
            message));
    }
}

export function sendTelemetryException(extension: BallerinaExtension, error: Error, componentName: string,
    message: string = '') {
    if (extension.isTelemetryEnabled()) {
        extension.telemetryReporter.sendTelemetryException(error, getTelemetryProperties(extension, componentName,
            message));
    }
}

export function getTelemetryProperties(extension: BallerinaExtension, component: string, message: any)
    : { [key: string]: string; } {
    if (typeof message === 'string') {
        return {
            'ballerina.version': extension ? extension.ballerinaVersion : '',
            'ballerina.component': component,
            'ballerina.message': message
        };
    } else {
        let object = {};
        object['ballerina.version'] = extension ? extension.ballerinaVersion : '';
        object['ballerina.component'] = component;
        Object.keys(message).forEach(key => {
            object[key] = message[key];
        });
        return object;
    }
}

export * from "./events";
export * from "./exceptions";
export * from "./components";
export * from "./activator";
