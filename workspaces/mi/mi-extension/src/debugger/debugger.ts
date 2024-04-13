import * as net from 'net';
import { EventEmitter } from 'events';
import { DebugProtocol } from 'vscode-debugprotocol';
import { StateMachine } from '../stateMachine';
import { GetBreakpointInfoRequest, GetBreakpointInfoResponse, ValidateBreakpointsRequest, ValidateBreakpointsResponse } from '@wso2-enterprise/mi-core';

export interface BreakpointInfo {
    sequence: any; // TODO: update based on the BE model
    command?: string;
    'command-argument'?: string; // BE model supports hyphenated keys
}

export class Debugger extends EventEmitter {
    private commandPort: number;
    private eventPort: number;
    private host: string;
    private isDebuggerActive = false;

    private commandClient: net.Socket | undefined;
    private eventClient: net.Socket | undefined;

    // maps from sourceFile to array of DebugProtocol.Breakpoint
    private breakPoints = new Map<string, DebugProtocol.Breakpoint[]>();

    // Add a map to store the mapping between debugger runtime and DebugProtocol.Breakpoint
    private debuggingRuntimeBreakpointMap = new Map<BreakpointInfo, DebugProtocol.Breakpoint>();

    // since we want to send breakpoint events, we will assign an id to every event
    // so that the frontend can match events with breakpoints.
    private breakpointId = 1;

    private currentDebugpoint: DebugProtocol.Breakpoint | undefined;

    private variables: DebugProtocol.Variable[] = [];

    constructor(commandPort: number, eventPort: number, host: string) {
        super();
        this.commandPort = commandPort;
        this.eventPort = eventPort;
        this.host = host;
    }

    /*
     * Set breakpoint in file with given line.
     */
    public async setBreakPoint(source: DebugProtocol.Source, line: number): Promise<DebugProtocol.Breakpoint> {
        return new Promise<DebugProtocol.Breakpoint>(async (resolve, reject) => {
            const langClient = StateMachine.context().langClient!;
            const breakpoint: DebugProtocol.Breakpoint = {
                verified: false,
                line: line,
                id: this.breakpointId++,
                source: source,
                column: 0 // debug points are restricted to line breakpoints
            };

            if (source.path) {
                const path = this.normalizePathAndCasing(source.path);
                // get current breakpoints for the path
                let breakpoints = this.breakPoints.get(path);
                if (!breakpoints) {
                    breakpoints = new Array<DebugProtocol.Breakpoint>();
                    this.breakPoints.set(source.path, breakpoints);
                }
                breakpoints.push(breakpoint);
            }


            // TODO: Add the mi-LS call to verify ig the breakpoints are valid
            //await this.verifyBreakpoints(path);
            try {
                if (source.path) {
                    const validateBreakpointsRequest: ValidateBreakpointsRequest = {
                        filePath: source.path,
                        breakpoints: [{ line: line }]
                    };
                    const response: ValidateBreakpointsResponse = await langClient.validateBreakpoints(validateBreakpointsRequest);
                    if (response?.breakPointValidity[0]?.valid) {
                        breakpoint.verified = true;
                    }
                }
            } catch (error) {
                console.error('Error setting breakpoint:', error);
                return Promise.reject(error);
            }


            //TODO: get the breakpoint info from mi-LS and send breakpoint command to the mi runtime.
            if (breakpoint.verified) {
                const breakpointInfo: BreakpointInfo[] = await this.getBreakpointInformation([breakpoint]);
                this.debuggingRuntimeBreakpointMap.set(breakpointInfo[0], breakpoint);
            }

            // TODO: Enable sending the breakpoint command to the debugger, check if we need to clear the breakpoint before setting it
            // if(this.isDebuggerActive){
            //     await this.sendSetBreakpointCommand(breakpointInfo[0]);
            // }

            resolve(breakpoint);

        }).catch((error) => {
            console.error('Error setting breakpoint:', error);
            return Promise.reject(error);
        });
    }

    public dummyBreakpointPosition = 0;
    public async getBreakpointInformation(breakpoints: DebugProtocol.Breakpoint[]): Promise<BreakpointInfo[]> {
        // TODO: add the LS call to get the breakpoint info for the DebugProtocol.Breakpoint
        const langClient = StateMachine.context().langClient!;
        for (const breakpoint of breakpoints) {
            if(breakpoint.line){
                const getBreakpointInfoRequest: GetBreakpointInfoRequest = {
                    filePath: this.getPath(),
                    breakpoints: [{ line: breakpoint.line }]
                };

                const breakpointInfo: GetBreakpointInfoResponse = await langClient.getBreakpointInfo(getBreakpointInfoRequest);
                console.log('Breakpoint Info:', breakpointInfo);
                // TODO: ask for the BE model changes

            }
            
        }
        
        const breakpointInfo = { "sequence": { "api": { "api-key": "HelloWorld", "resource": { "method": "GET" }, "sequence-type": "api_inseq", "mediator-position": this.dummyBreakpointPosition.toString() } }, "mediation-component": "sequence" };
        this.dummyBreakpointPosition++;
        return [breakpointInfo];
    }



    public async getBreakpointInfo(breakpoints: DebugProtocol.Breakpoint[]): Promise<BreakpointInfo[]> {
        // TODO: add the LS call to get the breakpoint info for the DebugProtocol.Breakpoint
        const breakpointCommand = { "sequence": { "api": { "api-key": "HelloWorld", "resource": { "method": "GET" }, "sequence-type": "api_inseq", "mediator-position": "0" } }, "mediation-component": "sequence" };
        const breakpointCommand2 = { "sequence": { "api": { "api-key": "HelloWorld", "resource": { "method": "GET" }, "sequence-type": "api_inseq", "mediator-position": "1" } }, "mediation-component": "sequence" };

        return [breakpointCommand, breakpointCommand2];
    }

    public clearBreakpoints(path: string): void {
        this.breakPoints.delete(this.normalizePathAndCasing(path));
    }

    public getBreakpoints(path: string): DebugProtocol.Breakpoint[] {
        return this.breakPoints.get(this.normalizePathAndCasing(path)) || [];
    }

    // TODO: get the proper path and update the logic of handling the stackTrace
    public getPath() {
        // get the first key of the breakpoint
        const path = this.breakPoints.keys().next().value;
        return path;
    }

    public getCurrentBreakpoint(): DebugProtocol.Breakpoint | undefined {
        return this.currentDebugpoint;
    }

    public async initializeDebugger(): Promise<void> {
        await this.startDebugger();
        // Once debugger is started, send the initial request
        // wait for 10 seconds before running below code since it takes time to deploy the CAP
        setTimeout(async () => {
            await this.sendResumeCommand();
            // get the list of breakpoints
            const breakpoints = this.getBreakpoints(this.getPath());
            // first we need to clear all the breakpoints
            const allBreakpointInfo = await this.getBreakpointInfo(breakpoints);
            // clear the breakpoints
            for (const info of allBreakpointInfo) {
                await this.sendClearBreakpointCommand(info);
            }

            // set the breakpoints
            for (const info of allBreakpointInfo) {
                await this.sendSetBreakpointCommand(info);
            }
        }, 12000);
    }

    public startDebugger(): Promise<void> {
        this.commandClient = new net.Socket();
        this.eventClient = new net.Socket();

        // Start listening for events on the event port
        //this.startListeningToEvents();

        return new Promise((resolve, reject) => {
            // Connect to the command port
            this.commandClient?.connect(this.commandPort, this.host, () => {
                console.log('Connected to command port');
                this.isDebuggerActive = true;
                // Once connected, resolve the promise
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
                    console.log('Received event:', message);
                    // convert to eventData to json
                    const eventDataJson = JSON.parse(message);

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
                        } else {
                            // create debugprotocol breakpoint object
                            // mocking for testing

                            const bps: DebugProtocol.Breakpoint =
                            {
                                verified: true,
                                line: 5,
                                id: 2
                            };

                            this.currentDebugpoint = bps;
                            this.sendEvent('breakpointValidated', bps);
                        }
                    }
                    resolve();

                    // Remove the processed message from incompleteMessage
                    incompleteMessage = incompleteMessage.slice(newlineIndex + 1);
                }
            });

            // Error handling for the event client
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
            console.log('\nSending request:', request);
            this.commandClient?.write(request);

            // Listen for response from the command port

            this.commandClient?.once('data', (data) => {
                // response = data.toString();
                // console.log('Received response:', response);
                // resolve(response); // Resolve the promise with the response

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
                    console.log('Received response:', message);
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


    public async sendPropertiesCommand(): Promise<DebugProtocol.Variable[]> {
        const contextList = ["axis2", "axis2-client", "transport", "synapse"];
        // const contextList = ["axis2", "axis2-client"];
        const variables: DebugProtocol.Variable[] = [];

        for (const context of contextList) {
            let propertiesCommand: any = { "command": "get", "command-argument": "properties", "context": context };
            if (context === "wire") {
                // append the properties command with the field and value "property":{"property-name":"log"}
                propertiesCommand = { "command": "get", "command-argument": "properties", "context": context, "property": { "property-name": "log" } };
            }
            try {
                const response = await this.sendRequest(JSON.stringify(propertiesCommand));
                const jsonResponse = JSON.parse(response);
                // convert the properties to debugprotocol variables
                const key = Object.keys(jsonResponse)[0]; // Assuming only one key is present
                const value = jsonResponse[key];
                const variable: DebugProtocol.Variable = {
                    name: key,
                    value: JSON.stringify(response),
                    variablesReference: 0
                };
                variables.push(variable);

            } catch (error) {
                console.error(`Error sending request for ${context}:`, error);

            }

        }
        return variables;
    }

    public async getVariables(): Promise<DebugProtocol.Variable[]> {
        const variables = await this.sendPropertiesCommand();
        return variables;
    }



    // creating variables with variable reference
    // TODO: Check the logic on creating structured variables
    // public  createVariable(name: string, value: any, variablesReference: number): DebugProtocol.Variable {
    //     return {
    //         name: name,
    //         value: JSON.stringify(value),
    //         variablesReference: variablesReference,
    //         namedVariables: variablesReference,

    //     };
    // }

    // public  createVariables(jsonResponse: any, variablesReference: number): DebugProtocol.Variable[] {
    //     const variables: DebugProtocol.Variable[] = [];

    //     for (const key in jsonResponse) {
    //         if (jsonResponse.hasOwnProperty(key)) {
    //             const value = jsonResponse[key];
    //             let childVariablesReference = 0;

    //             if (typeof value === 'object') {
    //                 // If the value is an object, create child variables and assign a unique reference
    //                 childVariablesReference = ++variablesReference;
    //                 const childVariables = this.createVariables(value, childVariablesReference);
    //                 variables.push(this.createVariable(key, value, childVariablesReference));
    //                 variables.push(...childVariables);
    //             } else {
    //                 // If the value is not an object, create a regular variable
    //                 variables.push(this.createVariable(key, value, childVariablesReference));
    //             }
    //         }
    //     }

    //     return variables;
    // }



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

    public sendBreakpointCommand(): Promise<string> {
        const breakpointCommand = { "sequence": { "api": { "api-key": "HelloWorld", "resource": { "method": "GET" }, "sequence-type": "api_inseq", "mediator-position": "0" } }, "command": "clear", "command-argument": "breakpoint", "mediation-component": "sequence" };
        //convert the json breakpoirtCommand to string
        const breakpointString = JSON.stringify(breakpointCommand);
        return new Promise((resolve, reject) => {
            // Send breakpoint command request
            this.sendRequest(breakpointString)
                .then((response) => {
                    const breakpointCommand2 = { "sequence": { "api": { "api-key": "HelloWorld", "resource": { "method": "GET" }, "sequence-type": "api_inseq", "mediator-position": "0" } }, "command": "set", "command-argument": "breakpoint", "mediation-component": "sequence" };
                    this.sendRequest(JSON.stringify(breakpointCommand2));
                    const breakpointCommand3 = { "sequence": { "api": { "api-key": "HelloWorld", "resource": { "method": "GET" }, "sequence-type": "api_inseq", "mediator-position": "1" } }, "command": "set", "command-argument": "breakpoint", "mediation-component": "sequence" };
                    this.sendRequest(JSON.stringify(breakpointCommand3));

                    // Resolve the promise with the response
                    resolve(response);
                })
                .catch((error) => {
                    // Reject the promise if there's an error sending the request
                    reject(error);
                });
        });
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
