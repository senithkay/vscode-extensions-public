/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BreakpointEvent, InitializedEvent, LoggingDebugSession, StoppedEvent } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import * as vscode from 'vscode';
import { executeTasks, updateServerPathAndGet } from './debugHelper';
import { Subject } from 'await-notify';
import { Debugger } from './debugger';

export class MiDebugAdapter extends LoggingDebugSession {
    private _configurationDone = new Subject();
    private debuggerHandler: Debugger | undefined;

    public constructor() {
        super("mi-debug.txt");
        // this debugger uses zero-based lines and columns
		this.setDebuggerLinesStartAt1(false);
		this.setDebuggerColumnsStartAt1(false);

        this.debuggerHandler = new Debugger(9005, 9006, 'localhost');
        // setup event handlers
		this.debuggerHandler.on('stopOnEntry', () => {
			this.sendEvent(new StoppedEvent('entry'));
		});
		this.debuggerHandler.on('stopOnStep', () => {
			this.sendEvent(new StoppedEvent('step'));
		});
		this.debuggerHandler.on('stopOnBreakpoint', () => {
			this.sendEvent(new StoppedEvent('breakpoint' ));
		});

        this.debuggerHandler.on('breakpointValidated', (bp: DebugProtocol.Breakpoint) => {
			this.sendEvent(new BreakpointEvent('changed', { verified: bp.verified, line: bp.line }));
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
		response.body.supportsStepBack = true;

		// make VS Code support data breakpoints
		response.body.supportsDataBreakpoints = true;

		// make VS Code support completion in REPL
		response.body.supportsCompletionsRequest = true;
		response.body.completionTriggerCharacters = [ ".", "[" ];

		// make VS Code send cancel request
		response.body.supportsCancelRequest = true;

		// make VS Code send the breakpointLocations request
		response.body.supportsBreakpointLocationsRequest = true;

		// make VS Code provide "Step in Target" functionality
		response.body.supportsStepInTargetsRequest = true;

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
		response.body.supportsFunctionBreakpoints = true;
		response.body.supportsDelayedStackTraceLoading = true;

		this.sendResponse(response);
        this.sendEvent(new InitializedEvent());
    }

    protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments, request?: DebugProtocol.Request | undefined): void {
        const breakpoints = args.breakpoints || [];
        response.body = {
            breakpoints: []
        };
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
                            this.sendResponse(response);
                            /// execute after 5 seconds
                            setTimeout(() => {
                                
                                this.debuggerHandler?.initializeDebugger();
                                
    
                            }, 10000);
                        })
                        .catch(error => {
                            vscode.window.showErrorMessage(`Error while launching run and debug`);
                        });
                }
            });
        });

        // updateServerPathAndGet().then((serverPath) => {
        //     if (!serverPath) {
        //         response.success = false;
        //         this.sendResponse(response);
        //     } else {
        //         executeTasks(serverPath)
        //             .then(() => {
        //                 this.sendResponse(response);
        //                 /// execute after 5 seconds
        //                 setTimeout(() => {
        //                    const debuggerCommunicator = new Communicator(9005, 9006, 'localhost');
        //                    debuggerCommunicator.connectToDebugger();
        //                    const breakpoint = {"sequence":{"api":{"api-key":"HelloWorld","resource":{"method":"GET"},"sequence-type":"api_inseq","mediator-position":"0"}},"command":"clear","command-argument":"breakpoint","mediation-component":"sequence"};
        //                 // wait 5 seconds before sending the request
        //                 setTimeout(() => {
        //                     debuggerCommunicator.sendRequest(JSON.stringify(breakpoint));
        //                 }, 10000);
                          

        //                 }, 10000);
        //             })
        //             .catch(error => {
        //                 vscode.window.showErrorMessage(`Error while launching run and debug`);
        //             });
        //     }
        // });
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

    
}
