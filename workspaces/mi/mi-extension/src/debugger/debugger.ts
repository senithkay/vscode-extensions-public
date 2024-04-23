/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as net from 'net';
import { EventEmitter } from 'events';
import { DebugProtocol } from 'vscode-debugprotocol';
import { StateMachine, openView } from '../stateMachine';
import { BreakpointInfo, EVENT_TYPE, GetBreakpointInfoRequest, GetBreakpointInfoResponse, StepOverBreakpointResponse, ValidateBreakpointsRequest, ValidateBreakpointsResponse } from '@wso2-enterprise/mi-core';
import { isPortActivelyListening } from './debugHelper';
import { VisualizerWebview } from '../visualizer/webview';
import { extension } from '../MIExtensionContext';

export interface RuntimeBreakpoint {
    id: number;
    line: number;
    verified: boolean;
    filePath: string;
}

export class Debugger extends EventEmitter {
    private commandPort: number;
    private eventPort: number;
    private host: string;
    private isDebuggerActive = false;

    private commandClient: net.Socket | undefined;
    private eventClient: net.Socket | undefined;

    // maps sourceFile to array of RuntimeBreakpoint
    private runtimeBreakpoints = new Map<string, RuntimeBreakpoint[]>();

    // CurrentFile that analyzes the breakpoints
    private currentFile: string | undefined;

    // Mapping between debugger runtime and RuntimeBreakpoint
    private debuggingRuntimeBreakpointMap = new Map<BreakpointInfo, RuntimeBreakpoint>();

    // since we want to send breakpoint events, we will assign an id to every event
    // so that the frontend can match events with breakpoints.
    private breakpointId = 1;

    private currentDebugpoint: DebugProtocol.Breakpoint | undefined;

    constructor(commandPort: number, eventPort: number, host: string) {
        super();
        this.commandPort = commandPort;
        this.eventPort = eventPort;
        this.host = host;
    }

    public setCurrentFilePath(file: string): void {
        this.currentFile = file;
    }

    public async createRuntimeBreakpoints(path: string, breakpoints: DebugProtocol.SourceBreakpoint[]) {
        try {
            const langClient = StateMachine.context().langClient!;
            const breakpointPerFile: RuntimeBreakpoint[] = [];
            // To maintain the valid and invalid breakpoints in the vscode
            const vscodeBreakpointsPerFile: RuntimeBreakpoint[] = [];
            if (path) {
                // create BreakpointPosition array
                const breakpointPositions = breakpoints.map((breakpoint) => {
                    return { line: breakpoint.line };
                });
                const normalizedPath = this.normalizePathAndCasing(path);

                const validateBreakpointsRequest: ValidateBreakpointsRequest = {
                    filePath: path,
                    breakpoints: [...breakpointPositions]
                };
                const response: ValidateBreakpointsResponse = await langClient.validateBreakpoints(validateBreakpointsRequest);

                if (response?.breakpointValidity) {

                    for (const breakpoint of response.breakpointValidity) {
                        const runtimeBreakpoint: RuntimeBreakpoint = {
                            id: this.breakpointId++,
                            line: breakpoint.line,
                            verified: breakpoint.valid,
                            filePath: normalizedPath
                        };

                        if (breakpoint.valid) {
                            // get current breakpoints for the path
                            let currentBreakpointsPerSource = this.runtimeBreakpoints.get(normalizedPath);
                            if (!currentBreakpointsPerSource) {
                                currentBreakpointsPerSource = new Array<RuntimeBreakpoint>();
                                this.runtimeBreakpoints.set(normalizedPath, currentBreakpointsPerSource);
                            }
                            currentBreakpointsPerSource.push(runtimeBreakpoint);
                            breakpointPerFile.push(runtimeBreakpoint);
                        }
                        vscodeBreakpointsPerFile.push(runtimeBreakpoint);
                    }
                }

                // LS call for breakpoint info
                const breakpointInfo = await this.getBreakpointInformation(breakpointPerFile);
                // map the runtime breakpoint to the breakpoint info
                for (let i = 0; i < breakpointPerFile.length; i++) {
                    this.debuggingRuntimeBreakpointMap.set(breakpointInfo[i], breakpointPerFile[i]);
                }

                if (this.isDebuggerActive) {
                    for (const info of breakpointInfo) {
                        await this.sendSetBreakpointCommand(info);
                    }
                }

                return vscodeBreakpointsPerFile;
            }
        } catch (error) {
            console.error('Error setting breakpoint:', error);
            return Promise.reject(error);
        }
    }

    public async getBreakpointInformation(breakpoints: RuntimeBreakpoint[]): Promise<BreakpointInfo[]> {
        const langClient = StateMachine.context().langClient!;
        // create BreakpointPosition[] array
        const breakpointPositions = breakpoints.map((breakpoint) => {
            return { line: breakpoint.line };
        });

        const getBreakpointInfoRequest: GetBreakpointInfoRequest = {
            filePath: this.getCurrentFilePath(),
            breakpoints: [...breakpointPositions]
        };

        const breakpointInfo1: GetBreakpointInfoResponse = await langClient.getBreakpointInfo(getBreakpointInfoRequest);
        console.log('Breakpoint Info:', breakpointInfo1);
        return breakpointInfo1.breakpointInfo;
    }


    // TODO: Update the implementation after the LS call is implemented
    public async stepBreakpoint(): Promise<void> {
        // get the currentbreakpoint
        const currentBreakpoint = this.getCurrentBreakpoint();
        this.sendEvent('stopOnStep');
        // send LS call to get the next breakpoint and info
        // const langClient = StateMachine.context().langClient!;
        // const stepOverBreakpoint: StepOverBreakpointResponse = await langClient.getStepOverBreakpoint({ filePath: this.getCurrentFilePath(), breakpoint: { line: currentBreakpoint?.line || 0 } });
        //console.log('Step Over Breakpoint:', stepOverBreakpoint);
        // if(!stepOverBreakpoint.noNextBreakpoint) {
        // const stepOverBpLine = stepOverBreakpoint.nextBreakpointLine;
        // const stepOverBpInfo = stepOverBreakpoint.nextDebugInfo;
        // // first check if its stepOverBreakpooints, then scope should call the getVariables of the obtained info
        // // we will need to update the current breakpoint as well
        // }

    }

    public clearBreakpoints(path: string): void {
        this.runtimeBreakpoints.delete(this.normalizePathAndCasing(path));
        // clear the debuggingRuntimeBreakpointMap fields with the matching path
        for (const [key, value] of this.debuggingRuntimeBreakpointMap) {
            if (value.filePath === this.normalizePathAndCasing(path)) {
                this.sendClearBreakpointCommand(key);
                this.debuggingRuntimeBreakpointMap.delete(key);
            }
        }
    }

    public getRuntimeBreakpoints(path: string): RuntimeBreakpoint[] {
        return this.runtimeBreakpoints.get(this.normalizePathAndCasing(path)) || [];
    }

    public getCurrentFilePath(): string {
        return this.currentFile || '';
    }

    public getCurrentBreakpoint(): DebugProtocol.Breakpoint | undefined {
        return this.currentDebugpoint;
    }

    public async initializeDebugger(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            await this.startDebugger();
            extension.preserveActivity = true;

            // TODO: Move to constants
            const readinessPort = 9201;
            const maxTimeout = 12000;
            isPortActivelyListening(readinessPort, maxTimeout).then((isListening) => {
                if (isListening) {
                    this.sendResumeCommand().then(async () => {
                        const runtimeBreakpoints = this.getRuntimeBreakpoints(this.getCurrentFilePath());
                        const runtimeBreakpointInfo = await this.getBreakpointInformation(runtimeBreakpoints);

                        for (const info of runtimeBreakpointInfo) {
                            await this.sendClearBreakpointCommand(info);
                            await this.sendSetBreakpointCommand(info);
                        }
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    // TODO: handle failures on server starts
    public startDebugger(): Promise<void> {
        this.commandClient = new net.Socket();
        this.eventClient = new net.Socket();

        return new Promise((resolve, reject) => {
            // Connect to the command port
            this.commandClient?.connect(this.commandPort, this.host, () => {
                console.log('Connected to command port');
                this.isDebuggerActive = true;
                resolve();
            });

            // Error handling for the command client
            this.commandClient?.on('error', (error) => {
                console.error('Command client error:', error);
                reject(error); // Reject the promise if there's an error
            });

            // Connect to the event port
            this.eventClient?.connect(this.eventPort, this.host, () => {
                console.log('Connected to event port');
            });

            // Error handling for the event client
            this.eventClient?.on('error', (error) => {
                console.error('Event client error:', error);
                reject(error);
            });

            // Buffer to store incomplete messages
            let incompleteMessage = '';


            // Listen for data on the event port
            this.eventClient?.on('data', (data) => {
                const eventData = data.toString();
                // Append the received data to incompleteMessage
                incompleteMessage += eventData;

                while (incompleteMessage.includes('\n')) {
                    // Extract the complete message
                    const newlineIndex = incompleteMessage.indexOf('\n');
                    const message = incompleteMessage.slice(0, newlineIndex);

                    // Call a function with the received message
                    // console.log('Received event:', message);

                    // convert to eventData to json
                    const eventDataJson = JSON.parse(message);

                    if (eventDataJson.event === 'terminated') {
                        this.currentDebugpoint = undefined;

                        const stateContext = StateMachine.context();
                        if (VisualizerWebview.currentPanel?.getWebview()?.visible && stateContext.stNode) {
                            openView(EVENT_TYPE.OPEN_VIEW, stateContext);
                        }
                    }

                    // check if the event is a breakpoint event
                    if (eventDataJson.event === 'breakpoint') {

                        // send 'stopped' event
                        this.sendEvent('stopOnBreakpoint');

                        // create new eventDataJson with removing the event field
                        const eventInfo = { ...eventDataJson };
                        delete eventInfo.event;
                        const event: BreakpointInfo = eventInfo;

                        // Convert objects to strings before using them as keys in the map
                        const eventString = JSON.stringify(event.sequence);
                        const breakpointKey = Array.from(this.debuggingRuntimeBreakpointMap.keys()).find(key => JSON.stringify(key.sequence) === eventString);
                        if (breakpointKey) {
                            const breakpoint = this.debuggingRuntimeBreakpointMap.get(breakpointKey);
                            this.currentDebugpoint = breakpoint;
                            this.sendEvent('breakpointValidated', breakpoint);
                        }
                    }
                    resolve();

                    // Remove the processed message from incompleteMessage
                    incompleteMessage = incompleteMessage.slice(newlineIndex + 1);
                }
            });

            //TODO: Error handling for the event client
            this.eventClient?.on('error', (error) => {
                console.error('Event client error:', error);
            });
        });
    }

    public sendRequest(request: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // Append newline character to the request
            request += '\n';
            // Buffer to store incomplete messages
            let incompleteMessage = '';

            // Send request on the command port
            // console.log('\nSending request:', request);
            this.commandClient?.write(request);

            // Listen for response from the command port
            this.commandClient?.once('data', (data) => {
                // Convert buffer to string
                const receivedData = data.toString();

                // Append the received data to incompleteMessage
                incompleteMessage += receivedData;

                // Check if incompleteMessage contains complete messages
                while (incompleteMessage.includes('\n')) {
                    // Extract the complete message
                    const newlineIndex = incompleteMessage.indexOf('\n');
                    const message = incompleteMessage.slice(0, newlineIndex);

                    // Call a function with the received message
                    // console.log('Received response:', message);
                    resolve(message); // Resolve the promise with the message

                    // Remove the processed message from incompleteMessage
                    incompleteMessage = incompleteMessage.slice(newlineIndex + 1);
                }
            });

            // Error handling for the command client
            this.commandClient?.once('error', (error) => {
                console.error('Command client error:', error);
                reject(error); // Reject the promise if there's an error
            });
        });
    }

    public async sendPropertiesCommand(): Promise<JSON[]> {
        const contextList = ["axis2", "axis2-client", "transport", "synapse"];
        const variables: JSON[] = [];

        for (const context of contextList) {
            let propertiesCommand: any = { "command": "get", "command-argument": "properties", "context": context };
            if (context === "wire") {
                // append the properties command with the field and value "property":{"property-name":"log"}
                propertiesCommand = { "command": "get", "command-argument": "properties", "context": context, "property": { "property-name": "log" } };
            }
            try {
                const response = await this.sendRequest(JSON.stringify(propertiesCommand));
                const jsonResponse = JSON.parse(response);
                variables.push(jsonResponse);
            } catch (error) {
                console.error(`Error sending request for ${context}:`, error);
            }
        }
        return variables;
    }

    public async getVariables(): Promise<JSON[]> {
        const variables = await this.sendPropertiesCommand();
        return variables;
    }

    // TODO: Move to constants
    public async sendClearBreakpointCommand(breakpointInfo: BreakpointInfo): Promise<void> {
        breakpointInfo.command = "clear";
        breakpointInfo['command-argument'] = "breakpoint";
        await this.sendRequest(JSON.stringify(breakpointInfo));
    }

    public async sendSetBreakpointCommand(breakpointInfo: BreakpointInfo): Promise<void> {
        breakpointInfo.command = "set";
        breakpointInfo['command-argument'] = "breakpoint";
        await this.sendRequest(JSON.stringify(breakpointInfo));
    }

    public sendResumeCommand(): Promise<string> {
        const resumeCommand = { "command": "resume" };
        return new Promise((resolve, reject) => {
            // Send resume command request
            this.sendRequest(JSON.stringify(resumeCommand))
                .then((response) => {
                    // Resolve the promise with the response
                    resolve(response);
                })
                .catch((error) => {
                    // Reject the promise if there's an error sending the request
                    reject(error);
                });
        });
    }

    public closeDebugger(): void {
        // Close connections to command and event ports
        this.commandClient?.end();
        this.eventClient?.end();
        extension.preserveActivity = false;
    }

    private sendEvent(event: string, ...args: any[]): void {
        setTimeout(() => {
            this.emit(event, ...args);
        }, 0);
    }

    private normalizePathAndCasing(path: string) {
        if (process.platform === 'win32') {
            return path.replace(/\//g, '\\').toLowerCase();
        } else {
            return path.replace(/\\/g, '/');
        }
    }
}
