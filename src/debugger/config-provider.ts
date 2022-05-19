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

import {
    DebugConfigurationProvider, WorkspaceFolder, DebugConfiguration,
    debug, ExtensionContext, window, commands,
    DebugSession,
    DebugAdapterExecutable, DebugAdapterDescriptor, DebugAdapterDescriptorFactory, DebugAdapterServer
} from 'vscode';
import * as child_process from "child_process";
import { getPortPromise } from 'portfinder';
import * as path from "path";
import { ballerinaExtInstance, BallerinaExtension, LANGUAGE } from '../core';
import { BallerinaProject, ExtendedLangClient } from '../core/extended-language-client';
import { BALLERINA_HOME } from '../core/preferences';
import { TM_EVENT_START_DEBUG_SESSION, CMP_DEBUGGER, sendTelemetryEvent, sendTelemetryException } from '../telemetry';
import { log, debug as debugLog, isSupportedVersion, VERSION } from "../utils";
import { ExecutableOptions } from 'vscode-languageclient/node';

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

    config.script = activeDoc.uri.fsPath;

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

    // To make compatible with 1.2.x which supports scriptArguments
    if (config.programArgs) {
        config.scriptArguments = config.programArgs;
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
        const cwd = this.getCurrentWorkingDir();
        let args: string[] = [];
        const cmd = this.getScriptPath(args);
        args.push(port.toString());

        let opt: ExecutableOptions = { cwd: cwd };
        opt.env = Object.assign({}, process.env);

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
