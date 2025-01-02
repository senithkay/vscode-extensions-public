/**
 * Copyright (c) (2021-2023), WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    DebugConfigurationProvider, WorkspaceFolder, DebugConfiguration, debug, ExtensionContext, window, commands, DebugAdapterInlineImplementation,
    DebugSession, DebugAdapterExecutable, DebugAdapterDescriptor, DebugAdapterDescriptorFactory, DebugAdapterServer, Uri, workspace, RelativePattern, ConfigurationTarget, WorkspaceConfiguration,
    Task,
    tasks,
    TaskDefinition,
    ShellExecution,
    TaskExecution,
    DebugAdapterTrackerFactory,
    DebugAdapterTracker,
    ViewColumn,
    TabInputText
} from 'vscode';
import * as child_process from "child_process";
import { getPortPromise } from 'portfinder';
import * as path from "path";
import {
    ballerinaExtInstance, BallerinaExtension, LANGUAGE, OLD_BALLERINA_VERSION_DEBUGGER_RUNINTERMINAL,
    UNSUPPORTED_DEBUGGER_RUNINTERMINAL_KIND, INVALID_DEBUGGER_RUNINTERMINAL_KIND
} from '../../core';
import { ExtendedLangClient } from '../../core/extended-language-client';
import { BALLERINA_HOME } from '../../core/preferences';
import {
    TM_EVENT_START_DEBUG_SESSION, CMP_DEBUGGER, sendTelemetryEvent, sendTelemetryException,
    CMP_NOTEBOOK, TM_EVENT_START_NOTEBOOK_DEBUG
} from '../telemetry';
import { log, debug as debugLog } from "../../utils";
import { decimal, ExecutableOptions } from 'vscode-languageclient/node';
import { BAL_NOTEBOOK, getTempFile, NOTEBOOK_CELL_SCHEME } from '../../views/notebook';
import fileUriToPath from 'file-uri-to-path';
import { readFileSync } from 'fs';
import { dirname, sep } from 'path';
import { parseTomlToConfig } from '../config-generator/utils';
import { LoggingDebugSession, OutputEvent, TerminatedEvent } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { PALETTE_COMMANDS, PROJECT_TYPE } from '../project/cmds/cmd-runner';
import { Disposable } from 'monaco-languageclient';
import { getCurrentBallerinaFile, getCurrentBallerinaProject } from '../../utils/project-utils';
import { BallerinaProject, BallerinaProjectComponents, BIGetEnclosedFunctionRequest, EVENT_TYPE, MainFunctionParamsResponse } from '@wso2-enterprise/ballerina-core';
import { openView, StateMachine } from '../../stateMachine';
import { waitForBallerinaService } from '../tryit/utils';
import { BreakpointManager } from './breakpoint-manager';
import { notifyBreakpointChange } from '../../RPCLayer';
import { VisualizerWebview } from '../../views/visualizer/webview';
import { URI } from 'vscode-uri';

const BALLERINA_COMMAND = "ballerina.command";
const EXTENDED_CLIENT_CAPABILITIES = "capabilities";
const BALLERINA_TOML_REGEX = `**${sep}Ballerina.toml`;
const BALLERINA_FILE_REGEX = `**${sep}*.bal`;

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
    async resolveDebugConfiguration(_folder: WorkspaceFolder, config: DebugConfiguration)
        : Promise<DebugConfiguration> {
        if (!config.type) {
            commands.executeCommand('workbench.action.debug.configure');
            return Promise.resolve({ request: '', type: '', name: '' });

        }
        if (config.noDebug && (ballerinaExtInstance.enabledRunFast() || StateMachine.context().isBI)) {
            await handleMainFunctionParams(config);
        }
        return getModifiedConfigs(_folder, config);
    }
}

function getValueFromProgramArgs(programArgs: string[], idx: number) {
    return programArgs.length + 1 > idx ? programArgs[idx] : "";
}

async function handleMainFunctionParams(config: DebugConfiguration) {
    const res = await ballerinaExtInstance.langClient?.getMainFunctionParams({
        projectRootIdentifier: {
            uri: "file://" + StateMachine.context().projectUri
        }
    }) as MainFunctionParamsResponse;
    if (res.hasMain) {
        let i;
        let programArgs = config.programArgs;
        let values: string[] = [];
        if (res.params) {
            let params = res.params;
            for (i = 0; i < params.length; i++) {
                let param = params[i];
                let value = param.defaultValue ? param.defaultValue : getValueFromProgramArgs(programArgs, i);
                await showInputBox(param.paramName, value).then(r => {
                    values.push(r);
                });
            }
        }
        if (res.restParams) {
            while (true) {
                let value = getValueFromProgramArgs(programArgs, i);
                i++;
                let result = await showInputBox(res.restParams.paramName, value);
                if (result) {
                    values.push(result);
                } else {
                    break;
                }
            }
        }
        config.programArgs = values;
    }
}

async function showInputBox(paramName: string, value: string) {
    const inout = await window.showInputBox({
        title: paramName,
        ignoreFocusOut: true,
        placeHolder: `Enter value for parameter: ${paramName}`,
        prompt: "",
        value: value
    });
    return inout;
}

async function getModifiedConfigs(workspaceFolder: WorkspaceFolder, config: DebugConfiguration) {
    let debuggeePort = config.debuggeePort;
    if (!debuggeePort) {
        debuggeePort = await findFreePort();
    }

    const ballerinaHome = ballerinaExtInstance.getBallerinaHome();
    config['ballerina.home'] = ballerinaHome;
    config[BALLERINA_COMMAND] = ballerinaExtInstance.getBallerinaCmd();
    config[EXTENDED_CLIENT_CAPABILITIES] = { supportsReadOnlyEditors: true, supportsFastRun: isFastRunEnabled() };

    if (!config.type) {
        config.type = LANGUAGE.BALLERINA;
    }

    if (!config.request) {
        config.request = DEBUG_REQUEST.LAUNCH;
    }

    config.noDebug = Boolean(config.noDebug);

    const activeTextEditor = window.activeTextEditor;

    if (activeTextEditor && activeTextEditor.document.fileName.endsWith(BAL_NOTEBOOK)) {
        sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_START_NOTEBOOK_DEBUG, CMP_NOTEBOOK);
        let activeTextEditorUri = activeTextEditor.document.uri;
        if (activeTextEditorUri.scheme === NOTEBOOK_CELL_SCHEME) {
            activeTextEditorUri = Uri.file(getTempFile());
            config.script = fileUriToPath(activeTextEditorUri.toString(true));
        } else {
            return Promise.reject();
        }
    }

    if (!config.script) {
        const tomls = await workspace.findFiles(workspaceFolder ? new RelativePattern(workspaceFolder, BALLERINA_TOML_REGEX) : BALLERINA_TOML_REGEX);
        const projects: { project: BallerinaProject; balFile: Uri; relativePath: string }[] = [];
        for (const toml of tomls) {
            const projectRoot = dirname(toml.fsPath);
            const balFiles = await workspace.findFiles(new RelativePattern(projectRoot, BALLERINA_FILE_REGEX), undefined, 1);
            if (balFiles.length > 0) {

                const tomlContent: string = readFileSync(toml.fsPath, 'utf8');
                const tomlObj: BALLERINA_TOML = parseTomlToConfig(tomlContent) as BALLERINA_TOML;
                const relativePath = workspace.asRelativePath(projectRoot);
                projects.push({ project: { packageName: tomlObj.package.name }, balFile: balFiles[0], relativePath });
            }
        }

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
        const debugServerPort = await findFreePort();
        config.debugServer = debugServerPort.toString();
    }
    return config;
}

export async function constructDebugConfig(uri: Uri, testDebug: boolean, args?: any): Promise<DebugConfiguration> {

    const launchConfig: WorkspaceConfiguration = workspace.getConfiguration('launch').length > 0 ? workspace.getConfiguration('launch') :
        workspace.getConfiguration('launch', uri);
    const debugConfigs: DebugConfiguration[] = launchConfig.configurations;

    if (debugConfigs.length == 0) {
        const initialConfigurations: DebugConfiguration[] = ballerinaExtInstance.extension.packageJSON.contributes.debuggers[0].initialConfigurations;

        debugConfigs.push(...initialConfigurations);
        launchConfig.update('configurations', debugConfigs, ConfigurationTarget.WorkspaceFolder, true);
    }

    let debugConfig: DebugConfiguration | undefined;
    for (let i = 0; i < debugConfigs.length; i++) {
        if ((testDebug && debugConfigs[i].name == DEBUG_CONFIG.TEST_DEBUG_NAME) ||
            (!testDebug && debugConfigs[i].name == DEBUG_CONFIG.SOURCE_DEBUG_NAME)) {
            debugConfig = debugConfigs[i];
            break;
        }
    }

    debugConfig.script = uri.fsPath;
    debugConfig.debugTests = testDebug;
    debugConfig.tests = testDebug ? args : undefined;
    return debugConfig;
}

export function activateDebugConfigProvider(ballerinaExtInstance: BallerinaExtension) {
    let context = <ExtensionContext>ballerinaExtInstance.context;

    context.subscriptions.push(debug.registerDebugConfigurationProvider('ballerina', new DebugConfigProvider()));

    const factory = new BallerinaDebugAdapterDescriptorFactory(ballerinaExtInstance);
    context.subscriptions.push(debug.registerDebugAdapterDescriptorFactory('ballerina', factory));

    context.subscriptions.push(debug.registerDebugAdapterTrackerFactory('ballerina', new BallerinaDebugAdapterTrackerFactory()));

    // Listener to support reflect breakpoint changes in diagram when debugger is inactive
    context.subscriptions.push(debug.onDidChangeBreakpoints((session) => {
        notifyBreakpointChange();
    }));
}

class BallerinaDebugAdapterTrackerFactory implements DebugAdapterTrackerFactory {
    createDebugAdapterTracker(session: DebugSession): DebugAdapterTracker {
        return {

            onWillStartSession() {
                new BreakpointManager();
            },

            onWillStopSession() {
                // clear the active breakpoint
                BreakpointManager.getInstance().setActiveBreakpoint(undefined);
                notifyBreakpointChange();
                commands.executeCommand('setContext', 'isBIProjectRunning', false);
            },

            // Debug Adapter -> VS Code
            onDidSendMessage: async (message: DebugProtocol.ProtocolMessage) => {
                console.log("=====onDidSendMessage", message);
                if (message.type === "response") {
                    const msg = <DebugProtocol.Response>message;

                    if (msg.command === "setBreakpoints") {
                        const breakpoints = msg.body.breakpoints;
                        // convert debug points to client breakpoints
                        if (breakpoints) {
                            console.log("!=====breakpoints in setBreakpoints tracker", breakpoints);
                            const clientBreakpoints = breakpoints.map(bp => ({
                                ...bp,
                                line: bp.line - 1
                            }));
                            // set the breakpoints in the diagram
                            BreakpointManager.getInstance().addBreakpoints(clientBreakpoints);
                            notifyBreakpointChange();
                        }
                    } else if (msg.command === "stackTrace") {
                        const uri = Uri.parse(msg.body.stackFrames[0].source.path);

                        if (VisualizerWebview.currentPanel !== undefined) {

                            const allTabs = window.tabGroups.all.flatMap(group => group.tabs);

                            // Filter for tabs that are editor tabs and the tab with the debug hit
                            const editorTabs = allTabs.filter(tab => tab.input instanceof TabInputText && tab.input.uri.fsPath === uri.fsPath);

                            for (const tab of editorTabs) {
                                await window.tabGroups.close(tab);
                            }
                        }

                        // get the current stack trace
                        const hitBreakpoint = msg.body.stackFrames[0];
                        console.log("!=====hit breakpoint stackTrace in  tracker", hitBreakpoint);

                        const clientBreakpoint = {
                            ...hitBreakpoint,
                            line: Math.max(0, hitBreakpoint.line - 1),
                            column: Math.max(0, hitBreakpoint.column - 1)
                        };

                        BreakpointManager.getInstance().setActiveBreakpoint(clientBreakpoint);

                        const isWebviewPresent = VisualizerWebview.currentPanel !== undefined;

                        if (isWebviewPresent) {
                            VisualizerWebview?.currentPanel?.getWebview()?.reveal(ViewColumn.One, true);
                            await handleBreakpointVisualization(uri, clientBreakpoint);
                        }

                    } else if (msg.command === "continue" || msg.command === "next" || msg.command === "stepIn" || msg.command === "stepOut") {
                        // clear the active breakpoint
                        BreakpointManager.getInstance().setActiveBreakpoint(undefined);
                        notifyBreakpointChange();
                    }
                }

                if (message.type === "event") {
                    const msg = <DebugProtocol.Event>message;
                    if (msg.event === "startFastRun") {
                        // clear the active breakpoint
                        BreakpointManager.getInstance().setActiveBreakpoint(undefined);
                        notifyBreakpointChange();

                        // restart the fast-run
                        getCurrentRoot().then(async (root) => {
                            const didStop = await stopRunFast(root);
                            if (didStop) {
                                runFast(root, msg.body);
                            }
                        });
                    } else if (msg.event === "stopped") {
                        const isWebviewPresent = VisualizerWebview.currentPanel !== undefined;

                        if (isWebviewPresent) {
                            VisualizerWebview?.currentPanel?.getWebview()?.reveal(ViewColumn.One, true);
                        }
                    } else if (msg.event === "output") {
                        if (msg.body.output === "Running executable\n") {
                            const workspaceRoot = workspace.workspaceFolders && workspace.workspaceFolders[0].uri.fsPath;
                            if (workspaceRoot) {
                                // Get the component list
                                const components: BallerinaProjectComponents = await ballerinaExtInstance?.langClient?.getBallerinaProjectComponents({
                                    documentIdentifiers: [{ uri: URI.file(workspaceRoot).toString() }]
                                });

                                // Iterate and extract the services
                                const services = components.packages
                                    ?.flatMap(pkg => pkg.modules)
                                    .flatMap(module => module.services);

                                if (services && services.length > 0) {
                                    commands.executeCommand('setContext', 'isBIProjectRunning', true);
                                }
                            }

                        }
                    }
                }
            },
        };
    }
}

async function handleBreakpointVisualization(uri: Uri, clientBreakpoint: DebugProtocol.StackFrame) {
    const newContext = StateMachine.context();

    // Check if breakpoint is in a different project
    if (!uri.fsPath.startsWith(newContext.projectUri)) {
        console.log("Breakpoint is in a different project");
        window.showInformationMessage("Cannot visualize breakpoint since it belongs to a different project");
        openView(EVENT_TYPE.OPEN_VIEW, newContext);
        notifyBreakpointChange();
        return;
    }

    // Get enclosed function definition
    const req: BIGetEnclosedFunctionRequest = {
        filePath: uri.fsPath,
        position: {
            line: clientBreakpoint.line,
            offset: clientBreakpoint.column
        }
    };

    const res = await StateMachine.langClient().getEnclosedFunctionDef(req);

    if (!res?.startLine || !res?.endLine) {
        window.showInformationMessage("Failed to open the respective view for the breakpoint. Please manually navigate to the respective view.");
        notifyBreakpointChange();
        return;
    }

    // Update context with new position
    newContext.documentUri = uri.fsPath;
    newContext.view = undefined;
    newContext.position = {
        startLine: res.startLine.line,
        startColumn: res.startLine.offset,
        endLine: res.endLine.line,
        endColumn: res.endLine.offset
    };
    openView(EVENT_TYPE.OPEN_VIEW, newContext);
    notifyBreakpointChange();
}



class BallerinaDebugAdapterDescriptorFactory implements DebugAdapterDescriptorFactory {
    private ballerinaExtInstance: BallerinaExtension;
    private notificationHandler: Disposable | null = null;
    constructor(ballerinaExtInstance: BallerinaExtension) {
        this.ballerinaExtInstance = ballerinaExtInstance;
    }
    createDebugAdapterDescriptor(session: DebugSession, executable: DebugAdapterExecutable | undefined):
        Thenable<DebugAdapterDescriptor> {
        if (session.configuration.noDebug && StateMachine.context().isBI) {
            return new Promise((resolve) => {
                resolve(new DebugAdapterInlineImplementation(new BIRunAdapter()));
            });
        }

        if (session.configuration.noDebug && ballerinaExtInstance.enabledRunFast()) {
            return new Promise((resolve) => {
                resolve(new DebugAdapterInlineImplementation(new FastRunDebugAdapter()));
            });
        }

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
            this.registerLogTraceNotificationHandler(session);
            return new DebugAdapterServer(port);
        }).catch((error) => {
            sendTelemetryException(ballerinaExtInstance, error, CMP_DEBUGGER);
            return Promise.reject(error);
        });
    }
    private registerLogTraceNotificationHandler(session: DebugSession) {
        const langClient = ballerinaExtInstance.langClient;
        const notificationHandler = langClient.onNotification('$/logTrace', (params: any) => {
            if (params.verbose === "stopped") {
                // do nothing
            } else {
                if (params && params.message) {
                    const category = params.verbose === 'err' ? 'stderr' : 'stdout';
                    session.customRequest('output', { output: params.message, category: category });
                }
            }
        });
        this.notificationHandler = notificationHandler;
    }
    getScriptPath(args: string[]): string {
        args.push('start-debugger-adapter');
        return this.ballerinaExtInstance.getBallerinaCmd();
    }
    getCurrentWorkingDir(): string {
        return path.join(this.ballerinaExtInstance.ballerinaHome, "bin");
    }
}

class FastRunDebugAdapter extends LoggingDebugSession {

    notificationHandler: Disposable | null = null;
    root: string | null = null;
    programArgs: string[] = [];

    protected launchRequest(response: DebugProtocol.LaunchResponse, args: DebugProtocol.LaunchRequestArguments, request?: DebugProtocol.Request): void {
        const langClient = ballerinaExtInstance.langClient;
        const notificationHandler = langClient.onNotification('$/logTrace', (params: any) => {
            if (params.verbose === "stopped") { // even if a single channel (stderr,stdout) stopped, we stop the debug session
                notificationHandler!.dispose();
                this.sendEvent(new TerminatedEvent());
            } else {
                const category = params.verbose === 'err' ? 'stderr' : 'stdout';
                this.sendEvent(new OutputEvent(params.message, category));
            }
        });
        this.notificationHandler = notificationHandler;
        this.programArgs = (args as any).programArgs;
        getCurrentRoot().then((root) => {
            this.root = root;
            runFast(root, { programArgs: this.programArgs }).then((didRan) => {
                response.success = didRan;
                this.sendResponse(response);
            });
        });
    }

    protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): void {
        const notificationHandler = this.notificationHandler;
        stopRunFast(this.root).then((didStop) => {
            response.success = didStop;
            notificationHandler!.dispose();
            this.sendResponse(response);
        });
    }
}

const outputChannel = window.createOutputChannel("Ballerina Integrator Executor");

class BIRunAdapter extends LoggingDebugSession {

    notificationHandler: Disposable | null = null;
    root: string | null = null;
    task: TaskExecution | null = null;
    taskTerminationListener: Disposable | null = null;

    protected launchRequest(response: DebugProtocol.LaunchResponse, args: DebugProtocol.LaunchRequestArguments, request?: DebugProtocol.Request): void {
        const taskDefinition: TaskDefinition = {
            type: 'shell',
            task: 'run'
        };

        let buildCommand = 'bal run';
        const programArgs = (args as any).programArgs;
        if (programArgs && programArgs.length > 0) {
            buildCommand = `${buildCommand} -- ${programArgs.join(' ')}`;
        }

        // Get Ballerina home path from settings
        const config = workspace.getConfiguration('kolab');
        const ballerinaHome = config.get<string>('home');
        if (ballerinaHome) {
            // Add ballerina home to build path only if it's configured
            buildCommand = path.join(ballerinaHome, 'bin', buildCommand);
        }

        const execution = new ShellExecution(buildCommand);

        const task = new Task(
            taskDefinition,
            workspace.workspaceFolders![0], // Assumes at least one workspace folder is open
            'Ballerina Build',
            'ballerina',
            execution
        );

        try {
            tasks.executeTask(task).then((taskExecution) => {
                this.task = taskExecution;

                // Add task termination listener
                this.taskTerminationListener = tasks.onDidEndTaskProcess(e => {
                    if (e.execution === this.task) {
                        this.sendEvent(new TerminatedEvent());
                    }
                });

                // Trigger Try It command after successful build
                waitForBallerinaService(workspace.workspaceFolders![0].uri.fsPath).then((port) => {
                    commands.executeCommand(PALETTE_COMMANDS.TRY_IT, false);
                });

                response.success = true;
                this.sendResponse(response);
            });
        } catch (error) {
            window.showErrorMessage(`Failed to build Ballerina package: ${error}`);
        }
    }

    protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): void {
        if (this.task) {
            this.task.terminate();
        }
        this.cleanupListeners();
        response.success = true;
        this.sendResponse(response);
    }

    private cleanupListeners(): void {
        if (this.taskTerminationListener) {
            this.taskTerminationListener.dispose();
            this.taskTerminationListener = null;
        }
        if (this.notificationHandler) {
            this.notificationHandler.dispose();
            this.notificationHandler = null;
        }
    }
}

async function runFast(root: string, options: { debugPort?: number; env?: Map<string, string>; programArgs?: string[]; } = {}): Promise<boolean> {
    try {
        if (window.activeTextEditor?.document.isDirty) {
            await commands.executeCommand(PALETTE_COMMANDS.SAVE_ALL);
        }
        const { debugPort, env = new Map(), programArgs = [] } = options;
        const commandArguments = [
            { key: "path", value: root },
            { key: "debugPort", value: debugPort },
            { key: "env", value: env },
            { key: "programArgs", value: programArgs }
        ];

        return await ballerinaExtInstance.langClient.executeCommand({
            command: "RUN",
            arguments: commandArguments,
        });
    } catch (error) {
        console.error('Error while executing the fast-run command:', error);
        return false;
    }
}

async function stopRunFast(root: string): Promise<boolean> {
    return await ballerinaExtInstance.langClient.executeCommand({
        command: "STOP", arguments: [
            { key: "path", value: root! }]
    });
}

async function getCurrentRoot(): Promise<string> {
    const file = getCurrentBallerinaFile();
    const currentProject = await getCurrentBallerinaProject(file);
    return (currentProject.kind !== PROJECT_TYPE.SINGLE_FILE) ? currentProject.path! : file;
}

function findFreePort(): Promise<number> {
    return getPortPromise({ port: 5010, stopPort: 20000 });
}

function isFastRunEnabled(): boolean {
    const config = workspace.getConfiguration('kolab');
    return config.get<boolean>('enableRunFast');
}
