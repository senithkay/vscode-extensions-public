/* eslint-disable @typescript-eslint/naming-convention */
import { createMachine, assign, interpret } from 'xstate';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { window } from 'vscode';
import { MILanguageClient } from './lang-client/activator';
import { extension } from './MIExtensionContext';
import { EVENT_TYPE, MACHINE_VIEW, MachineStateValue, VisualizerLocation, webviewReady } from '@wso2-enterprise/mi-core';
import { ExtendedLanguageClient } from './lang-client/ExtendedLanguageClient';
import { VisualizerWebview } from './visualizer/webview';
import { RPCLayer } from './RPCLayer';
import { history } from './history/activator';

interface MachineContext extends VisualizerLocation {
    langClient: ExtendedLanguageClient | null;
    errorCode: string | null;
}

const stateMachine = createMachine<MachineContext>({
    /** @xstate-layout N4IgpgJg5mDOIC5QFsCWA6VA7VAXVAhgDaoBeYAxBAPZZiZYBu1A1vQMYAWY7LACgCdqAKx64A2gAYAuolAAHarDypackAA9EAJkkA2dJIDMegCwBWIwE4zNgBwB2ADQgAnogCM+ww8narVh5Wdkbm+gC+4S5oDCrEZJRgAkIC6PJEBLgAZtQCyOhcPPxCouwSMuqKyvhqSJo63sZmljam9s5uOnpG6EHWdoEOvqbadpHRGPIlYgAiYLhikBRSsnVVKrWgWgjm2i7uCA5G2uh2kh7apqZ2dl56dtrjIDFEsACSOLhUtPTYzGzoF7vT4IP7UdiZVRYFYrSpKDZYdTbIzWdDaDyhbQOM5HDx6PT7RB6KzmU7dY4YjzYyRHJ5Aj54ChJFJpDLZXL5ekgsEQmrQmSwtbwvlIxAoqxojG7am4-GEhCOUl+UzEo5GSSSEZ0jACMAECCudCMVBgADuABlqPrsFBvnQGP96DFdfrDcazZbrVgoKCmODIbQYRUhdUoaKFeYHKcHPisVZTCYQnZ5fdTOghmYUVSPBZzFZtegXQajSbTQAlPUGigAeT4AFEAHIAfQAam86wB1QUKYVhurbOx6DzoQKmfQ0jzma7ysKkoymI6+ePnbF2cwFotu0sV10UABib3NdabdZmbwAKt2QOsRf3PLoJZJbqY+kN-B55UM7CPI9cQmYrmxDdKy3M06wgFRvQoU8LybGZqwbOsrxvPstk8DwBnTIJJCsXwHDxc5zHlBdvxfS4znxa4USMBwCzoU1BBEMR0FNMAiHYahkEoABxOtzybABlc8AEEy3PU9kN7TZ6h2BcRxjKcSXVXw9CIzoEHVUkHEjBxAl-bFrFMOizUY0pcAKF0FgoABhYSG2sutzSbayyzrYTzzeBDJNDaTtinKNcNUtpLBpfQ1IObRzFJeNdjzUIjBzXQ9EiKIQCwagIDgdQ0DhHzETvBAAFoCXU4rDA1DUgqo0JktSmJsDiEhyFyhFwxGeUSXQFoF2JNd8Ro2i6smaYyjmBYykgFrbzQhAVUkdMTCseLrCHNd5VudBjnfYk8xjQcjALV4GVwKbUJknMDBfMcovMSc9BwnNPyfQxLAeIdugXBLgNdU7fMQKcDEihx0WxK70XCsVAkMAYovw+7tASydvuLd0LStCDvV+-KZrzNMgZBuwwcnFMgnQBd4zmhdzG6fMhsLECSzNHcDSx8MvEjSVItU-yluplMhlOXYE2xYIczaZHQNNcDIKgVmCoxMd0CHdmPCCYk9EilMzk2oW-EkPNVauAsINgAgACMiEmkNWoKsIAu6Kcn1uMxRg6A4BkupobG6fQjDGOn6NMsQ5ZmmitIShwVTaFUwmTdS8W-DWEeJLFtDMDWjIDkyRvM1j2M4sAQ5kkYelxSPbBjp95TT4d7hCBLtH8TVIwOrOGJziy9QWIvtm0tNsTMHM12pwJq7MXobizRurGbwbIiAA */
    id: 'mi',
    initial: 'initialize',
    predictableActionArguments: true,
    context: {
        langClient: null,
        errorCode: null,
        view: MACHINE_VIEW.Overview
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
            invoke: {
                src: 'openWebPanel',
                onDone: {
                    target: 'lsInit'
                }
            }
        },
        lsInit: {
            invoke: {
                src: 'waitForLS',
                onDone: {
                    target: 'ready',
                    actions: assign({
                        langClient: (context, event) => event.data
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
            initial: 'viewLoading',
            states: {
                viewLoading: {
                    invoke: {
                        src: 'openWebPanel',
                        onDone: {
                            target: 'viewStacking'
                        }
                    }
                },
                viewStacking: {
                    invoke: {
                        src: 'updateStack',
                        onDone: {
                            target: "viewReady"
                        }
                    }
                },
                viewNavigated: {
                    always: "viewReady",
                },
                viewReady: {
                    on: {
                        OPEN_VIEW: {
                            target: "viewLoading",
                            actions: assign({
                                view: (context, event) => event.viewLocation.view,
                                identifier: (context, event) => event.viewLocation.identifier,
                                documentUri: (context, event) => event.viewLocation.documentUri,
                                position: (context, event) => event.viewLocation.position
                            })
                        },
                        NAVIGATE: {
                            target: "viewNavigated",
                            actions: assign({
                                view: (context, event) => event.viewLocation.view,
                                identifier: (context, event) => event.viewLocation.identifier,
                                documentUri: (context, event) => event.viewLocation.documentUri ? event.viewLocation.documentUri : context.documentUri,
                                position: (context, event) => event.viewLocation.position,
                            })
                        },
                        FILE_EDIT: {
                            target: "viewEditing"
                        }
                    }
                },
                viewEditing: {
                    on: {
                        EDIT_DONE: {
                            target: "viewReady"
                        }
                    }
                },
            }
        },
        disabled: {
            // define what should happen when the project is not detected
        },
        newProject: {
            initial: "init",
            states: {
                init: {
                    invoke: {
                        src: 'openWebPanel',
                        onDone: {
                            target: 'welcome'
                        }
                    }
                },
                welcome: {
                    on: {
                        GET_STARTED: {
                            target: "create",
                        },
                        OPEN_VIEW: {
                            target: "init",
                            actions: assign({
                                view: (context, event) => event.viewLocation.view,
                            })
                        }
                    }
                },
                create: {
                    on: {
                        CANCEL_CREATION: {
                            target: "welcome"
                        },
                        OPEN_VIEW: {
                            target: "init",
                            actions: assign({
                                view: (context, event) => event.viewLocation.view,
                            })
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
    },
    services: {
        waitForLS: (context, event) => {
            // replace this with actual promise that waits for LS to be ready
            return new Promise(async (resolve, reject) => {
                const ls = (await MILanguageClient.getInstance(extension.context)).languageClient;
                resolve(ls);
            });
        },
        openWebPanel: (context, event) => {
            // Get context values from the project storage so that we can restore the earlier state when user reopens vscode
            return new Promise((resolve, reject) => {
                if (!VisualizerWebview.currentPanel) {
                    VisualizerWebview.currentPanel = new VisualizerWebview();
                    RPCLayer._messenger.onNotification(webviewReady, () => {
                        resolve(true);
                    });
                } else {
                    VisualizerWebview.currentPanel!.getWebview()?.reveal();
                    resolve(true);
                }
            });
        },
        updateStack: (context, event) => {
            return new Promise(async (resolve, reject) => {
                const historyStack = history.get();
                if (historyStack.length === 0) {
                    history.push({ location: { view: MACHINE_VIEW.Overview, } });
                } else {
                    history.push({
                        location: {
                            view: context.view,
                            documentUri: context.documentUri,
                            position: context.position,
                            identifier: context.identifier
                        }
                    });
                }
                resolve(true);
            });
        },
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
    sendEvent: (eventType: EVENT_TYPE) => { stateService.send({ type: eventType }); },
};

export function openView(type: EVENT_TYPE, viewLocation?: VisualizerLocation) {
    stateService.send({ type: type, viewLocation: viewLocation });
}

export function navigate() {
    const historyStack = history.get();
    const lastView = historyStack[historyStack.length - 1];
    stateService.send({ type: "NAVIGATE", viewLocation: lastView ? lastView.location : { view: "Overview" } });
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
