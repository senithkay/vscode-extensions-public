/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Breakpoint, BreakpointEvent, Handles, InitializedEvent, LoggingDebugSession, Scope, StoppedEvent, TerminatedEvent, Thread } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import * as vscode from 'vscode';
import { checkServerReadiness, deleteCopiedCapAndLibs, executeBuildTask, executeTasks, getServerPath, isADiagramView, readPortOffset, removeTempDebugBatchFile, setManagementCredentials, stopServer } from './debugHelper';
import { Subject } from 'await-notify';
import { Debugger } from './debugger';
import { StateMachine, openView, refreshUI } from '../stateMachine';
import { VisualizerWebview } from '../visualizer/webview';
import { ViewColumn } from 'vscode';
import { COMMANDS } from '../constants';
import { INCORRECT_SERVER_PATH_MSG } from './constants';
import { extension } from '../MIExtensionContext';
import { EVENT_TYPE, miServerRunStateChanged } from '@wso2-enterprise/mi-core';
import { DebuggerConfig } from './config';
import { openRuntimeServicesWebview } from '../runtime-services-panel/activate';
import { RPCLayer } from '../RPCLayer';

interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    /** Env variables setup through launch.json */
    env?: any;
    vmArgs?: string[];
}

export class MiDebugAdapter extends LoggingDebugSession {
    private _configurationDone = new Subject();
    private debuggerHandler: Debugger | undefined;
    // we don't support multiple threads, so we can use a hardcoded ID for the default thread
    private static threadID = 1;

    private variableHandles: Handles<any>;

    public constructor() {
        super();
        // debugger uses zero-based lines and columns
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);

        this.debuggerHandler = new Debugger(DebuggerConfig.getCommandPort(), DebuggerConfig.getEventPort(), DebuggerConfig.getHost());
        // setup event handlers
        this.debuggerHandler.on('stopOnEntry', () => {
            this.sendEvent(new StoppedEvent('entry', MiDebugAdapter.threadID));
        });
        this.debuggerHandler.on('stopOnStep', () => {
            this.sendEvent(new StoppedEvent('step', MiDebugAdapter.threadID));
        });
        this.debuggerHandler.on('stopOnBreakpoint', () => {
            const isWebviewPresent = VisualizerWebview.currentPanel !== undefined;
            // Send the native breakpoint event which opens the editor.
            this.sendEvent(new StoppedEvent('breakpoint', MiDebugAdapter.threadID));

            // Check the diagram visibility
            if (isWebviewPresent && isADiagramView()) {
                setTimeout(() => {
                    if (VisualizerWebview.currentPanel) {
                        VisualizerWebview.currentPanel!.getWebview()?.reveal(ViewColumn.Beside);
                        setTimeout(() => {
                            // check if currentFilePath is different from the one in the context, if so we need to open the currentFile
                            if (StateMachine.context().documentUri !== this.debuggerHandler?.getCurrentFilePath()) {
                                const newContext = StateMachine.context();
                                newContext.documentUri = this.debuggerHandler?.getCurrentFilePath();
                                openView(EVENT_TYPE.OPEN_VIEW, newContext);
                            } else {
                                refreshUI();
                            }
                        }, 200);
                    } else {
                        extension.webviewReveal = true;
                        const newContext = StateMachine.context();
                        newContext.documentUri = this.debuggerHandler?.getCurrentFilePath();
                        openView(EVENT_TYPE.OPEN_VIEW, newContext);
                    }
                }, 200);
            }
        });

        this.debuggerHandler.on('breakpointValidated', (bp: DebugProtocol.Breakpoint) => {
            this.sendEvent(new BreakpointEvent('changed', { verified: bp.verified, id: bp.id }));
        });

        this.debuggerHandler.on('stopOnDataBreakpoint', () => {
            this.sendEvent(new StoppedEvent('data breakpoint', MiDebugAdapter.threadID));
        });
        this.debuggerHandler.on('stopOnInstructionBreakpoint', () => {
            this.sendEvent(new StoppedEvent('instruction breakpoint', MiDebugAdapter.threadID));
        });
        this.debuggerHandler.on('stopOnException', (exception) => {
            if (exception) {
                this.sendEvent(new StoppedEvent(`exception(${exception})`, MiDebugAdapter.threadID));
            } else {
                this.sendEvent(new StoppedEvent('exception', MiDebugAdapter.threadID));
            }
        });

        this.debuggerHandler.on('end', () => {
            this.sendEvent(new TerminatedEvent());
        });

        // An instance of Handles to manage variable references
        this.variableHandles = new Handles<any>();

    }

    // TODO: Handle variable types
    private generateDebugVariable(name: string, val: any): DebugProtocol.Variable {
        if (val === null) {
            return { name: name, value: '', variablesReference: 0 };
        } else if (val instanceof Array) {
            let index = 0;
            let vals = val.map((v: any): any => {
                return this.generateDebugVariable(String(index++), v);
            });

            let ref = this.variableHandles.create(vals);
            return { name: name, value: val.toString(), variablesReference: ref };
        } else if (val instanceof Object) {
            let vals = Object.getOwnPropertyNames(val).map((key: any): any => {
                return this.generateDebugVariable(key, val[key]);
            });
            let ref = this.variableHandles.create(vals);
            return { name: name, value: JSON.stringify(val), variablesReference: ref };
        } else {
            return { name: name, value: String(val), variablesReference: 0 };
        }
    }


    //TODO: Remove unwanted capabilities
    protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
        // build and return the capabilities of this debug adapter:
        response.body = response.body || {};

        // the adapter implements the configurationDone request.
        response.body.supportsConfigurationDoneRequest = true;

        // make VS Code use 'evaluate' when hovering over source
        response.body.supportsEvaluateForHovers = true;

        // make VS Code support data breakpoints
        response.body.supportsDataBreakpoints = true;

        // make VS Code support completion in REPL
        response.body.supportsCompletionsRequest = true;
        response.body.completionTriggerCharacters = [".", "["];

        // make VS Code send cancel request
        response.body.supportsCancelRequest = true;

        // the adapter defines two exceptions filters, one with support for conditions.
        response.body.supportsExceptionFilterOptions = true;
        response.body.exceptionBreakpointFilters = [
            {
                filter: 'namedException',
                label: "Named Exception",
                description: `Break on named exceptions. Enter the exception's name as the Condition.`,
                default: false,
                supportsCondition: true,
                conditionDescription: `Enter the exception's name`
            },
            {
                filter: 'otherExceptions',
                label: "Other Exceptions",
                description: 'This is a other exception',
                default: true,
                supportsCondition: false
            }
        ];

        // make VS Code send exceptionInfo request
        response.body.supportsExceptionInfoRequest = true;

        // make VS Code send setVariable request
        response.body.supportsSetVariable = true;

        // make VS Code send setExpression request
        response.body.supportsSetExpression = true;

        // make VS Code send disassemble request
        response.body.supportsDisassembleRequest = true;
        response.body.supportsSteppingGranularity = true;
        response.body.supportsInstructionBreakpoints = true;

        // make VS Code able to read and write variable memory
        response.body.supportsReadMemoryRequest = true;
        response.body.supportsWriteMemoryRequest = true;

        response.body.supportSuspendDebuggee = true;
        response.body.supportTerminateDebuggee = true;
        // response.body.supportsFunctionBreakpoints = true;
        response.body.supportsDelayedStackTraceLoading = false;


        this.sendResponse(response);
        this.sendEvent(new InitializedEvent());
    }

    protected async setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments, request?: DebugProtocol.Request | undefined): Promise<void> {
        const breakpoints = args.breakpoints || [];
        const source = args.source;
        const path = source.path;
        // clear all breakpoints for this file
        if (path) {
            this.debuggerHandler?.setCurrentFilePath(path);
            this.debuggerHandler?.clearBreakpoints(path);

            //convert all the breakpoints lines to debugger lines
            breakpoints.forEach(bp => {
                bp.line = this.convertClientLineToDebugger(bp.line);
                // only set bp.column if its present in the bp
                if (bp.column) {
                    bp.column = this.convertClientColumnToDebugger(bp.column);
                }

            });
            // set runtime breakpoints
            const runtimeBreakpoints = await this.debuggerHandler?.createRuntimeBreakpoints(path, breakpoints);
            // create debug breakpoints from runtime breakpoints
            if (runtimeBreakpoints) {
                const vscodeBreakpoints = runtimeBreakpoints.map(async runtimeBp => {
                    const bp = new Breakpoint(
                        runtimeBp?.verified,
                        this.convertDebuggerLineToClient(runtimeBp?.line),
                        runtimeBp?.column ? this.convertDebuggerColumnToClient(runtimeBp?.column) : undefined,
                    ) as DebugProtocol.Breakpoint;
                    bp.source = source;
                    bp.id = runtimeBp?.id;
                    return bp;
                });

                if (vscodeBreakpoints) {
                    const resolvedBreakpoints = await Promise.all(vscodeBreakpoints);
                    response.body = {
                        breakpoints: resolvedBreakpoints.filter(bp => bp !== undefined) as Breakpoint[]
                    };
                }
            }
        }
        this.sendResponse(response);
        refreshUI();
    }

    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments, request?: DebugProtocol.Request | undefined): void {
        super.configurationDoneRequest(response, args, request);
        // notify the launchRequest that configuration has finished
        this._configurationDone.notify();
    }


    private currentServerPath;
    protected launchRequest(response: DebugProtocol.LaunchResponse, args?: ILaunchRequestArguments, request?: DebugProtocol.Request): void {
        this._configurationDone.wait().then(() => {
            getServerPath().then((serverPath) => {
                if (!serverPath) {
                    const message = `Unable to locate the server path`;
                    this.showErrorAndExecuteChangeServerPath(message);
                    this.sendError(response, 1, message);
                } else {
                    this.currentServerPath = serverPath;
                    const isDebugAllowed = !args?.noDebug ?? true;
                    readPortOffset(serverPath).then(async (portOffset) => {
                        DebuggerConfig.setPortOffset(portOffset);

                        DebuggerConfig.setEnvVariables(args?.env ? args?.env : {});
                        DebuggerConfig.setVmArgs(args?.vmArgs ? args?.vmArgs : []);

                        DebuggerConfig.setVmArgs(args?.vmArgs ? args?.vmArgs : []);

                        await setManagementCredentials(serverPath);

                        vscode.commands.executeCommand('setContext', 'MI.isRunning', 'true');
                        executeTasks(serverPath, isDebugAllowed)
                            .then(async () => {
                                if (args?.noDebug) {
                                    checkServerReadiness().then(() => {
                                        openRuntimeServicesWebview();
                                        extension.isServerStarted = true;
                                        RPCLayer._messenger.sendNotification(miServerRunStateChanged, { type: 'webview', webviewType: 'micro-integrator.runtime-services-panel' }, 'Running');

                                        response.success = true;
                                        this.sendResponse(response);
                                    }).catch(error => {
                                        vscode.window.showErrorMessage(error);
                                        this.sendError(response, 1, error);
                                        vscode.commands.executeCommand('setContext', 'MI.isRunning', 'false');
                                    });
                                } else {
                                    this.debuggerHandler?.initializeDebugger().then(() => {
                                        openRuntimeServicesWebview();
                                        extension.isServerStarted = true;
                                        RPCLayer._messenger.sendNotification(miServerRunStateChanged, { type: 'webview', webviewType: 'micro-integrator.runtime-services-panel' }, 'Running');
                                        response.success = true;
                                        this.sendResponse(response);
                                    }).catch(error => {
                                        const completeError = `Error while initializing the Debugger: ${error}`;
                                        vscode.window.showErrorMessage(completeError);
                                        this.sendError(response, 1, completeError);
                                        vscode.commands.executeCommand('setContext', 'MI.isRunning', 'false');
                                    });
                                }
                            })
                            .catch(error => {
                                vscode.commands.executeCommand('setContext', 'MI.isRunning', 'false');
                                deleteCopiedCapAndLibs();
                                const completeError = `Error while launching run and debug: ${error}`;
                                if (error === INCORRECT_SERVER_PATH_MSG) {
                                    this.showErrorAndExecuteChangeServerPath(completeError);
                                } else {
                                    vscode.window.showErrorMessage(completeError);
                                }
                                this.sendError(response, 1, completeError);
                            });
                    });
                }
            });
        });
    }

    protected async disconnectRequest(response: DebugProtocol.DisconnectResponse, args?: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): Promise<void> {
        this.debuggerHandler?.closeDebugger();
        vscode.commands.executeCommand('setContext', 'MI.isRunning', 'false');
        try {
            if (process.platform === 'win32') {
                await stopServer(this.currentServerPath, true);
                removeTempDebugBatchFile();
                deleteCopiedCapAndLibs();
                response.success = true;
                this.sendResponse(response);
            } else {
                await stopServer(this.currentServerPath);
                deleteCopiedCapAndLibs();
                response.success = true;
                this.sendResponse(response);
            }
        } catch (error) {
            const completeError = `Error while stopping the server: ${error}`;
            this.showErrorAndExecuteChangeServerPath(completeError);
            this.sendError(response, 3, completeError);
        }

        DebuggerConfig.resetCappandLibs();
        extension.isServerStarted = false;
        RPCLayer._messenger.sendNotification(miServerRunStateChanged, { type: 'webview', webviewType: 'micro-integrator.runtime-services-panel' }, 'Stopped');
    }

    protected async attachRequest(response: DebugProtocol.AttachResponse, args: DebugProtocol.LaunchRequestArguments) {
        return this.launchRequest(response, args);
    }

    protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments, request?: DebugProtocol.Request | undefined): void {
        this.debuggerHandler?.sendResumeCommand().then((res) => {
            response.success = true;
            this.sendResponse(response);
        });
    }

    protected stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments, request?: DebugProtocol.Request | undefined): void {
        this.debuggerHandler?.sendResumeCommand().then((res) => {
            vscode.window.showInformationMessage('The "Step-In" debugging feature is currently not supported.');
            response.success = true;
            this.sendResponse(response);
        });
    }

    protected stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments, request?: DebugProtocol.Request | undefined): void {
        this.debuggerHandler?.sendResumeCommand().then((res) => {
            vscode.window.showInformationMessage('The "Step-Out" debugging feature is currently not supported.');
            response.success = true;
            this.sendResponse(response);
        });
    }


    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
        // return a default thread.
        response.body = {
            threads: [
                new Thread(MiDebugAdapter.threadID, "thread 1")
            ]
        };
        this.sendResponse(response);
    }

    protected async nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments, request?: DebugProtocol.Request | undefined): Promise<void> {
        this.debuggerHandler?.getNextMediatorBreakpoint().then(async (breakpointResponse) => {
            if (breakpointResponse.stepOverBreakpoints.length > 0) {
                this.debuggerHandler?.stepOverBreakpoint(breakpointResponse).then(() => {
                    this.sendResponse(response);
                }).catch(error => {
                    const completeError = `Error while stepping over: ${error}`;
                    vscode.window.showErrorMessage(completeError);
                    this.sendError(response, 1, completeError);
                });
            } else {
                await this.debuggerHandler?.sendResumeCommand();
                this.sendResponse(response);
            }
        });
    }

    protected async stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments, request?: DebugProtocol.Request | undefined): Promise<void> {
        const stackFrames: DebugProtocol.StackFrame[] = [];

        const path = this.debuggerHandler?.getCurrentFilePath() || "";
        const currentBreakpoint = this.debuggerHandler?.getCurrentBreakpoint();

        const line = currentBreakpoint?.line ? this.convertDebuggerLineToClient(currentBreakpoint.line) : 0;
        const column = currentBreakpoint?.column ? this.convertDebuggerColumnToClient(currentBreakpoint.column) : 0;

        const miStackFrame: DebugProtocol.StackFrame = {
            id: 1,
            name: "MI Extension",
            source: {
                path: path,
                presentationHint: "normal",
            },
            line: line,
            column: column
        };

        stackFrames.push(miStackFrame);

        response.body = {
            stackFrames: stackFrames,
            totalFrames: stackFrames.length
        };

        this.sendResponse(response);
    }

    protected async variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments, request?: DebugProtocol.Request | undefined): Promise<void> {
        const vars = this.variableHandles.get(args.variablesReference);
        if (vars !== null) {
            let variables: DebugProtocol.Variable[] = Array.isArray(vars) ? vars : [vars];
            response.body = {
                variables: variables
            };
        }

        this.sendResponse(response);
    }

    protected setVariableRequest(response: DebugProtocol.SetVariableResponse, args: DebugProtocol.SetVariableArguments, request?: DebugProtocol.Request | undefined): void {
        response.success = true;
        this.sendResponse(response);
    }

    protected evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments, request?: DebugProtocol.Request | undefined): void {
        response.body = {
            result: "result",
            variablesReference: 0
        };
        this.sendResponse(response);
    }

    protected async scopesRequest(response: DebugProtocol.ScopesResponse, args?: DebugProtocol.ScopesArguments, request?: DebugProtocol.Request | undefined): Promise<void> {
        const variables = await this.debuggerHandler?.getVariables();

        const localScope = variables?.map((v: any): any => {
            let name = Object.getOwnPropertyNames(v)[0];
            let value = v[name];
            let val = this.generateDebugVariable(name, value);
            return val;
        });

        // get the value MessageEnvelop from localScope
        const msgScope = localScope?.find((scope: any) => scope.name === 'Message Envelope');
        // remove the MessageEnvelop from localScope
        const index = localScope?.indexOf(msgScope);
        if (index !== undefined) {
            localScope?.splice(index, 1);
        }

        const serverInternalRef = this.variableHandles.create(localScope);

        let derivedScopes = [
            new Scope("Server Internals", serverInternalRef, true),
        ];

        if (msgScope !== undefined) {
            const msgRef = this.variableHandles.create(msgScope);
            derivedScopes.push(new Scope("Message", msgRef, false));

        }

        response.body = {
            scopes: derivedScopes
        };

        this.sendResponse(response);
    }

    private sendError(response: DebugProtocol.Response, errorCode: number, errorMessage: string) {
        response.success = false;
        this.sendErrorResponse(response, {
            id: errorCode,
            format: errorMessage,
            showUser: false,
        });
    }

    private showErrorAndExecuteChangeServerPath(completeError: string) {
        vscode.window.showErrorMessage(completeError, 'Change Server Path').then((selection) => {
            if (selection) {
                vscode.commands.executeCommand(COMMANDS.CHANGE_SERVER_PATH);
            }
        });
    }
}
