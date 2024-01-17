/* eslint-disable @typescript-eslint/naming-convention */
import { createMachine, assign, interpret } from 'xstate';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { window } from 'vscode';
import { MILanguageClient } from './lang-client/activator';
import { extension } from './MIExtensionContext';
import { EventType, MachineStateValue } from '@wso2-enterprise/mi-core';
import { StateLocation } from '@wso2-enterprise/mi-rpc-client';

interface Context {
    langServer: any | null;
    errorCode: string | null;
}

const stateMachine = createMachine<Context>({
    /** @xstate-layout N4IgpgJg5mDOIC5RilADgGwIYDsAuAdAJY5F5FYZEBeYAxBAPY5jE4BujA1qwMYAWYXlwAKAJ0YArIXgDaABgC6iUGkawyRZipAAPRAGYA7ADYCJgKxH58gwfkBGEwBYjpgDQgAnogC0DgCYCAwBOYxCjEOcHZwNXCwsAX0TPFHRsfDZNShp6MDEJMQJMLDwAM0YxAFsCASFRCWleOSUdNQ1ybSQ9REsQgjc4+QiQh3sTB08fBF8DBwcCaId5C2GjAA4YgKSU8FQSzLRGmQARMDwZSDoFZW72zS7QfQQHCzMTO1c7MItjKcMDBZzBNNs5hhZ1iYVslUvsMoQADIAZQAkqQ8AxmKwSJweAQ0gdEaj0QgcYxeKUtDgbjc2uoHjgdM9XAsEs51gl5CYTKYef8EJYjAMEmNuSF1utnL8YXt0rgiWiyHR8oVithypUagT4QRkYq8KSOOTKcwaa07vTOozus8DB8CBzJa4os5Rq6DPyOWZ7BYAgF5M4AhN2SEZdr5QQxGAsBAvAR2EQwAB3ABK0djdAA8iIAKIAOQA+gA1FE5gDqtItHSpTMQyyMCxZES+VhW6353NZErBjhCJhCAXZYbhEajMbjCeTAFU0BBSvQmCw2LjWOHMmPY-HE0mZ3OLobOBSrWbbqpLTWbXWA2ZnZETAF1iNAfzfesHet7AEjK7bJEdrC5UyFgk3EKQZAIJMwAwXhGCqegAHEcwAFQLJEkIAQRTJCcxOSsz2rR4eheZYzAfQELDBVsG3bbw-ACUICBWaIDACeYLBCEIEiMYdAMIYDQKaQheDHC46AAYXQvMxJzBECzElMc3QpCUUzPM8JAe4rVrF55EhcxNg4rlISsSx+VmdYhW2ZxA22MV2ScZJdhwRgIDgHQ1zwOkCOtJ5EA4h1tgcdYgz7fsHDcMy3iCKzjD9FY5kcHjCSycgcloLyGW06J+mCiUjCsCzrG-MzAQMcwYkBTj5GsCxAiSnUjjA5ozguZpIAyrTLwQSrzD7FYqpWX5tn5L8yqGejWJMSVvmceqIz1dEOovXyXlcALauC-sxXCowOyhB1XgDGI3EhAw5vXdNpnwzKuo5fpTA2D8ITmX4PVohBrIWAwP0cOJAycBxQ12DzI0urdkzTcclsI54QmqgYeQlQEP1eOwO0lYJDu+3kbBcc7CA3Cdt13edoZ8ojAk2AZv3WXT73yiU9vkA7VmiVwNg+fGCAgIhYCwAAjDB2qrG6VqMVjFisKJ73FftB09NwCF+ILg2cFwonWLn+OOZoye0uG3wsiIIS-f0wjM1xnGFT75D9B9+1m4GRyA5MBPAyDoNgsA9a6zizCNhnTeGN7plmQJgi-SwHxWL9xS112daEkTvZFzqVspt8eW5Qd2WiKFnBK4YArcGxQjtKxHMSIA */
    id: 'mi',
    initial: 'initialize',
    context: {
        langServer: null,
        errorCode: null,
    },
    states: {
        initialize: {
            invoke: {
                id: 'checkProject',
                src: checkIfMiProject,
                onDone: {
                    target: 'projectDetected',
                    cond: (context, event) => event.data
                },
                onError: {
                    target: 'newProject'
                }
            }
        },
        projectDetected: {
            entry: 'openMiPerspective',
            on: {
                '': 'lsInit'
            }
        },
        lsInit: {
            invoke: {
                src: 'waitForLS',
                onDone: {
                    target: 'ready',
                    actions: assign({
                        langServer: (context, event) => event.data
                    })
                },
                onError: {
                    target: 'disabled',
                    actions: assign({
                        errorCode: (context, event) => event.data
                    })
                }
            }
        },
        ready: {
            initial: 'viewReady',
            states: {
                viewReady: {
                    on: {
                        OPEN_VIEW: {
                            target: "viewUpdate",
                            actions: assign({
                            })
                        }
                    }
                },
                viewUpdate: {
                    invoke: {
                        src: 'waitForloading',
                        onDone: {
                            target: 'viewReady'
                        }
                    }
                }
            }
        },
        disabled: {
            // define what should happen when the project is not detected
        },
        newProject: {
            initial: 'welcome',
            states: {
                welcome: {
                    on: {
                        GET_STARTED: {
                            target: "create",
                        }
                    }
                },
                create: {
                    on: {
                        CANCEL_CREATION: {
                            target: "welcome"
                        }
                    }
                }
            }
        }
    }
}, {
    guards: {

    },
    actions: {
        openMiPerspective: (context, event) => {
            // replace this with actual logic to open the eggplant perspective
            vscode.commands.executeCommand('integrationStudio.showDiagram');
        }
    },
    services: {
        waitForLS: (context, event) => {
            // replace this with actual promise that waits for LS to be ready
            return new Promise(async (resolve, reject) => {
                await MILanguageClient.getInstance(extension .context);
                resolve(undefined);
            });
        },
        waitForloading: (context, event) => {
            // replace this with actual promise that waits for LS to be ready
            return new Promise((resolve, reject) => {
                resolve(undefined);
            });
        }
    }
});


// Create a service to interpret the machine
export const stateService = interpret(stateMachine);

// Define your API as functions
export const StateMachine = {
    initialize: () => stateService.start(),
    service: () => { return stateService; },
    context: () => { return stateService.getSnapshot().context; },
    state: () => { return stateService.getSnapshot().value as MachineStateValue; },
    sendEvent: (eventType: EventType) => { stateService.send({ type: eventType }); },
};

export function openView(viewLocation: StateLocation) {
    stateService.send({ type: "OPEN_VIEW", viewLocation: viewLocation });
}

async function checkIfMiProject() {
    let isMiProject = false;
    try {
        const files = await vscode.workspace.findFiles('**/pom.xml', '**/node_modules/**', 1);
        if (files.length > 0) {
            // TODO: Handle the correct logic to detect the MI project
            isMiProject = true;
        }
    } catch (err) {
        console.error(err);
    }
    if (!isMiProject) {
        window.showInformationMessage("MI project not found.");
        throw new Error("MI project not found");
    }
    return isMiProject;
}
