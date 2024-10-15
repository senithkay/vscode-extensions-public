/**
 * Copyright (c) 2018, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ExtensionContext, commands, window, Location, Uri, TextEditor } from 'vscode';
import { ballerinaExtInstance, BallerinaExtension } from './core';
import { activate as activateBBE } from './views/bbe';
import {
    activate as activateTelemetryListener, CMP_EXTENSION_CORE, sendTelemetryEvent,
    TM_EVENT_EXTENSION_ACTIVATE
} from './features/telemetry';
import { activateDebugConfigProvider } from './features/debugger';
import { activate as activateProjectFeatures } from './features/project';
import { activate as activateEditorSupport } from './features/editor-support';
import { activate as activateTesting } from './features/testing/activator';
import { StaticFeature, DocumentSelector, ServerCapabilities, InitializeParams, FeatureState } from 'vscode-languageclient';
import { ExtendedLangClient } from './core/extended-language-client';
import { activate as activateNotebook } from './views/notebook';
import { activate as activateLibraryBrowser } from './features/library-browser';
import { activate as activateBIFeatures } from './features/bi';
import { activate as activateERDiagram } from './views/persist-layer-diagram';
import { activateAiPanel } from './views/ai-panel';
import { activateRuntimeServicePanel } from './views/runtime-services-panel';
import { debug, handleResolveMissingDependencies, log } from './utils';
import { activateUriHandlers } from './utils/uri-handlers';
import { StateMachine } from './stateMachine';
import { activateSubscriptions } from './views/visualizer/activate';
import { extension } from './BalExtensionContext';
import { ExtendedClientCapabilities } from '@wso2-enterprise/ballerina-core';
import { RPCLayer } from './RPCLayer';

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
    extension.context = context;
    // Init RPC Layer methods
    RPCLayer.init();
    // Wait for the ballerina extension to be ready
    await StateMachine.initialize();
    // Then return the ballerina extension context
    return ballerinaExtInstance;
}

export async function activateBallerina(): Promise<BallerinaExtension> {
    debug('Active the Ballerina VS Code extension.');
    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_EXTENSION_ACTIVATE, CMP_EXTENSION_CORE);
    ballerinaExtInstance.setContext(extension.context);
    // Enable URI handlers
    activateUriHandlers(ballerinaExtInstance);
    // Activate Subscription Commands
    activateSubscriptions();
    await ballerinaExtInstance.init(onBeforeInit).then(() => {
        // <------------ CORE FUNCTIONS ----------->
        // Activate Library Browser
        activateLibraryBrowser(ballerinaExtInstance);

        // Enable Ballerina Project related features
        activateProjectFeatures();

        // Enable Ballerina Debug Config Provider
        activateDebugConfigProvider(ballerinaExtInstance);

        // Activate editor support
        activateEditorSupport(ballerinaExtInstance);

        // Activate Ballerina Testing
        activateTesting(ballerinaExtInstance);

        // <------------ MAIN FEATURES ----------->
        // Enable Ballerina by examples
        activateBBE(ballerinaExtInstance);

        if (StateMachine.context().isBI) {
            //Enable BI Feature
            activateBIFeatures(ballerinaExtInstance);
        }

        // Enable Ballerina Notebook
        activateNotebook(ballerinaExtInstance);

        // activateDesignDiagramView(ballerinaExtInstance);
        activateERDiagram(ballerinaExtInstance);

        // <------------ OTHER FEATURES ----------->
        // Enable Ballerina Telemetry listener
        activateTelemetryListener(ballerinaExtInstance);

        //activate ai panel
        activateAiPanel(ballerinaExtInstance);

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
