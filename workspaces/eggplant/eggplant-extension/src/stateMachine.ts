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
    /** @xstate-layout N4IgpgJg5mDOIC5RilADgGwIYDsAuAdAJY5F5FYZEBeYAxANoAMAuoqGgPaxlGc7sQAD0QBGAGwBmAgE45cgCwAmcQA4mS9UoA0IAJ5iJBJSdEB2BWZlnJZs01UBfR7pTps+YqXKUa9BqJsSCBcPOT8giIIEtLyiipaWroGCEoArKoE6mlplpLpTAqqkgrOrqiYuIRoAE6cAFZgAMZ4ACJgeM2dEIysgqG8EcFR4rkEaUyTGkq2THaqyYZpBJZKoqqqSmaiCjKqRWXgFR6EADIAygCS3nQQ-GBeAG6cANYPbpWeF9dkCCTPTSw4RwzBYoP63EGAmGiBkygIklUaUkalEOw2qhkiwQmwIEnEUnEaKkyNU4kOHxOBG+NzANTqNQIlTwADNODUALYESlValXbx-HAAoF8EGscHBAbAyKw+GI5Go9EbLH6MRKGQEAkE0QyNQKSQ7NLOFwgHCcCBwQQ8-AQsKimUIAC04mxjuWcQ9HskFOOvJIvF8tFtUIdymxBU1iJkczh+wUEycJut1TqjRa7U6LUgwelMIQszxWtye0NZhy2JkojxiPUZa2tbS5KTvq+-LIOfteYsGoykny63E20xaQrVdENaRqnMTEkczMPvcvJqYCwEBSHEhudAUTR48L2tMxVGLtVOLHWoUl6U+qYuXnzcXnggRFgWAARhhs5LN53t4Y9-iRKHiijbhrsWS3mkFhEmku73s4QA */
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
export const api = {
    initialize: () => stateService.send(''),
    projectDetected: () => stateService.send('projectDetected'),
    LSInit: () => stateService.send('LSInit'),
    ready: () => stateService.send('ready'),
    disabled: () => stateService.send('disabled'),
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
