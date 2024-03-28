import * as net from 'net';
import { EventEmitter } from 'events';
import { DebugProtocolBreakpoint } from 'vscode';
import { DebugProtocol } from 'vscode-debugprotocol';

export class Debugger extends EventEmitter {
    private commandPort: number;
    private eventPort: number;
    private host: string;

    private commandClient: net.Socket | undefined;
    private eventClient: net.Socket | undefined;

    constructor(commandPort: number, eventPort: number, host: string) {
        super();
        this.commandPort = commandPort;
        this.eventPort = eventPort;
        this.host = host;

        // this.commandClient = new net.Socket();
        // this.eventClient = new net.Socket();

        // // Start listening for events on the event port
        // this.startListeningToEvents();
    }

    public initializeDebugger(): Promise<string> {
        return new Promise((resolve, reject) => {
            // Start the debugger by connecting to the backend debugger
            this.startDebugger()
                .then(() => {
                    // Once debugger is started, send the initial request
                    // wait for 10 seconds before running below code
                    setTimeout(() => {
                        const initialRequest = { "command": "resume" };
                        this.sendRequest(JSON.stringify(initialRequest))
                            .then((response) => {
                                // After sending initial request, send the breakpoint command
                                this.sendBreakpointCommand()
                                    .then((breakpointResponse) => {
                                        // Resolve the promise with the breakpoint response
                                        resolve(breakpointResponse);
                                    })
                                    .catch((error) => {
                                        // Reject the promise if there's an error sending the breakpoint command
                                        reject(error);
                                    });
                            })
                            .catch((error) => {
                                // Reject the promise if there's an error sending the request
                                reject(error);
                            });
                    }, 12000);

                })
                .catch((error) => {
                    // Reject the promise if there's an error starting the debugger
                    reject(error);
                });
        });
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


            // Listen for data on the event port
            this.eventClient?.on('data', (data) => {
                const eventData = data.toString();
                console.log('Received event:', eventData);
                // convert to eventData to json
                const eventDataJson = JSON.parse(eventData);
                // check if the event is a breakpoint event
                if (eventDataJson.event === 'breakpoint') {
                    // send 'stopped' event
                    this.sendEvent('stopOnBreakpoint');
                    // create debugprotocol breakpoint object
                    const bps: DebugProtocol.Breakpoint = 
                    {
                        verified: true,
                        line: 4
                    };
                    this.sendEvent('breakpointValidated', bps);
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

            // Send request on the command port
            this.commandClient?.write(request);

            // Listen for response from the command port
            this.commandClient?.once('data', (data) => {
                const response = data.toString();
                console.log('Received response:', response);
                resolve(response); // Resolve the promise with the response
            });

            // Error handling for the command client
            this.commandClient?.once('error', (error) => {
                console.error('Command client error:', error);
                reject(error); // Reject the promise if there's an error
            });
        });
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

    // public startListeningToEvents(): void {
    //     // Listen for data on the event port
    //     this.eventClient?.on('data', (data) => {
    //         const eventData = data.toString();
    //         console.log('Received event:', eventData);
    //         // convert to eventData to json
    //         const eventDataJson = JSON.parse(eventData);
    //         // check if the event is a breakpoint event
    //         if (eventDataJson.event === 'breakpoint') {
    //             // send 'stopped' event
    // 			this.sendEvent('stopOnBreakpoint');
    //         }



    //     });

    //     // Error handling for the event client
    //     this.eventClient?.on('error', (error) => {
    //         console.error('Event client error:', error);
    //     });
    // }

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
}
