import { LangClientInterface, MachineStateValue, VisualizerLocation, EventType } from '@wso2-enterprise/eggplant-core';
import { createMachine, assign, interpret } from 'xstate';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { window } from 'vscode';
import { registerNewLSMethods } from './utils/lang-client';
import { activateLibraryBrowser } from './LibraryBrowser/activate';

interface Context extends VisualizerLocation {
    langServer: LangClientInterface | null;
    errorCode: string | null;
}

const stateMachine = createMachine<Context>({
    /** @xstate-layout N4IgpgJg5mDOIC5RilADgGwIYDsAuAdAJY5F5FYZEBeYAxBAPY5jE4BujA1qwMYAWYXlwAKAJ0YArIXgDaABgC6iUGkawyRZipAAPRACZ5ANgLyArABZjADgDMNmwYDsBp3YA0IAJ6IAjBYEAJwhQTZ+xs7GbpE2AL5xXijo2PhsmpQ09GBiEmIEmFh4AGaMYgC2BAJCohLSvHJKOmoa5NpIeoZB8gTGls5+lpaDfnZDds5evggG5s4EdvKjfn4h5qsmlglJqIVpaHUyACJgeDKQdArKHS2a7aD6COYGU4gD893RQQHOzmFW23Au1ShAAMgBlACSpDwDGYrBInB4BGSezBUJhCERjF4RS0OCuV2a6juOB0jzsdiCBBs3QGFgm5lpg1eCGMEQI-WMTMWziWQQMxkBqJBBAh0LIdByeQK2BKZUqItw6IleCxHBxeOYhKaNxJbTJHQpVJpdIC5kZzMsrL51MsBiCAzsfSCdis5mFwOVBDEYCwEG8BHYRDAAHcAEp+gN0ADyIgAogA5AD6ADVIfGAOpEvWtfHkxA2cx2ynOZ3mKwRe2s8x9AiDB1+WnyWkDLaJIEpb2+-2B4NhgCqaAgRXoTBYbCRrCVaR7AaDIdDQ5HZ3VnFxBp111U+vzRsLBj8BGcTICDtdxnk1p8iH6dgIbnkjMsdgMlMsV4SHZwjAgcB0M54MSeb3J0CAALR+PMizrMYQSWI6fLOI4rKQSsD7yM4L4vrMfizPIBiel2aQkBkVC0MBpIFggYymqMtK0valLwayER2jY8jwXMlaCtyRFogUhwNCcZwNJAlEGtRiy9PB9gWARDqHi8N4QW+x6YS+rjyJh2m2B6HaAWKGJkBJe4PP4-RmEWQRwRWd4WsYrJwfeH7RMhxhuieQT6TsxGEHO0w7iBhrmWyZYPosl6eX4cycayDjmMeHEOBMdijJYjj8aKAULmGka9qZoGPK4R5viYT5zDFto1n8D42Oy7KrK43xZd2UZ9ouy6joVIVgeadrctpzrGB5ArKdMFY9JYzz2OYnFNnBzitWkEBELAWAAEYYOJuZUfuTzfMe3lFtNtYEUE8UGJYGGRNYHkce6X5xEAA */
    id: 'eggplant',
    initial: 'initialize',
    context: { // Add this
        langServer: null,
        errorCode: null,
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
                    target: 'newProject'
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
            initial: 'viewReady',
            states: {
                viewReady: {
                    on: {
                        OPEN_VIEW: {
                            target: "viewUpdate",
                            actions: assign({
                                view: (context, event) => event.viewLocation.view ? event.viewLocation.view : context.view,
                                fileName: (context, event) => event.viewLocation.fileName ? event.viewLocation.fileName : context.fileName,
                                position: (context, event) => event.viewLocation.position ? event.viewLocation.position : context.position,
                                identifier: (context, event) => event.viewLocation.identifier ? event.viewLocation.identifier : context.identifier,
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
                            resolve(registerNewLSMethods(ballerinaExt.exports.langClient));
                            activateLibraryBrowser();
                        }, error => {
                            reject('BE_ACTIVATION_FAILED');
                        });
                    } else {
                        resolve(registerNewLSMethods(ballerinaExt.exports.langClient));
                        activateLibraryBrowser();
                    }
                }
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
    if (!isEggplant) {
        window.showInformationMessage("Eggplant project not found.");
        throw new Error("Eggplant project not found");
    }
    return isEggplant;
}

