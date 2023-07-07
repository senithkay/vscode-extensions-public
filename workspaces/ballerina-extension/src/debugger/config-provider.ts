/**
 * Copyright (c) (2021-2023), WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    DebugConfigurationProvider, WorkspaceFolder, DebugConfiguration, debug, ExtensionContext, window, commands,
    DebugSession, DebugAdapterExecutable, DebugAdapterDescriptor, DebugAdapterDescriptorFactory, DebugAdapterServer, Uri, workspace, RelativePattern
} from 'vscode';
import * as child_process from "child_process";
import { getPortPromise } from 'portfinder';
import * as path from "path";
import {
    ballerinaExtInstance, BallerinaExtension, LANGUAGE, OLD_BALLERINA_VERSION_DEBUGGER_RUNINTERMINAL,
    UNSUPPORTED_DEBUGGER_RUNINTERMINAL_KIND, INVALID_DEBUGGER_RUNINTERMINAL_KIND
} from '../core';
import { BallerinaProject, ExtendedLangClient } from '../core/extended-language-client';
import { BALLERINA_HOME } from '../core/preferences';
import {
    TM_EVENT_START_DEBUG_SESSION, CMP_DEBUGGER, sendTelemetryEvent, sendTelemetryException,
    CMP_NOTEBOOK, TM_EVENT_START_NOTEBOOK_DEBUG
} from '../telemetry';
import { log, debug as debugLog } from "../utils";
import { decimal, ExecutableOptions } from 'vscode-languageclient/node';
import { BAL_NOTEBOOK, getTempFile, NOTEBOOK_CELL_SCHEME } from '../notebook';
import fileUriToPath from 'file-uri-to-path';
import { readFileSync } from 'fs';
import { dirname, sep } from 'path';
import { parseTomlToConfig } from '../config-generator/utils';

const BALLERINA_COMMAND = "ballerina.command";
const EXTENDED_CLIENT_CAPABILITIES = "capabilities";
const BALLERINA_TOML_REGEX = `**${sep}Ballerina.toml`;
const BALLERINA_REGEX = `**${sep}*.bal`;

export enum DEBUG_REQUEST {
    LAUNCH = 'launch'
}

export enum DEBUG_CONFIG {
    SOURCE_DEBUG_NAME = 'Ballerina Debug',
    TEST_DEBUG_NAME = 'Ballerina Test'
}

export interface BALLERINA_TOML {
    package: PACKAGE;
    "build-options": any;
}

export interface PACKAGE {
    org: string;
    name: string;
    version: string;
    distribution: string;
}

class DebugConfigProvider implements DebugConfigurationProvider {
    resolveDebugConfiguration(_folder: WorkspaceFolder, config: DebugConfiguration)
        : Thenable<DebugConfiguration> {
        if (!config.type) {
            commands.executeCommand('workbench.action.debug.configure');
            return Promise.resolve({ request: '', type: '', name: '' });
        }
        return getModifiedConfigs(_folder, config);
    }
}

async function getModifiedConfigs(workspaceFolder: WorkspaceFolder, config: DebugConfiguration) {
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

    const activeDoc = window.activeTextEditor.document;

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
        const tomls = await workspace.findFiles(workspaceFolder ? new RelativePattern(workspaceFolder, BALLERINA_TOML_REGEX): BALLERINA_TOML_REGEX);
        const projects: { project: BallerinaProject; balFile: Uri; relativePath: string }[] = [];
        for (const toml of tomls) {
            const projectRoot = dirname(toml.fsPath);
            const balFiles = await workspace.findFiles(new RelativePattern(projectRoot, BALLERINA_REGEX), undefined, 1);
            if (balFiles.length > 0) {

                const tomlContent: string = readFileSync(toml.fsPath, 'utf8');
                const tomlObj: BALLERINA_TOML = parseTomlToConfig(tomlContent) as BALLERINA_TOML;
                const relativePath = workspace.asRelativePath(projectRoot);
                projects.push({ project: { packageName: tomlObj.package.name }, balFile: balFiles[0], relativePath });
            }
        };

        if (projects.length > 0) {
            if (projects.length === 1) {
                config.script = projects[0].balFile.fsPath;
            } else {
                const selectedProject = await window.showQuickPick(projects.map((project) => {
                    return {
                        label: project.project.packageName,
                        description: project.relativePath
                    };
                }), { placeHolder: "Select a Ballerina project to debug", canPickMany: false });
                if (selectedProject) {
                    config.script = projects[projects.indexOf(projects.find((project) => {
                        return project.project.packageName === selectedProject.label;
                    }))].balFile.fsPath;
                } else {
                    return Promise.reject();
                }
            }
        } else {
            ballerinaExtInstance.showMessageInvalidProject();
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
