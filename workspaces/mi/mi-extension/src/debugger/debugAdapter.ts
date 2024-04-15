/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Breakpoint, BreakpointEvent, InitializedEvent, LoggingDebugSession, Scope, StoppedEvent, TerminatedEvent, Thread } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import * as vscode from 'vscode';
import { executeTasks, updateServerPathAndGet } from './debugHelper';
import { Subject } from 'await-notify';
import { Debugger } from './debugger';

export class MiDebugAdapter extends LoggingDebugSession {
    private _configurationDone = new Subject();
    private debuggerHandler: Debugger | undefined;
    // we don't support multiple threads, so we can use a hardcoded ID for the default thread
    private static threadID = 1;

    public constructor() {
        super();
        // this debugger uses zero-based lines and columns
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
            this.sendEvent(new StoppedEvent('breakpoint', MiDebugAdapter.threadID));
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

        // this.debuggerHandler.on('output', (type, text, filePath, line, column) => {

        // 	let category: string;
        // 	switch(type) {
        // 		case 'prio': category = 'important'; break;
        // 		case 'out': category = 'stdout'; break;
        // 		case 'err': category = 'stderr'; break;
        // 		default: category = 'console'; break;
        // 	}
        // 	const e: DebugProtocol.OutputEvent = new OutputEvent(`${text}\n`, category);

        // 	if (text === 'start' || text === 'startCollapsed' || text === 'end') {
        // 		e.body.group = text;
        // 		e.body.output = `group-${text}\n`;
        // 	}

        // 	e.body.source = this.createSource(filePath);
        // 	e.body.line = this.convertDebuggerLineToClient(line);
        // 	e.body.column = this.convertDebuggerColumnToClient(column);
        // 	this.sendEvent(e);
        // });
        this.debuggerHandler.on('end', () => {
            this.sendEvent(new TerminatedEvent());
        });

    }

    protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
        // build and return the capabilities of this debug adapter:
        response.body = response.body || {};

        // the adapter implements the configurationDone request.
        response.body.supportsConfigurationDoneRequest = true;

        // make VS Code use 'evaluate' when hovering over source
        response.body.supportsEvaluateForHovers = true;

        // make VS Code show a 'step back' button
        // response.body.supportsStepBack = true;

        // make VS Code support data breakpoints
        response.body.supportsDataBreakpoints = true;

        // make VS Code support completion in REPL
        response.body.supportsCompletionsRequest = true;
        response.body.completionTriggerCharacters = [".", "["];

        // make VS Code send cancel request
        response.body.supportsCancelRequest = true;

        // make VS Code send the breakpointLocations request
        // response.body.supportsBreakpointLocationsRequest = true;

        // make VS Code provide "Step in Target" functionality
        // response.body.supportsStepInTargetsRequest = true;

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
        if (path){
            // TODO: we could set the currentPath in the debuggerHandler and then clear the breakpoints for that path
            this.debuggerHandler?.setCurrentFilePath(path);
            this.debuggerHandler?.clearBreakpoints(path);
        }

        // set vscode breakpoints and the mi-debugger breakpoints
        const vscodeBreakpoints = breakpoints.map(async bp => {
            const debugBreakpoint = await this.debuggerHandler?.setBreakPoint(source, this.convertClientLineToDebugger(bp.line));
            if (debugBreakpoint?.line) {
                const bp = new Breakpoint(debugBreakpoint?.verified, this.convertDebuggerLineToClient(debugBreakpoint?.line),
                this.convertDebuggerColumnToClient(debugBreakpoint?.column || 0)) as DebugProtocol.Breakpoint;
                bp.source = debugBreakpoint?.source;
                bp.id = debugBreakpoint?.id;
                return bp;
            }
        });

        if (vscodeBreakpoints) {
            const resolvedBreakpoints = await Promise.all(vscodeBreakpoints);
            response.body = {
                breakpoints: resolvedBreakpoints.filter(bp => bp !== undefined) as Breakpoint[]
            };
        }

        this.sendResponse(response);
    }

    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments, request?: DebugProtocol.Request | undefined): void {
        super.configurationDoneRequest(response, args, request);
        // notify the launchRequest that configuration has finished
        this._configurationDone.notify();
    }


    protected launchRequest(response: DebugProtocol.LaunchResponse, args?: DebugProtocol.LaunchRequestArguments, request?: DebugProtocol.Request): void {
        this._configurationDone.wait().then(() => {
            updateServerPathAndGet().then((serverPath) => {
                if (!serverPath) {
                    response.success = false;
                    this.sendResponse(response);
                } else {
                    executeTasks(serverPath)
                        .then(() => {
                            //mi-server takes around 9 seconds to start
                            setTimeout(async () => {
                                await this.debuggerHandler?.initializeDebugger();
                            }, 10000);
                            // this.debuggerHandler?.initializeDebugger();
                            this.sendResponse(response);
                        })
                        .catch(error => {
                            vscode.window.showErrorMessage(`Error while launching run and debug`);
                        });
                }
            });
        });
    }

    protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): void {
        const taskExecution = vscode.tasks.taskExecutions.find(execution => execution.task.name === 'run');
        if (taskExecution) {
            taskExecution.terminate();
            this.debuggerHandler?.closeDebugger();
            response.success = true;
        } else {
            response.success = false;
        }
        this.sendResponse(response);
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

    // protected setFunctionBreakPointsRequest(response: DebugProtocol.SetFunctionBreakpointsResponse, args: DebugProtocol.SetFunctionBreakpointsArguments, request?: DebugProtocol.Request | undefined): void {
    //     response.success = false;
    //     this.sendResponse(response);
    // }

    // TODO: check possibility of removing this method
    // protected breakpointLocationsRequest(response: DebugProtocol.BreakpointLocationsResponse, args: DebugProtocol.BreakpointLocationsArguments, request?: DebugProtocol.Request | undefined): void {
    //     // get the current breakpoints and send their location data
    //     const breakpoints = this.debuggerHandler?.getBreakpoints(args.source.path as string);
       
    //     if (breakpoints) {
    //         response.body = {
    //             breakpoints: breakpoints.map(bp => {
    //                 const line = bp?.line ? this.convertDebuggerLineToClient(bp.line) : 0;
    //                 return {
    //                     line: line
    //                 };
    //             })
    //         };
    //     } else {
    //         response.body = {
    //             breakpoints: []
    //         };
    //     }
    //     this.sendResponse(response);
    // }

    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
        // runtime supports no threads so just return a default thread.
        response.body = {
            threads: [
                new Thread(MiDebugAdapter.threadID, "thread 1")
            ]
        };
        this.sendResponse(response);
    }
    protected nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments, request?: DebugProtocol.Request | undefined): void {
        this.sendResponse(response);
    }

    protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments, request?: DebugProtocol.Request | undefined): void {
        const stackFrames: DebugProtocol.StackFrame[] = [];

        // TODO: get the correct path when there are breakpoints in multiple files
        const path = this.debuggerHandler?.getCurrentFilePath() || "";
        const currentBreakpoint = this.debuggerHandler?.getCurrentBreakpoint();

        const line = currentBreakpoint?.line? this.convertDebuggerLineToClient(currentBreakpoint.line) : 0;

        const xmlStackFrame: DebugProtocol.StackFrame = {
            id: 1,
            name: "XML Processing",
            source: {
                name: "HelloWorld.xml",
                path: path
            },
            line: line,
            column: 0
        };

        stackFrames.push(xmlStackFrame);

        response.body = {
            stackFrames: stackFrames,
            totalFrames: stackFrames.length
        };

        this.sendResponse(response);
    }

    protected async variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments, request?: DebugProtocol.Request | undefined): Promise<void> {
        const vars = args.variablesReference;
        const variables = await this.debuggerHandler?.getVariables();
        if (variables) {
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

    protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments, request?: DebugProtocol.Request | undefined): void {
        response.body = {
            scopes: [
                new Scope("Local", 1, false) // TODO: cehck for the scope
            ]
        };
        this.sendResponse(response);
    }
}
