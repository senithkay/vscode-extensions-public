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

import { ExtensionContext, commands, window, Location, Uri } from 'vscode';
import { ballerinaExtInstance } from './core';
import { activate as activateDiagram } from './diagram';
import { activate as activateBBE } from './bbe';
import {
    activate as activateTelemetryListener, CMP_EXTENSION_CORE, sendTelemetryEvent,
    TM_EVENT_EXTENSION_ACTIVATE
} from './telemetry';
import { activateDebugConfigProvider } from './debugger';
import { activate as activateProjectFeatures } from './project';
import { activate as activateEditorSupport } from './editor-support';
import { activate as activatePackageOverview } from './tree-view';
import { activate as activateTesting } from './testing/activator';
import { activate as activateChoreoAuth } from './choreo-auth/activator';
import { StaticFeature, DocumentSelector, ServerCapabilities, InitializeParams } from 'vscode-languageclient';
import { ExtendedClientCapabilities, ExtendedLangClient } from './core/extended-language-client';
import { activate as activatePerformanceForecaster } from './forecaster';
import { activate as activateSwaggerView } from './swagger';
import { debug, log } from './utils';

let langClient: ExtendedLangClient;

// TODO initializations should be contributions from each component
function onBeforeInit(langClient: ExtendedLangClient) {
    class TraceLogsFeature implements StaticFeature {
        fillInitializeParams?: ((params: InitializeParams) => void) | undefined;
        dispose(): void {
        }
        fillClientCapabilities(capabilities: ExtendedClientCapabilities): void {
            capabilities.experimental = capabilities.experimental || {};
            capabilities.experimental.introspection = true;
        }
        initialize(_capabilities: ServerCapabilities, _documentSelector: DocumentSelector | undefined): void {
        }
    }

    class ShowFileFeature implements StaticFeature {
        fillInitializeParams?: ((params: InitializeParams) => void) | undefined;
        dispose(): void {

        }
        fillClientCapabilities(capabilities: ExtendedClientCapabilities): void {
            capabilities.experimental = capabilities.experimental || {};
            capabilities.experimental.showTextDocument = true;
        }
        initialize(_capabilities: ServerCapabilities, _documentSelector: DocumentSelector | undefined): void {
        }
    }

    langClient.registerFeature(new TraceLogsFeature());
    langClient.registerFeature(new ShowFileFeature());
}

export function activate(context: ExtensionContext): Promise<any> {
    debug('Active the Ballerina VS Code extension.');
    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_EXTENSION_ACTIVATE, CMP_EXTENSION_CORE);
    ballerinaExtInstance.setContext(context);
    return ballerinaExtInstance.init(onBeforeInit).then(() => {
        // start the features.
        // Enable package overview
        activatePackageOverview(ballerinaExtInstance);
        // Enable Ballerina diagram
        activateDiagram(ballerinaExtInstance);
        // Enable Ballerina by examples
        activateBBE(ballerinaExtInstance);
        // Enable Ballerina Debug Config Provider
        activateDebugConfigProvider(ballerinaExtInstance);
        // Enable Ballerina Project related features
        activateProjectFeatures();
        activateEditorSupport(ballerinaExtInstance);
        // Enable performance forecaster
        activatePerformanceForecaster(ballerinaExtInstance);
        // Enable swagger view
        activateSwaggerView(ballerinaExtInstance);
        // Enable the Choreo authentication
        activateChoreoAuth(ballerinaExtInstance);
        // Enable Ballerina Telemetry listener
        activateTelemetryListener(ballerinaExtInstance);
        activateTesting(ballerinaExtInstance);

        ballerinaExtInstance.onReady().then(() => {
            langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
            // Register showTextDocument listener
            langClient.onNotification('window/showTextDocument', (location: Location) => {
                if (location.uri !== undefined) {
                    window.showTextDocument(Uri.parse(location.uri.toString()), { selection: location.range });
                }
            });
        });
    }).catch((e) => {
        log("Failed to activate Ballerina extension. " + (e.message ? e.message : e));
        if (e.message && e.message.includes('Error when checking ballerina version.')) {
            ballerinaExtInstance.showMessageInstallBallerina();
        }
        // When plugins fails to start, provide a warning upon each command execution
        if (!ballerinaExtInstance.langClient) {
            const cmds: any[] = ballerinaExtInstance.extension.packageJSON.contributes.commands;
            cmds.forEach((cmd) => {
                const cmdID: string = cmd.command;
                commands.registerCommand(cmdID, () => {
                    const actionViewLogs = "View Logs";
                    window.showWarningMessage("Ballerina extension did not start properly."
                        + " Please check extension logs for more info.", actionViewLogs)
                        .then((action) => {
                            if (action === actionViewLogs) {
                                const logs = ballerinaExtInstance.getOutPutChannel();
                                if (logs) {
                                    logs.show();
                                }
                            }
                        });
                });
            });
        }
    });
}

export function deactivate(): Thenable<void> | undefined {
    debug('Deactive the Ballerina VS Code extension.');
    if (!langClient) {
        return;
    }
    return langClient.stop();
}
