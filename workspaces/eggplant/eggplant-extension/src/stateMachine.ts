import { LangClientInterface, VisualizerLocation } from '@wso2-enterprise/eggplant-core';
import { createMachine, assign, interpret } from 'xstate';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface Context extends VisualizerLocation {
    langServer: LangClientInterface | null;
    errorCode: string | null;
}

const stateMachine = createMachine<Context>({
    /** @xstate-layout N4IgpgJg5mDOIC5RilADgGwIYDsAuAdAJY5F5FYZEBeYAxBAPY5jE4BujA1qwMYAWYXlwAKAJ0YArIXgDaABgC6iUGkawyRZipAAPRAGZ5AVgIBGAEzGANCACeiC-PkEjxgCwB2AJwWAHPKeBp5WAL6htijo2PhsmpQ09GBiEmIEmFh4AGaMYgC2BAJCohLSvHJKOmoa5NpIeoYm5la2DghW3gQBHj7+gcFhEeCoGbFopTIAImB4MpB0Csr11Zp1oPoIAGweBMbOzhYWwYGefq2IZmamXhZmfn4Wnmbu3n7ufuGRIzGEADIAygBJUh4BjMVgkTg8AhRUZ-IEghCQxi8TJaHCLRZVdSrHA6DbedwWVx+YwGTZ+S7ve7ec4IB7mTZM8mXTYGMl+TafYbRXDw4FkOjJVLpbDZXIFWE-AgAgV4JEcFFo5iYyrLHG1PH1AlEklkilU+5+Wn2C4WTpMplmbwU9wGZ7GblSvkEMRgLAQOx0ADyIgAogA5AD6ADVAX6AOpY9U1dE6NqUxlM9wpix2kxeWwbMz2lwvbyEgKFozucJDHCMCBwHTO-DY2NrBoIAC0mzprYI+3k7mMj3kFk28hzHyGtcIJHiVFo9dx+MQRLpVhcbONgULKb2I6+vLGE3K01m5UgM81c4QxyT2xelJ7nmMNlNCG8ZnMBnugV7pw-XNH3xdspBE8421RBPBeXY-AMAxbk5J5jQfNpn1fI1jEpTx5CMTxPCdP9YjdD02lUDVgPWC5LgMS9LBg8ljDbR9EzMS0UyJdMehwndCAgIhYCwAAjDBjxjWcQIQS4c0ow47houi2jTTpumMMDNiuMTsLLIA */
    id: 'eggplant',
    initial: 'initialize',
    context: { // Add this
        langServer: null,
        errorCode: null
    },
    states: {
        initialize: {
            invoke: {
                id: 'checkProject',
                src: checkIfEggplantProject,
                onDone: {
                    target: 'projectDetected',
                    cond: (context, event) => event.data
                },
                onError: {
                    target: 'disabled',
                    actions: assign({
                        errorCode: (context, event) => 'NOT_AN_EGGPLANT_PROJECT'
                    })
                }
            }
        },
        projectDetected: {
            entry: 'openEggplantPerspective',
            on: {
                '': 'LSInit'
            }
        },
        LSInit: {
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
            on: {
                OPEN_VIEW: {
                    target: "ready",
                    actions: assign({
                        view: (context, event) => event.viewLocation.view,
                        location: (context, event) => event.viewLocation.location
                    })
                }
            }
        },
        disabled: {
            // define what should happen when the project is not detected
        }
    }
}, {
    guards: {

    },
    actions: {
        openEggplantPerspective: (context, event) => {
            // replace this with actual logic to open the eggplant perspective
            vscode.commands.executeCommand('workbench.view.extension.eggplant');
            vscode.commands.executeCommand('eggplant.openLowCode');
        }
    },
    services: {
        waitForLS: (context, event) => {
            // replace this with actual promise that waits for LS to be ready
            return new Promise((resolve, reject) => {
                const ballerinaExt = vscode.extensions.getExtension('wso2.ballerina');
                if (!ballerinaExt) {
                    reject('BE_NOT_FOUND');
                } else {
                    // Activate Ballerina extension if not activated
                    if (!ballerinaExt.isActive) {
                        ballerinaExt.activate().then(() => {
                            resolve(ballerinaExt.exports.langClient);
                        }, error => {
                            reject('BE_ACTIVATION_FAILED');
                        });
                    } else {
                        resolve(ballerinaExt.exports.langClient);
                    }
                }
            });
        }
    }
});


// Create a service to interpret the machine
export const stateService = interpret(stateMachine).start();

// Define your API as functions
export const StateMachine = {
    initialize: () => stateService.send(''),
    projectDetected: () => stateService.send('projectDetected'),
    LSInit: () => stateService.send('LSInit'),
    ready: () => stateService.send('ready'),
    disabled: () => stateService.send('disabled'),
    getService: () => { return stateService }
};

export function openView(viewLocation: VisualizerLocation) {
    stateService.send({ type: "OPEN_VIEW", viewLocation: viewLocation });
}

async function checkIfEggplantProject() {
    let isEggplant = false;
    try {
        const files = await vscode.workspace.findFiles('**/Ballerina.toml', '**/node_modules/**', 1);
        if (files.length > 0) {
            const data = await fs.promises.readFile(files[0].fsPath, 'utf8');
            isEggplant = data.includes('eggplant');
        }
    } catch (err) {
        console.error(err);
    }
    return isEggplant;
}


export function getState(): string {
    return stateString(stateService.getSnapshot().value);

}

// If the state is an object we flaten it to a string
// This is a hack need to handle state passing properly
export function stateString(state: any): string {
    if (typeof state === 'string') {
        return state;
    } else if (typeof state === 'object') {
        const stateString = Object.entries(state).map(([key, value]) => `${key}.${value}`).at(0);
        if (stateString === undefined) {
            throw Error("Undefined state");
        } else {
            return stateString;
        }
    } else {
        throw Error("Undefined state");
    }
}