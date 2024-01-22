/* eslint-disable @typescript-eslint/naming-convention */
import { createMachine, assign, interpret } from 'xstate';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { window } from 'vscode';
import { MILanguageClient } from './lang-client/activator';
import { extension } from './MIExtensionContext';
import { EventType, MachineStateValue, VisualizerLocation } from '@wso2-enterprise/mi-core';
import { StateLocation } from '@wso2-enterprise/mi-rpc-client';
import { ExtendedLanguageClient } from './lang-client/ExtendedLanguageClient';

interface MachineContext extends VisualizerLocation {
    langClient: ExtendedLanguageClient | null;
    errorCode: string | null;
}

const stateMachine = createMachine<MachineContext>({
    /** @xstate-layout N4IgpgJg5mDOIC5QFsCWA6VA7VAXVAhgDaoBeYAxBAPZZiZYBu1A1vQMYAWY7LACgCdqAKx64A2gAYAuolAAHarDypackAA9EAJkkA2dJIDMegCwBWIwE4zNgBwB2ADQgAnogCM+ww8narVh5Wdkbm+gC+4S5oDCrEZJRgAkIC6PJEBLgAZtQCyOhcPPxCouwSMuqKyvhqSJo63sZmljam9s5uOnpG6EHWdoEOvqbadpHRGPIlYgAiYLhikBRSsnVVKrWgWgjm2i7uCA5G2uh2kh7apqZ2dl56dtrjIDFEsACSOLhUtPTYzGzoF7vT4IP7UdiZVRYFYrSpKDZYdTbIzWdDaDyhbQOM5HDx6PT7RB6KzmU7dY4YjzYyRHJ5Aj54ChJFJpDLZXL5ekgsEQmrQmSwtbwvlIxAoqxojG7am4-GEhCOUl+UzEo5GSSSEZ0jACMAECCudCMVBgADuABlqPrsFBvnQGP96DFdfrDcazZbrVgoKCmODIbQYRUhdUoaKFeYHKcHPisVZTCYQnZ5fdTOghmYUVSPBZzFZtegXQajSbTQAlPUGigAeT4AFEAHIAfQAam86wB1QUKYVhurbOx6DzoQKmfQ0jzma7ysKkoymI6+ePnbF2cwFotu0sV10UABib3NdabdZmbwAKt2QOsRf3PLoJZJbqY+kN-B55UM7CPI9cQmYrmxDdKy3M06wgFRvQoU8LybGZqwbOsrxvPstk8DwBnTIJJCsXwHDxc5zHlBdvxfS4znxa4USMBwCzoU1BBEMR0FNMAiHYahkEoABxOtzybABlc8AEEy3PU9kN7TZ6h2BcRxjKcSXVXw9CIzoEHVUkHEjBxAl-bFrFMOizUY0pcAKF0FgoABhYSG2sutzSbayyzrYTzzeBDJNDaTtinKNcNUtpLBpfQ1IObRzFJeNdjzUIjBzXQ9EiKIQCwagIDgdQ0DhHzETvBAAFoCXU4rDA1DUgqo0JktSmJsDiEhyFyhFwxGeUSXQFoF2JNd8Ro2i6smaYyjmBYykgFrbzQhAVUkdMTCseLrCHNd5VudBjnfYk8xjQcjALV4GVwKbUJknMDBfMcovMSc9BwnNPyfQxLAeIdugXBLgNdU7fMQKcDEihx0WxK70XCsVAkMAYovw+7tASydvuLd0LStCDvV+-KZrzNMgZBuwwcnFMgnQBd4zmhdzG6fMhsLECSzNHcDSx8MvEjSVItU-yluplMhlOXYE2xYIczaZHQNNcDIKgVmCoxMd0CHdmPCCYk9EilMzk2oW-EkPNVauAsINgAgACMiEmkNWoKsIAu6Kcn1uMxRg6A4BkupobG6fQjDGOn6NMsQ5ZmmitIShwVTaFUwmTdS8W-DWEeJLFtDMDWjIDkyRvM1j2M4sAQ5kkYelxSPbBjp95TT4d7hCBLtH8TVIwOrOGJziy9QWIvtm0tNsTMHM12pwJq7MXobizRurGbwbIiAA */
    id: 'mi',
    initial: 'initialize',
    context: {
        langClient: null,
        errorCode: null,
        documentUri: null
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
                        src: 'waitForloading',
                        onDone: {
                            target: 'viewReady'
                        }
                    }
                },
                viewReady: {
                    on: {
                        OPEN_VIEW: {
                            target: "viewLoading",
                            actions: assign({
                                documentUri: (context, event) => event.viewLocation.fileName
                            })
                        },
                        FILE_EDIT: {
                            target: "viewEditing",
                            actions: assign({
                                documentUri: (context, event) => event.viewLocation.fileName
                            })
                        }
                    }
                },
                viewEditing: {
                    on: {
                        EDIT_DONE: {
                            target: "viewReady",
                            actions: assign({
                                documentUri: (context, event) => event.viewLocation.fileName
                            })
                        }
                    }
                },
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
                const ls = (await MILanguageClient.getInstance(extension .context)).languageClient;
                resolve(ls);
            });
        },
        waitForloading: (context, event) => {
            // Get context values from the project storage so that we can restore the earlier state when user reopens vscode
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

export function fileUpdated(viewLocation: StateLocation) {
    stateService.send({ type: "FILE_UPDATED", viewLocation: viewLocation });
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
