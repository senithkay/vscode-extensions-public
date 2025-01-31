/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as net from 'net';
import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { DebugProtocol } from 'vscode-debugprotocol';
import { StateMachine, refreshUI } from '../stateMachine';
import { BreakpointInfo, SequenceBreakpoint, GetBreakpointInfoRequest, GetBreakpointInfoResponse, ValidateBreakpointsRequest, ValidateBreakpointsResponse, TemplateBreakpoint, StepOverBreakpointResponse } from '@wso2-enterprise/mi-core';
import { checkServerReadiness, isADiagramView } from './debugHelper';
import { VisualizerWebview } from '../visualizer/webview';
import { extension } from '../MIExtensionContext';
import { reject } from 'lodash';
import { ERROR_LOG, INFO_LOG, logDebug } from '../util/logger';

export interface RuntimeBreakpoint {
    id: number;
    line: number;
    verified: boolean;
    filePath: string;
    column?: number;
}

export interface RuntimeBreakpointInfo {
    key: string;
    mediatorPosition: string;
    sequenceType?: string;
    completeInfo: BreakpointInfo;
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
    private runtimeVscodeBreakpointMap = new Map<RuntimeBreakpointInfo, RuntimeBreakpoint>();
    private stepOverBreakpointMap = new Map<RuntimeBreakpointInfo, RuntimeBreakpoint>();

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
                    return { line: breakpoint.line, column: breakpoint?.column };

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
                            filePath: normalizedPath,
                            column: breakpoint?.column
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
                const breakpointInfo = await this.getBreakpointInformation(breakpointPerFile, normalizedPath);
                if (!breakpointInfo) {
                    logDebug(`No breakpoint information available for path: ${normalizedPath}`, ERROR_LOG);
                    return vscodeBreakpointsPerFile;
                }
                // map the runtime breakpoint to the breakpoint info
                for (let i = 0; i < breakpointPerFile.length; i++) {

                    // check if breakpointInfo has sequence
                    const currentInfo = breakpointInfo[i];
                    // Information for the SequenceBreakpoint type
                    if (currentInfo && currentInfo.sequence !== undefined) {
                        const sequence: SequenceBreakpoint = currentInfo.sequence;
                        const sequenceData = this.mapSequenceInfo(sequence);
                        // create runtime breakpoint info
                        const runtimeBreakpointInfo: RuntimeBreakpointInfo = {
                            key: sequenceData.key,
                            mediatorPosition: sequenceData.mediatorPosition,
                            sequenceType: sequenceData.sequenceType,
                            completeInfo: breakpointInfo[i]
                        };
                        this.runtimeVscodeBreakpointMap.set(runtimeBreakpointInfo, breakpointPerFile[i]);

                    } else if (currentInfo && currentInfo.template) {
                        const templateBreakpoint: TemplateBreakpoint = currentInfo.template;
                        const templateData = this.mapTemplateInfo(templateBreakpoint);

                        const runtimeBreakpointInfo: RuntimeBreakpointInfo = {
                            key: templateData.key,
                            mediatorPosition: templateData.mediatorPosition,
                            completeInfo: breakpointInfo[i]
                        };
                        this.runtimeVscodeBreakpointMap.set(runtimeBreakpointInfo, breakpointPerFile[i]);
                    } else {
                        logDebug(`Breakpoint Information for ${breakpointPerFile[i]?.filePath}:${breakpointPerFile[i]?.line} is null`, ERROR_LOG);
                    }
                }

                if (this.isDebuggerActive) {
                    for (const info of breakpointInfo) {
                        await this.sendSetBreakpointCommand(info);
                    }
                }

                return vscodeBreakpointsPerFile;
            }
        } catch (error) {
            logDebug(`Error updating breakpoints: ${error}`, ERROR_LOG);
            return Promise.reject(error);
        }
    }

    public async createStepOverBreakpoint(path: string, breakpoints: DebugProtocol.SourceBreakpoint[]): Promise<void> {
        try {
            const langClient = StateMachine.context().langClient!;
            const stepOverBreakpoints: RuntimeBreakpoint[] = [];
            if (path) {
                // create BreakpointPosition array
                const breakpointPositions = breakpoints.map((breakpoint) => {
                    return { line: breakpoint.line, column: breakpoint?.column };
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
                            filePath: normalizedPath,
                            column: breakpoint?.column
                        };

                        if (breakpoint.valid) {
                            stepOverBreakpoints.push(runtimeBreakpoint);
                        }
                    }

                }

                // LS call for breakpoint info
                const breakpointInfo = await this.getBreakpointInformation(stepOverBreakpoints, normalizedPath);
                if (!breakpointInfo) {
                    logDebug(`No step-over breakpoint information available for path: ${normalizedPath}`, ERROR_LOG);
                    return;
                }
                // map the runtime breakpoint to the breakpoint info
                for (let i = 0; i < stepOverBreakpoints.length; i++) {

                    // check if breakpointInfo has sequence
                    const currentInfo = breakpointInfo[i];
                    // Information for the SequenceBreakpoint type
                    if (currentInfo && currentInfo.sequence !== undefined) {
                        const sequence: SequenceBreakpoint = currentInfo.sequence;
                        const sequenceData = this.mapSequenceInfo(sequence);
                        // create runtime breakpoint info
                        const runtimeBreakpointInfo: RuntimeBreakpointInfo = {
                            key: sequenceData.key,
                            mediatorPosition: sequenceData.mediatorPosition,
                            sequenceType: sequenceData.sequenceType,
                            completeInfo: breakpointInfo[i]
                        };
                        this.stepOverBreakpointMap.set(runtimeBreakpointInfo, stepOverBreakpoints[i]);

                    } else if (currentInfo && currentInfo.template) {
                        const templateBreakpoint: TemplateBreakpoint = currentInfo.template;
                        const templateData = this.mapTemplateInfo(templateBreakpoint);

                        const runtimeBreakpointInfo: RuntimeBreakpointInfo = {
                            key: templateData.key,
                            mediatorPosition: templateData.mediatorPosition,
                            completeInfo: breakpointInfo[i]
                        };
                        this.stepOverBreakpointMap.set(runtimeBreakpointInfo, stepOverBreakpoints[i]);
                    } else {
                        logDebug(`Breakpoint Information for ${stepOverBreakpoints[i]?.filePath}:${stepOverBreakpoints[i]?.line} is null`, ERROR_LOG);
                    }
                }
                if (this.isDebuggerActive) {
                    for (const info of breakpointInfo) {
                        await this.sendSetBreakpointCommand(info);
                    }
                }
            }
        } catch (error) {
            reject(`${error}`);
        }
    }

    public async getBreakpointInformation(breakpoints: RuntimeBreakpoint[], filePath: string): Promise<BreakpointInfo[]> {
        const langClient = StateMachine.context().langClient!;
        // create BreakpointPosition[] array
        const breakpointPositions = breakpoints.map((breakpoint) => {
            return { line: breakpoint.line, column: breakpoint?.column };
        });

        const getBreakpointInfoRequest: GetBreakpointInfoRequest = {
            filePath: filePath,
            breakpoints: [...breakpointPositions]
        };

        const breakpointInfo: GetBreakpointInfoResponse = await langClient.getBreakpointInfo(getBreakpointInfoRequest);
        return breakpointInfo?.breakpointInfo;
    }


    public async getNextMediatorBreakpoint(): Promise<StepOverBreakpointResponse> {
        try {
            const currentBreakpoint = this.getCurrentBreakpoint();
            const langClient = StateMachine.context().langClient!;
            const stepOverBreakpoint: StepOverBreakpointResponse = await langClient.getStepOverBreakpoint(
                { filePath: this.getCurrentFilePath(), breakpoint: { line: currentBreakpoint?.line || 0, column: currentBreakpoint?.column } });
            // check if the stepOverBreakpoint is present in the runtimeVscodeBreakpointMap's value
            for (const breakpoint of stepOverBreakpoint?.stepOverBreakpoints) {
                const breakpointKey = Array.from(this.runtimeVscodeBreakpointMap.values()).find(
                    (runtimeBreakpointInfo) =>
                        runtimeBreakpointInfo?.line === breakpoint?.line &&
                        runtimeBreakpointInfo?.column === breakpoint?.column &&
                        runtimeBreakpointInfo?.filePath === this.getCurrentFilePath()
                );
                if (breakpointKey) {
                    // we need to remove that breakpoint from the stepOverBreakpoint.stepOverBreakpoints
                    const index = stepOverBreakpoint.stepOverBreakpoints.indexOf(breakpoint);
                    if (index > -1) {
                        stepOverBreakpoint.stepOverBreakpoints.splice(index, 1);
                    }
                }
            }
            return stepOverBreakpoint;
        } catch (error) {
            vscode.window.showErrorMessage(`Error while getting the next mediator breakpoint: ${error}`);
            return { stepOverBreakpoints: [] };
        }
    }

    public async stepOverBreakpoint(stepOverBreakpoint: StepOverBreakpointResponse): Promise<void> {
        return new Promise(async (resolve, reject) => {
            this.createStepOverBreakpoint(this.getCurrentFilePath(), stepOverBreakpoint.stepOverBreakpoints).then(async () => {
                this.sendResumeCommand().then(() => {
                    this.sendEvent('stopOnStep');
                    resolve();
                }).catch((error) => {
                    reject(`Error while resuming the debugger server: ${error}`);
                });

            }).catch((error) => {
                reject(`Error while setting step over breakpoint: ${error}`);
            });
        });
    }

    public clearBreakpoints(path: string): void {
        this.runtimeBreakpoints.delete(this.normalizePathAndCasing(path));

        // clear the runtimeVscodeBreakpointMap fields with the matching path
        for (const [key, value] of this.runtimeVscodeBreakpointMap) {
            if (value.filePath === this.normalizePathAndCasing(path)) {
                // get complete info and sendClarBreakpointCommand
                this.sendClearBreakpointCommand(key.completeInfo);
                this.runtimeVscodeBreakpointMap.delete(key);
            }
        }
    }

    public getRuntimeBreakpoints(path: string): RuntimeBreakpoint[] {
        return this.runtimeBreakpoints.get(this.normalizePathAndCasing(path)) || [];
    }

    public getAllRuntimeBreakpoints(): Map<string, RuntimeBreakpoint[]> {
        return this.runtimeBreakpoints;
    }

    public getCurrentFilePath(): string {
        return this.currentFile || '';
    }

    public getCurrentBreakpoint(): DebugProtocol.Breakpoint | undefined {
        return this.currentDebugpoint;
    }

    public async initializeDebugger(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            this.startDebugger().then(() => {
                extension.preserveActivity = true;
                checkServerReadiness().then(() => {
                    this.sendResumeCommand().then(async () => {
                        const allRuntimeBreakpoints = this.getAllRuntimeBreakpoints();
                        if (allRuntimeBreakpoints.size > 0) {
                            for (const [key, value] of allRuntimeBreakpoints) {
                                const breakpointInfo = await this.getBreakpointInformation(value, key);
                                for (const info of breakpointInfo) {
                                    if (info) {
                                        await this.sendClearBreakpointCommand(info);
                                        await this.sendSetBreakpointCommand(info);
                                    }
                                }
                            }
                        }
                        resolve();
                    }).catch((error) => {
                        logDebug(`Error while sending the resume command: ${error}`, ERROR_LOG);
                        reject(`Error while resuming the debugger server: ${error}`);
                    });

                }).catch((error) => {
                    logDebug(`Error while checking server readiness: ${error}`, ERROR_LOG);
                    reject(error);
                });

            }).catch((error) => {
                logDebug(`Error while connecting the debugger to the MI server: ${error}`, ERROR_LOG);
                reject(`Error while connecting the debugger to the MI server: ${error}`);
            });
        });
    }

    public startDebugger(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.commandClient = new net.Socket();
            this.eventClient = new net.Socket();
            // Connect to the command port
            this.commandClient?.connect(this.commandPort, this.host, () => {
                this.isDebuggerActive = true;
                resolve();
            });

            // Error handling for the command client
            this.commandClient?.on('error', (error) => {
                logDebug(`Command client error: ${error}`, ERROR_LOG);
                reject(error); // Reject the promise if there's an error
            });

            // Connect to the event port
            this.eventClient?.connect(this.eventPort, this.host, () => {
                resolve();
            });

            // Error handling for the event client
            this.eventClient?.on('error', (error) => {
                logDebug(`Event client error: ${error}`, ERROR_LOG);
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
                    logDebug(`Event received: ${message}`, INFO_LOG);

                    // convert to eventData to json
                    const eventDataJson = JSON.parse(message);

                    if (eventDataJson.event === 'terminated') {
                        this.currentDebugpoint = undefined;
                        // clear any stepOverBreakpoints using sendClearBreakpointCommand
                        for (const [key, value] of this.stepOverBreakpointMap) {
                            this.sendClearBreakpointCommand(key.completeInfo);
                        }
                        // clear the stepOverBreakpointMap
                        this.stepOverBreakpointMap.clear();

                        if (VisualizerWebview.currentPanel?.getWebview()?.visible && isADiagramView()) {
                            refreshUI();
                        }
                        extension.webviewReveal = false;
                    }

                    // check if the event is a breakpoint event
                    if (eventDataJson.event === 'breakpoint') {
                        // create new eventDataJson with removing the event field
                        const eventInfo = { ...eventDataJson };
                        delete eventInfo.event;
                        const event: BreakpointInfo = eventInfo;

                        if (event.sequence) {
                            const sequence: SequenceBreakpoint = event.sequence;
                            const sequenceData = this.mapSequenceInfo(sequence);

                            // check  if there values are present in the key of runtimeVscodeBreakpointMap
                            const breakpointKey = Array.from(this.runtimeVscodeBreakpointMap.keys()).find(
                                (runtimeBreakpointInfo) => runtimeBreakpointInfo.key === sequenceData.key &&
                                    runtimeBreakpointInfo.mediatorPosition === sequenceData.mediatorPosition &&
                                    runtimeBreakpointInfo.sequenceType === sequenceData.sequenceType);

                            if (breakpointKey) {
                                const breakpoint = this.runtimeVscodeBreakpointMap.get(breakpointKey);
                                if (breakpoint) {
                                    this.handleBreakpointEvent(breakpoint);
                                }
                            } else {
                                // if breakpoint not found in runtimeVscodeBreakpointMap, we need to check in stepOverBreakpointMap
                                const stepOverBreakpointKey = Array.from(this.stepOverBreakpointMap.keys()).find(
                                    (runtimeBreakpointInfo) => runtimeBreakpointInfo.key === sequenceData.key &&
                                        runtimeBreakpointInfo.mediatorPosition === sequenceData.mediatorPosition &&
                                        runtimeBreakpointInfo.sequenceType === sequenceData.sequenceType);

                                if (stepOverBreakpointKey) {
                                    const breakpoint = this.stepOverBreakpointMap.get(stepOverBreakpointKey);
                                    if (breakpoint) {
                                        this.handleBreakpointEvent(breakpoint);
                                    }
                                }
                            }
                        } else if (event.template) {
                            const template: TemplateBreakpoint = event.template;
                            const templateData = this.mapTemplateInfo(template);

                            const breakpointKey = Array.from(this.runtimeVscodeBreakpointMap.keys()).find(
                                (runtimeBreakpointInfo) => runtimeBreakpointInfo.key === templateData.key &&
                                    runtimeBreakpointInfo.mediatorPosition === templateData.mediatorPosition);

                            if (breakpointKey) {
                                const breakpoint = this.runtimeVscodeBreakpointMap.get(breakpointKey);
                                if (breakpoint) {
                                    this.handleBreakpointEvent(breakpoint);
                                }
                            } else {
                                // if breakpoint not found in runtimeVscodeBreakpointMap, we need to check in stepOverBreakpointMap
                                const stepOverBreakpointKey = Array.from(this.stepOverBreakpointMap.keys()).find(
                                    (runtimeBreakpointInfo) => runtimeBreakpointInfo.key === templateData.key &&
                                        runtimeBreakpointInfo.mediatorPosition === templateData.mediatorPosition);

                                if (stepOverBreakpointKey) {
                                    const breakpoint = this.stepOverBreakpointMap.get(stepOverBreakpointKey);
                                    if (breakpoint) {
                                        this.handleBreakpointEvent(breakpoint);
                                    }
                                }
                            }
                        }
                    }
                    // Remove the processed message from incompleteMessage
                    incompleteMessage = incompleteMessage.slice(newlineIndex + 1);
                }
                resolve();
            });
        });
    }

    private handleBreakpointEvent(breakpoint: RuntimeBreakpoint): void {
        this.currentDebugpoint = breakpoint;
        this.currentFile = breakpoint?.filePath;
        this.sendEvent('stopOnBreakpoint');
        this.sendEvent('breakpointValidated', breakpoint);
    }

    private mapSequenceInfo(sequence: SequenceBreakpoint): { key: string, mediatorPosition: string, sequenceType: string } {
        let key;
        let mediatorPosition;
        let sequenceType;

        if (sequence.api) {
            key = sequence.api['api-key'];
            mediatorPosition = sequence.api['mediator-position'];
            sequenceType = sequence.api['sequence-type'];
        } else if (sequence.proxy) {
            key = sequence.proxy['proxy-key'];
            mediatorPosition = sequence.proxy['mediator-position'];
            sequenceType = sequence.proxy['sequence-type'];
        } else if (sequence.inbound) {
            key = sequence.inbound['inbound-key'];
            mediatorPosition = sequence.inbound['mediator-position'];
            sequenceType = sequence.inbound['sequence-type'];
        } else {
            key = sequence['sequence-key'];
            mediatorPosition = sequence['mediator-position'];
            sequenceType = sequence['sequence-type'];
        }

        return { key, mediatorPosition, sequenceType };
    }

    private mapTemplateInfo(template: TemplateBreakpoint): { key: string, mediatorPosition: string } {
        const key = template['template-key'];
        const mediatorPosition = template['mediator-position'];

        return { key, mediatorPosition };
    }

    public sendRequest(request: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // Append newline character to the request
            request += '\n';
            // Buffer to store incomplete messages
            let incompleteMessage = '';

            // Send request on the command port
            logDebug(`Command: ${request}`, INFO_LOG);
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
                    logDebug(`Command response: ${message}`, INFO_LOG);
                    resolve(message); // Resolve the promise with the message

                    // Remove the processed message from incompleteMessage
                    incompleteMessage = incompleteMessage.slice(newlineIndex + 1);
                }
            });
        });
    }

    public async sendPropertiesCommand(): Promise<JSON[]> {
        const contextList = ["axis2", "axis2-client", "transport", "operation", "synapse"];
        const variables: JSON[] = [];
        const propertyMapping = {
            "axis2Transport-properties": "Transport Scope Properties",
            "axis2Operation-properties": "Operation Scope Properties",
            "axis2Client-properties": "Axis2-Client Scope Properties",
            "axis2-properties": "Axis2 Scope Properties",
            "synapse-properties": "Synapse Scope Properties"
        };

        for (const context of contextList) {
            let propertiesCommand: any = { "command": "get", "command-argument": "properties", "context": context };
            try {
                const response = await this.sendRequest(JSON.stringify(propertiesCommand));
                const jsonResponse = JSON.parse(response);
                for (const key in propertyMapping) {
                    if (jsonResponse[key]) {
                        jsonResponse[propertyMapping[key]] = jsonResponse[key];
                        delete jsonResponse[key];
                    }
                }

                variables.push(jsonResponse);
            } catch (error) {
                logDebug(`Error sending properties-command for ${context}: ${error}`, ERROR_LOG);
            }
        }
        return variables;
    }

    public async getVariables(): Promise<JSON[]> {
        const variables = await this.sendPropertiesCommand();
        const axis2Properties = variables.find((variable) => variable["Axis2 Scope Properties"]);
        if (!axis2Properties) {
            return variables;
        }
        const envelope = axis2Properties["Axis2 Scope Properties"]["Envelope"];
        if (envelope) {
            const envelopeJson = JSON.stringify({ "Message Envelope": envelope });
            const envelopeJsonResponse = JSON.parse(envelopeJson);
            variables.push(envelopeJsonResponse);
        }
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
        this.commandClient?.destroy();
        this.eventClient?.destroy();
        // remove all the listeners
        this.removeAllListeners();
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
