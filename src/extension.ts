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
import { ExtensionContext, commands, window, Location, Uri } from 'vscode';
import { ballerinaExtInstance } from './core';
// import { activate as activateAPIEditor } from './api-editor';
// import { activate as activateDiagram } from './diagram'; 
import { activate as activateBBE } from './bbe';
// import { activate as activateTraceLogs } from './trace-logs';
import { activate as activateTelemetryListener } from './telemetry';
import { activateDebugConfigProvider } from './debugger';
import { activate as activateProjectFeatures } from './project';
import { activate as activateEditorSupport } from './editor-support';
import { activate as activatePackageOverview } from './tree-view';
import { StaticFeature, ClientCapabilities, DocumentSelector, ServerCapabilities } from 'vscode-languageclient';
import { ExtendedLangClient } from './core/extended-language-client';
import { log } from './utils';

// TODO initializations should be contributions from each component
function onBeforeInit(langClient: ExtendedLangClient) {
    class TraceLogsFeature implements StaticFeature {
        fillClientCapabilities(capabilities: ClientCapabilities): void {
            capabilities.experimental = capabilities.experimental || {};
            capabilities.experimental.introspection = true;
        }
        initialize(capabilities: ServerCapabilities, documentSelector: DocumentSelector | undefined): void {
        }
    }

    class ShowFileFeature implements StaticFeature {
        fillClientCapabilities(capabilities: ClientCapabilities): void {
            capabilities.experimental = capabilities.experimental || {};
            capabilities.experimental.showTextDocument = true;
        }
        initialize(capabilities: ServerCapabilities, documentSelector: DocumentSelector | undefined): void {
        }
    }

    langClient.registerFeature(new TraceLogsFeature());
    langClient.registerFeature(new ShowFileFeature());
}

export function activate(context: ExtensionContext): Promise<any> {
    ballerinaExtInstance.setContext(context);
    return ballerinaExtInstance.init(onBeforeInit).then(() => {
        // start the features.
        // Enable Ballerina diagram
        // TODO: Remove the deprecated diagram extension. Avoid activating for now. 
        // activateDiagram(ballerinaExtInstance);
        // Enable Ballerina by examples
        activateBBE(ballerinaExtInstance);
        // Enable Network logs
        // activateTraceLogs(ballerinaExtInstance);
        // Enable Ballerina Debug Config Provider
        activateDebugConfigProvider(ballerinaExtInstance);
        // Enable Ballerina API Designer
        // activateAPIEditor(ballerinaExtInstance);
        // Enable Ballerina Project related features
        activateProjectFeatures();
        activateEditorSupport(ballerinaExtInstance);
        // Enable package overview
        activatePackageOverview(ballerinaExtInstance);
        if (ballerinaExtInstance.isSwanLake) {
            // Enable Ballerina Telemetry listener
            activateTelemetryListener(ballerinaExtInstance);
        }

        ballerinaExtInstance.onReady().then(() => {
            const langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
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
