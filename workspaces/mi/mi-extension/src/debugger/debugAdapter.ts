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
import { executeBuildTask, executeTasks, getServerPath } from './debugHelper';
import { Subject } from 'await-notify';
import { Debugger } from './debugger';
import { StateMachine, navigate, openView } from '../stateMachine';
import { EVENT_TYPE, MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { VisualizerWebview } from '../visualizer/webview';
import { extension } from '../MIExtensionContext';
import { getBuildTask, getStopTask } from './tasks';
import { ViewColumn } from 'vscode';

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

        this.debuggerHandler = new Debugger(9005, 9006, 'localhost');
        // setup event handlers
        this.debuggerHandler.on('stopOnEntry', () => {
            this.sendEvent(new StoppedEvent('entry', MiDebugAdapter.threadID));
        });
        this.debuggerHandler.on('stopOnStep', () => {
            this.sendEvent(new StoppedEvent('step', MiDebugAdapter.threadID));
        });
        this.debuggerHandler.on('stopOnBreakpoint', () => {
            const wasDiagramOpen = VisualizerWebview.currentPanel?.getWebview()?.visible;
            const wasOnlyTheDiagram = vscode.window.visibleTextEditors.length === 0;
            const diagramViews = [MACHINE_VIEW.ResourceView, MACHINE_VIEW.ProxyView, MACHINE_VIEW.SequenceView, MACHINE_VIEW.SequenceTemplateView];
            const stateContext = StateMachine.context();

            // Send the native breakpoint event which opens the editor.
            this.sendEvent(new StoppedEvent('breakpoint', MiDebugAdapter.threadID));

            // Check the diagram visibility
            if (wasDiagramOpen && diagramViews.indexOf(stateContext.view!) !== -1) {
                setTimeout(() => {
                    const webviewPresent = VisualizerWebview.currentPanel !== undefined; // Check if the webview panel is not disposed.
                    if (wasOnlyTheDiagram && !webviewPresent) {
                        // It's possible that the diagram view gets replaced by the breakpoint editor. So we are opening the diagram again.
                        extension.webviewReveal = true;
                        openView(EVENT_TYPE.OPEN_VIEW, stateContext);
                    } else {
                        VisualizerWebview.currentPanel!.getWebview()?.reveal(ViewColumn.Beside);
                        navigate();
                    }
                }, 400);
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
            extension.webviewReveal = false;
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

        response.body.supportsRestartRequest = true;

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
            });
            // set runtime breakpoints
            const runtimeBreakpoints = await this.debuggerHandler?.createRuntimeBreakpoints(path, breakpoints);
            // create debug breakpoints from runtime breakpoints
            if (runtimeBreakpoints) {
                const vscodeBreakpoints = runtimeBreakpoints.map(async runtimeBp => {
                    const bp = new Breakpoint(runtimeBp?.verified, this.convertDebuggerLineToClient(runtimeBp?.line), 0) as DebugProtocol.Breakpoint;
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
        navigate();
    }

    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments, request?: DebugProtocol.Request | undefined): void {
        super.configurationDoneRequest(response, args, request);
        // notify the launchRequest that configuration has finished
        this._configurationDone.notify();
    }


    private currentServerPath;
    protected launchRequest(response: DebugProtocol.LaunchResponse, args?: DebugProtocol.LaunchRequestArguments, request?: DebugProtocol.Request): void {
        this._configurationDone.wait().then(() => {
            getServerPath().then((serverPath) => {
                if (!serverPath) {
                    response.success = false;
                    this.sendResponse(response);
                } else {
                    this.currentServerPath = serverPath;
                    const isDebugAllowed = !args?.noDebug ?? true;
                    executeTasks(serverPath, isDebugAllowed)
                        .then(async () => {
                            if (args?.noDebug) {
                                response.success = true;
                                this.sendResponse(response);
                            } else {
                                this.debuggerHandler?.initializeDebugger().then(() => {
                                    response.success = true;
                                    this.sendResponse(response);
                                }).catch(error => {
                                    vscode.window.showErrorMessage(`Error while initializing the Debugger: ${error}`);
                                    response.success = false;
                                    this.sendResponse(response);
                                });
                            }
                        })
                        .catch(error => {
                            response.success = false;
                            this.sendResponse(response);
                            vscode.window.showErrorMessage(`Error while launching run and debug: ${error}`);
                        });
                }
            });
        });
    }


    protected async restartRequest(response: DebugProtocol.RestartResponse, args: DebugProtocol.RestartArguments, request?: DebugProtocol.Request | undefined): Promise<void> {
        const lauchArgs: DebugProtocol.LaunchRequestArguments = args.arguments as DebugProtocol.LaunchRequestArguments;
        const buildTask = getBuildTask();
        const isDebugAllowed = !lauchArgs?.noDebug ?? true;

        executeBuildTask(buildTask, this.currentServerPath).then(async () => {
            if (isDebugAllowed) {
                this?.debuggerHandler?.setBreakpointsInServer().then(async () => {
                    vscode.debug.addBreakpoints(vscode.debug.breakpoints);
                    response.success = true;
                    this.sendResponse(response);
                }).catch(error => {
                    vscode.window.showErrorMessage(`Error while setting breakpoints on restart: ${error}`);
                    response.success = false;
                    this.sendResponse(response);
                });
            } else {
                response.success = true;
                this.sendResponse(response);
            }
        }).catch(error => {
            vscode.window.showErrorMessage(`Error while executing build task: ${error}`);
            response.success = false;
            this.sendResponse(response);
        });

    }

    protected async disconnectRequest(response: DebugProtocol.DisconnectResponse, args?: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): Promise<void> {
        const taskExecution = vscode.tasks.taskExecutions.find(execution => execution.task.name === 'run');
        if (taskExecution) {
            this.debuggerHandler?.closeDebugger();
            const stopTask = getStopTask(this.currentServerPath);
            stopTask.presentationOptions.close = true;
            stopTask.presentationOptions.showReuseMessage = false;
            vscode.tasks.executeTask(stopTask);
            response.success = true;
            this.sendResponse(response);
        } else {
            response.success = false;
            this.sendResponse(response);
        }
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
            response.success = true;
            this.sendResponse(response);
        });
    }

    protected stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments, request?: DebugProtocol.Request | undefined): void {
        this.debuggerHandler?.sendResumeCommand().then((res) => {
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

    // TODO: Implement stepInRequest after LS changes
    protected async nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments, request?: DebugProtocol.Request | undefined): Promise<void> {
        // await this.debuggerHandler?.stepBreakpoint();
        await this.debuggerHandler?.sendResumeCommand();

        this.sendResponse(response);
    }

    protected async stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments, request?: DebugProtocol.Request | undefined): Promise<void> {
        const stackFrames: DebugProtocol.StackFrame[] = [];

        // TODO: get the correct path when there are breakpoints in multiple files
        const path = this.debuggerHandler?.getCurrentFilePath() || "";
        const currentBreakpoint = this.debuggerHandler?.getCurrentBreakpoint();

        const line = currentBreakpoint?.line ? this.convertDebuggerLineToClient(currentBreakpoint.line) : 0;

        const miStackFrame: DebugProtocol.StackFrame = {
            id: 1,
            name: "MI Extension",
            source: {
                path: path,
                presentationHint: "normal",
            },
            line: line,
            column: 0
        };

        stackFrames.push(miStackFrame);

        response.body = {
            stackFrames: stackFrames,
            totalFrames: stackFrames.length
        };

        this.sendResponse(response);
    }

    protected async variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments, request?: DebugProtocol.Request | undefined): Promise<void> {
        // TODO: Check the possibility of using customEvent to load the diagram
        // const customEvent = { event: "StackTraceUpdated" } as DebugProtocol.Event;
        // this.sendEvent(customEvent);
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
        // const customEvent = { event: "StackTraceUpdated" } as DebugProtocol.Event;
        // this.sendEvent(customEvent);
        const variables = await this.debuggerHandler?.getVariables();

        const localScope = variables?.map((v: any): any => {
            let name = Object.getOwnPropertyNames(v)[0];
            let value = v[name];
            let val = this.generateDebugVariable(name, value);
            return val;
        });

        const ref = this.variableHandles.create(localScope);

        response.body = {
            scopes: [
                new Scope("Local", ref, false) // TODO: Check for the correct scope name
            ]
        };

        this.sendResponse(response);
    }
}
