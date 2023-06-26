/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    DebugConfigurationProvider, WorkspaceFolder, DebugConfiguration, debug, ExtensionContext, window, commands,
    DebugSession, DebugAdapterExecutable, DebugAdapterDescriptor, DebugAdapterDescriptorFactory, DebugAdapterServer, Uri
} from 'vscode';
import * as child_process from "child_process";
import { getPortPromise } from 'portfinder';
import * as path from "path";
import { ballerinaExtInstance, BallerinaExtension, LANGUAGE, OLD_BALLERINA_VERSION_DEBUGGER_RUNINTERMINAL,
    UNSUPPORTED_DEBUGGER_RUNINTERMINAL_KIND, INVALID_DEBUGGER_RUNINTERMINAL_KIND } from '../core';
import { BallerinaProject, ExtendedLangClient } from '../core/extended-language-client';
import { BALLERINA_HOME } from '../core/preferences';
import {
    TM_EVENT_START_DEBUG_SESSION, CMP_DEBUGGER, sendTelemetryEvent, sendTelemetryException,
    CMP_NOTEBOOK, TM_EVENT_START_NOTEBOOK_DEBUG
} from '../telemetry';
import { log, debug as debugLog, isSupportedVersion, VERSION } from "../utils";
import { decimal, ExecutableOptions } from 'vscode-languageclient/node';
import { BAL_NOTEBOOK, getTempFile, NOTEBOOK_CELL_SCHEME } from '../notebook';
import fileUriToPath from 'file-uri-to-path';

const BALLERINA_COMMAND = "ballerina.command";
const EXTENDED_CLIENT_CAPABILITIES = "capabilities";

export enum DEBUG_REQUEST {
    LAUNCH = 'launch'
}

export enum DEBUG_CONFIG {
    SOURCE_DEBUG_NAME = 'Ballerina Debug',
    TEST_DEBUG_NAME = 'Ballerina Test'
}

class DebugConfigProvider implements DebugConfigurationProvider {
    resolveDebugConfiguration(_folder: WorkspaceFolder, config: DebugConfiguration)
        : Thenable<DebugConfiguration> {
        if (!config.type) {
            commands.executeCommand('workbench.action.debug.configure');
            return Promise.resolve({ request: '', type: '', name: '' });
        }
        return getModifiedConfigs(config);
    }
}

async function getModifiedConfigs(config: DebugConfiguration) {
    let debuggeePort = config.debuggeePort;
    if (!debuggeePort) {
        debuggeePort = await getPortPromise({ port: 5010, stopPort: 10000 });
    }

    const ballerinaHome = ballerinaExtInstance.getBallerinaHome();
    config[BALLERINA_HOME] = ballerinaHome;
    config[BALLERINA_COMMAND] = ballerinaExtInstance.getBallerinaCmd();
    config[EXTENDED_CLIENT_CAPABILITIES] = { supportsReadOnlyEditors: true };

    if (!config.type) {
        config.type = LANGUAGE.BALLERINA;
    }

    if (!config.request) {
        config.request = DEBUG_REQUEST.LAUNCH;
    }

    if (!window.activeTextEditor) {
        ballerinaExtInstance.showMessageInvalidFile();
        return Promise.reject();
    }

    const activeDoc = window.activeTextEditor.document;

    config.script = activeDoc.uri.fsPath;
    if (activeDoc.fileName.endsWith(BAL_NOTEBOOK)) {
        sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_START_NOTEBOOK_DEBUG, CMP_NOTEBOOK);
        let activeTextEditorUri = activeDoc.uri;
        if (activeTextEditorUri.scheme === NOTEBOOK_CELL_SCHEME) {
            activeTextEditorUri = Uri.file(getTempFile());
            config.script = fileUriToPath(activeTextEditorUri.toString(true));
        } else {
            return Promise.reject();
        }
    }

    if (activeDoc.uri.scheme !== NOTEBOOK_CELL_SCHEME) {
        if (ballerinaExtInstance.langClient && isSupportedVersion(ballerinaExtInstance, VERSION.BETA, 1)) {
            await ballerinaExtInstance.langClient.getBallerinaProject({
                documentIdentifier: {
                    uri: activeDoc.uri.toString()
                }
            }).then((response) => {
                const project = response as BallerinaProject;
                if (project.kind === undefined) {
                    return Promise.reject();
                }
                if (!project.kind || (config.request === 'launch' && project.kind === 'BALA_PROJECT')) {
                    ballerinaExtInstance.showMessageInvalidProject();
                    return Promise.reject();
                }
            }, error => {
                log(`Language server failed to respond with the error message, ${error.message}, while debugging.`);
                sendTelemetryException(ballerinaExtInstance, error, CMP_DEBUGGER);
            });
        } else if (!activeDoc.fileName.endsWith('.bal')) {
            ballerinaExtInstance.showMessageInvalidFile();
            return Promise.reject();
        }

        let langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
        if (langClient.initializeResult) {
            const { experimental } = langClient.initializeResult!.capabilities;
            if (experimental && experimental.introspection && experimental.introspection.port > 0) {
                config.networkLogsPort = experimental.introspection.port;
                if (config.networkLogs === undefined) {
                    config.networkLogs = false;
                }
            }
        }
    }

    // To make compatible with 1.2.x which supports scriptArguments
    if (config.programArgs) {
        config.scriptArguments = config.programArgs;
    }

    if (config.terminal) {
        var balVersion: decimal = parseFloat(ballerinaExtInstance.ballerinaVersion);
        if (balVersion < 2201.3) {
            window.showWarningMessage(OLD_BALLERINA_VERSION_DEBUGGER_RUNINTERMINAL);
        } else if (config.terminal.toLowerCase() === "external") {
            window.showWarningMessage(UNSUPPORTED_DEBUGGER_RUNINTERMINAL_KIND);
        } else if (config.terminal.toLowerCase() !== "integrated") {
            window.showErrorMessage(INVALID_DEBUGGER_RUNINTERMINAL_KIND);
            return Promise.reject();
        }
    }

    config.debuggeePort = debuggeePort.toString();

    if (!config.debugServer) {
        const debugServer = await getPortPromise({ port: 10001, stopPort: 20000 });
        config.debugServer = debugServer.toString();
    }
    return config;
}

export function activateDebugConfigProvider(ballerinaExtInstance: BallerinaExtension) {
    let context = <ExtensionContext>ballerinaExtInstance.context;

    context.subscriptions.push(debug.registerDebugConfigurationProvider('ballerina', new DebugConfigProvider()));

    const factory = new BallerinaDebugAdapterDescriptorFactory(ballerinaExtInstance);
    context.subscriptions.push(debug.registerDebugAdapterDescriptorFactory('ballerina', factory));
}

class BallerinaDebugAdapterDescriptorFactory implements DebugAdapterDescriptorFactory {
    private ballerinaExtInstance: BallerinaExtension;
    constructor(ballerinaExtInstance: BallerinaExtension) {
        this.ballerinaExtInstance = ballerinaExtInstance;
    }
    createDebugAdapterDescriptor(session: DebugSession, executable: DebugAdapterExecutable | undefined):
        Thenable<DebugAdapterDescriptor> {
        const port = session.configuration.debugServer;
        const configEnv = session.configuration.configEnv;
        const cwd = this.getCurrentWorkingDir();
        let args: string[] = [];
        const cmd = this.getScriptPath(args);
        args.push(port.toString());

        let opt: ExecutableOptions = { cwd: cwd };
        opt.env = Object.assign({}, process.env, configEnv);

        const serverProcess = child_process.spawn(cmd, args, opt);

        log(`Starting debug adapter: '${this.ballerinaExtInstance.getBallerinaCmd()} start-debugger-adapter ${port.toString()}`);

        return new Promise<void>((resolve) => {
            serverProcess.stdout.on('data', (data) => {
                if (data.toString().includes('Debug server started')) {
                    resolve();
                }
                log(`${data}`);
            });

            serverProcess.stderr.on('data', (data) => {
                debugLog(`${data}`);
            });
        }).then(() => {
            sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_START_DEBUG_SESSION, CMP_DEBUGGER);
            return new DebugAdapterServer(port);
        }).catch((error) => {
            sendTelemetryException(ballerinaExtInstance, error, CMP_DEBUGGER);
            return Promise.reject(error);
        });
    }
    getScriptPath(args: string[]): string {
        args.push('start-debugger-adapter');
        return this.ballerinaExtInstance.getBallerinaCmd();
    }
    getCurrentWorkingDir(): string {
        return path.join(this.ballerinaExtInstance.ballerinaHome, "bin");
    }
}
