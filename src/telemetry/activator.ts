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

import { BallerinaExtension, ExtendedLangClient } from "src/core";
import { window } from "vscode";
import { getTelemetryProperties, TM_ERROR_LANG_SERVER, TM_EVENT_LANG_SERVER } from ".";

export function activate(ballerinaExtInstance: BallerinaExtension) {
    const reporter = ballerinaExtInstance.telemetryReporter;
    const langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;

    // Start listening telemtry events from language server
    ballerinaExtInstance.onReady().then(() => {
        langClient.onNotification('telemetry/event', (event: LSErrorTelemetryEvent | LSTelemetryEvent) => {
            if ('errorMessage' in event) {
                const errorEvent: LSErrorTelemetryEvent = event;
                const props: { [key: string]: string; } = getTelemetryProperties(ballerinaExtInstance, event.component, event.message)
                props["ballerina.langserver.error.stacktrace"] = errorEvent.errorStackTrace;
                props["ballerina.langserver.error.message"] = errorEvent.errorMessage;
                reporter.sendTelemetryEvent(TM_ERROR_LANG_SERVER, props);
            } else {
                reporter.sendTelemetryEvent(TM_EVENT_LANG_SERVER, getTelemetryProperties(ballerinaExtInstance, event.component, event.message));
            }
        });
    })
        .catch((e) => {
            window.showErrorMessage('Could not start telemetry listener feature', e.message);
        });
}

interface LSErrorTelemetryEvent {
    component: string;
    version: string;
    message: string;
    errorMessage: string;
    errorStackTrace: string;
}

interface LSTelemetryEvent {
    component: string;
    version: string;
    message: string;
}