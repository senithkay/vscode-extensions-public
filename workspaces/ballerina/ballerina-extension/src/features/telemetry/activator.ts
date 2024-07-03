/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BallerinaExtension, ExtendedLangClient, TelemetryTracker } from "../../core";
import { debug } from "../../utils";
import { window } from "vscode";
import {
    CMP_EDITOR_SUPPORT, getMessageObject, getTelemetryProperties, sendTelemetryEvent, TM_ERROR_LANG_SERVER,
    TM_EVENT_EDIT_DIAGRAM, TM_EVENT_EDIT_SOURCE, TM_EVENT_KILL_TERMINAL, TM_FEATURE_USAGE_LANG_SERVER
} from ".";

const schedule = require('node-schedule');

// Language server telemetry event types
const TM_EVENT_TYPE_ERROR = "ErrorTelemetryEvent";
const TM_EVENT_TYPE_FEATURE_USAGE = "FeatureUsageTelemetryEvent";

export function activate(ballerinaExtInstance: BallerinaExtension) {
    const reporter = ballerinaExtInstance.telemetryReporter;
    const langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;

    // Start listening telemtry events from language server
    langClient.onNotification('telemetry/event', (event: LSTelemetryEvent) => {
        let props: { [key: string]: string; };
        switch (event.type) {
            case TM_EVENT_TYPE_ERROR:
                const errorEvent: LSErrorTelemetryEvent = <LSErrorTelemetryEvent>event;
                props = getTelemetryProperties(ballerinaExtInstance, event.component, getMessageObject(TM_EVENT_TYPE_ERROR));
                props["ballerina.langserver.error.description"] = errorEvent.message;
                props["ballerina.langserver.error.stacktrace"] = errorEvent.errorStackTrace;
                props["ballerina.langserver.error.message"] = errorEvent.errorMessage;
                reporter.sendTelemetryEvent(TM_ERROR_LANG_SERVER, props);
                break;
            case TM_EVENT_TYPE_FEATURE_USAGE:
                const usageEvent: LSFeatureUsageTelemetryEvent = <LSFeatureUsageTelemetryEvent>event;
                props = getTelemetryProperties(ballerinaExtInstance, event.component,
                    getMessageObject(TM_EVENT_TYPE_FEATURE_USAGE));
                props["ballerina.langserver.feature.name"] = usageEvent.featureName;
                props["ballerina.langserver.feature.class"] = usageEvent.featureClass;
                props["ballerina.langserver.feature.message"] = usageEvent.featureMessage;
                reporter.sendTelemetryEvent(TM_FEATURE_USAGE_LANG_SERVER, props);
                break;
            default:
                // Do nothing
                break;
        }
    });

    if (ballerinaExtInstance?.getCodeServerContext().codeServerEnv) {
        schedule.scheduleJob('* * * * *', function () {
            debug(`Publish LS client telemetry at ${new Date()}`);
            langClient.pushLSClientTelemetries();
            const telemetryTracker: TelemetryTracker = ballerinaExtInstance.getCodeServerContext().telemetryTracker!;
            if (telemetryTracker.hasTextEdits()) {
                //editor-workspace-edit-source
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_EDIT_SOURCE, CMP_EDITOR_SUPPORT);
            }
            if (telemetryTracker.hasDiagramEdits()) {
                //editor-workspace-edit-diagram
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_EDIT_DIAGRAM, CMP_EDITOR_SUPPORT);
            }
            telemetryTracker.reset();
        });
    }

    //editor-terminal-kill
    window.onDidCloseTerminal(t => {
        sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_KILL_TERMINAL, '');
    });
}

interface LSTelemetryEvent {
    type: string;
    component: string;
    version: string;
}

interface LSErrorTelemetryEvent extends LSTelemetryEvent {
    message: string;
    errorMessage: string;
    errorStackTrace: string;
}

interface LSFeatureUsageTelemetryEvent extends LSTelemetryEvent {
    featureName: string;
    featureClass: string;
    featureMessage: string;
}
