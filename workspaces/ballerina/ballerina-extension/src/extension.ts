/**
 * Copyright (c) 2018, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ExtensionContext, commands, window, Location, Uri } from 'vscode';
import { ballerinaExtInstance, BallerinaExtension } from './core';
import { activate as activateDiagram } from './diagram';
import { activate as activateBBE } from './bbe';
import {
    activate as activateTelemetryListener, CMP_EXTENSION_CORE, sendTelemetryEvent,
    TM_EVENT_EXTENSION_ACTIVATE
} from './telemetry';
import { activateDebugConfigProvider } from './debugger';
import { activate as activateProjectFeatures } from './project';
import { activate as activateEditorSupport } from './editor-support';
import { activate as activateTesting } from './testing/activator';
import { StaticFeature, DocumentSelector, ServerCapabilities, InitializeParams, FeatureState } from 'vscode-languageclient';
import { ExtendedClientCapabilities, ExtendedLangClient } from './core/extended-language-client';
import { activate as activatePerformanceForecaster } from './forecaster';
import { activate as activateTryIt } from './tryIt/tryit';
import { activate as activateNotebook } from './notebook';
import { activate as activateLibraryBrowser } from './library-browser';
import { activate as activateERDiagram } from './persist-layer-diagram';
import { activate as activateDesignDiagramView } from './project-design-diagrams';
import { debug, handleResolveMissingDependencies, log } from './utils';
import { activateUriHandlers } from './uri-handlers';
import { startMachine } from './visualizer/activator';
import { activateSubscriptions } from './visualizer/subscription';

let langClient: ExtendedLangClient;
export let isPluginStartup = true;

// TODO initializations should be contributions from each component
function onBeforeInit(langClient: ExtendedLangClient) {
    class TraceLogsFeature implements StaticFeature {
        preInitialize?: (capabilities: ServerCapabilities<any>, documentSelector: DocumentSelector) => void;
        getState(): FeatureState {
            throw new Error('Method not implemented.');
        }
        fillInitializeParams?: ((params: InitializeParams) => void) | undefined;
        dispose(): void {
        }
        fillClientCapabilities(capabilities: ExtendedClientCapabilities): void {
            capabilities.experimental = capabilities.experimental || { introspection: false, showTextDocument: false };
            capabilities.experimental.introspection = true;
        }
        initialize(_capabilities: ServerCapabilities, _documentSelector: DocumentSelector | undefined): void {
        }
    }

    class ShowFileFeature implements StaticFeature {
        preInitialize?: (capabilities: ServerCapabilities<any>, documentSelector: DocumentSelector) => void;
        getState(): FeatureState {
            throw new Error('Method not implemented.');
        }
        fillInitializeParams?: ((params: InitializeParams) => void) | undefined;
        dispose(): void {

        }
        fillClientCapabilities(capabilities: ExtendedClientCapabilities): void {
            capabilities.experimental = capabilities.experimental || { introspection: false, showTextDocument: false };
            capabilities.experimental.showTextDocument = true;
        }
        initialize(_capabilities: ServerCapabilities, _documentSelector: DocumentSelector | undefined): void {
        }
    }

    langClient.registerFeature(new TraceLogsFeature());
    langClient.registerFeature(new ShowFileFeature());
}

export async function activate(context: ExtensionContext) { 
    await startMachine(context);
    return ballerinaExtInstance;
}

export async function activateBallerina(context: ExtensionContext): Promise<BallerinaExtension> {
    debug('Active the Ballerina VS Code extension.');
    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_EXTENSION_ACTIVATE, CMP_EXTENSION_CORE);
    ballerinaExtInstance.setContext(context);
    // Enable URI handlers
    activateUriHandlers(ballerinaExtInstance);
    await ballerinaExtInstance.init(onBeforeInit).then(() => {
        activateLibraryBrowser(ballerinaExtInstance);
        activateSubscriptions(context);
        // start the features.
        // Enable Ballerina diagram
        // activateDiagram(ballerinaExtInstance);
        // // Enable Ballerina by examples
        // activateBBE(ballerinaExtInstance);
        // // Enable Ballerina Debug Config Provider
        // activateDebugConfigProvider(ballerinaExtInstance);
        // // Enable Ballerina Project related features
        // activateProjectFeatures();
        activateEditorSupport(ballerinaExtInstance);
        // // Enable performance forecaster
        // activatePerformanceForecaster(ballerinaExtInstance);
        // // Enable try it views
        // activateTryIt(ballerinaExtInstance);
        // // Enable Ballerina Telemetry listener
        // activateTelemetryListener(ballerinaExtInstance);
        // activateTesting(ballerinaExtInstance);
        // // Enable Ballerina Notebook
        // activateNotebook(ballerinaExtInstance);
        // activateDesignDiagramView(ballerinaExtInstance);
        // activateERDiagram(ballerinaExtInstance);

        langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
        // Register showTextDocument listener
        langClient.onNotification('window/showTextDocument', (location: Location) => {
            if (location.uri !== undefined) {
                window.showTextDocument(Uri.parse(location.uri.toString()), { selection: location.range });
            }
        });
        isPluginStartup = false;
    }).catch((e) => {
        log("Failed to activate Ballerina extension. " + (e.message ? e.message : e));
        const cmds: any[] = ballerinaExtInstance.extension.packageJSON.contributes.commands;

        if (e.message && e.message.includes('Error when checking ballerina version.')) {
            ballerinaExtInstance.showMessageInstallBallerina();
            ballerinaExtInstance.showMissingBallerinaErrInStatusBar();

            cmds.forEach((cmd) => {
                const cmdID: string = cmd.command;
                commands.registerCommand(cmdID, () => {
                    ballerinaExtInstance.showMessageInstallBallerina();
                });
            });
        }
        // When plugins fails to start, provide a warning upon each command execution
        else if (!ballerinaExtInstance.langClient) {
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
    }).finally(() => {
        handleResolveMissingDependencies(ballerinaExtInstance);
    });
    return ballerinaExtInstance;
}

export function deactivate(): Thenable<void> | undefined {
    debug('Deactive the Ballerina VS Code extension.');
    if (!langClient) {
        return;
    }
    ballerinaExtInstance.telemetryReporter.dispose();
    return langClient.stop();
}
