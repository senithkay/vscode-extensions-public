/* eslint-disable @typescript-eslint/naming-convention */
import { createMachine, assign, interpret } from 'xstate';
import * as vscode from 'vscode';
import { window } from 'vscode';
import { MILanguageClient } from './lang-client/activator';
import { extension } from './MIExtensionContext';
import { EventType, MachineStateValue, VisualizerLocation, webviewReady } from '@wso2-enterprise/mi-core';
import { ExtendedLanguageClient } from './lang-client/ExtendedLanguageClient';
import { VisualizerWebview } from './visualizer/webview';
import { RPCLayer } from './RPCLayer';

interface MachineContext extends VisualizerLocation {
    langClient: ExtendedLanguageClient | null;
    errorCode: string | null;
}

const stateMachine = createMachine<MachineContext>({
    /** @xstate-layout N4IgpgJg5mDOIC5QFsCWA6VA7VAXVAhgDaoBeYAxBAPZZiZYBu1A1vQMYAWY7LACgCdqAKx64A2gAYAuolAAHarDypackAA9EAJkkA2dJIDMegCwBWIwE4zNgBwB2ADQgAnogCM+ww8narVh5Wdkbm+gC+4S5oDCrEZJRgAkIC6PJEBLgAZtQCyOhcPPxCouwSMuqKyvhqSJo63sZmljam9s5uOnpG6EHWdoEOvqbadpHRGPIlYgAiYLhikBRSsnVVKrWgWgjm2i7uCA5G2uh2kh7apqZ2dl56dtrjIDFEsACSOLhUtPTYzGzoF7vT4IP7UdiZVRYFYrSpKDZYdTbIzWdDaDyhbQOM5HDx6PT7RB6KzmU7dY4YjzYyRHJ5Aj54ChJFJpDLZXL5ekgsEQmrQmSwtbwvlIxAoqxojG7am4-GEhCOUl+UzEo5GSSSEZ0jACMAECCudCMVBgADuABlqPrsFBvnQGP96DFdfrDcazZbrVgoKCmODIbQYRUhdUoaKFeYHKcHPisVZTCYQnZ5fdTOghmYUVSPBZzFZtegXQajSbTQAlPUGigAeT4AFEAHIAfQAam86wB1QUKYVhurbOx6DzoQKmfQ0jzma7ysKkoymI6+ePnbF2cwFotu0sV10UABib3NdabdZmbwAKt2QOsRf3PLoJZJbqY+kN-B55UM7CPI9cQmYrmxDdKy3M06wgFRvQoU8LybGZqwbOsrxvPstk8DwBnTIJJCsXwHDxc5zHlBdvxfS4znxa4USMBwCzoU1BBEMR0FNMAiHYahkEoABxOtzybABlc8AEEy3PU9kN7TZ6h2BcRxjKcSXVXw9CIzoEHVUkHEjBxAl-bFrFMOizUY0pcBYtiOK4mt62bNtO0k0NpO2Mxh3MXZJHMAZ41Up95V0KN412PNQiMHNdD0YyGOmMoChdBYKAAYWEhtErrc0m0Sss62E883gQxyEXDKdAoUtpLBpfQ1IObR3JHCxaqsULwoiKJngwejTOY9h4soWtG1bdsu2DHsnMROoarMXobizbR-E1SMXG2Ek0xMCx+nc4kPEiNqsGoCA4HUNA4TG8MAFoCXUi7eiGHDRhCjUPG2tqYmwOISHIE6irvBARnlEl0BaBdiTXfEaNol7Jhi3A5gWMpIC+280N+vRJHTEwmssawhzXeVbnQY532JPMY0HIwC1eBlcER1CZJzAwXzHdzzEnVHR0-J9DEsB4h26BcwuA10aecxApwMWqHHRbFGfRaqxSsNHAlq-RWhZhwjMhwsQJLD0rQg71hfG5G8zTCWpbsGXJxTIJ0AXeMVU1bTunzTXNx18sQMN8MvEjSVatUkrMcug49CGU5dgTbFghzNpBeLd1TXAyCoC9n6MTHdAhx9p6bBsWqUzOAmI78TzAhjgsINgAgACMiARkNvuNmkR26Kcn1uMxRg6A4BgZpobG6fQjDGTXOuh1PkZorSwvV2wVTCZN1IuNGrgjpSxzVZ6JnQMemNi1j2M4sAJ5kkYelxWe2nnvz1O0IdM5msK5oVixaVHkzobivUFhP7ZtLTbErlribUCP5KaGEQhP3mq-Ha4QgA */
    id: 'mi',
    initial: 'initialize',
    predictableActionArguments: true,
    context: {
        langClient: null,
        errorCode: null,
        view: "Overview"
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
            always: 'lsInit'
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
                                documentUri: (context, event) => event.viewLocation.documentUri,
                                projectUri: (context, event) => event.viewLocation.projectUri,
                                view: (context, event) => event.viewLocation.view,
                                identifier: (context, event) => event.viewLocation.identifier
                            })
                        },
                        FILE_EDIT: {
                            target: "viewEditing",
                            actions: assign({
                                documentUri: (context, event) => event.viewLocation.documentUri,
                                projectUri: (context, event) => event.viewLocation.projectUri,
                                view: (context, event) => event.viewLocation.view
                            })
                        }
                    }
                },
                viewEditing: {
                    on: {
                        EDIT_DONE: {
                            target: "viewReady",
                            actions: assign({
                                documentUri: (context, event) => event.viewLocation.documentUri,
                                projectUri: (context, event) => event.viewLocation.projectUri,
                                view: (context, event) => event.viewLocation.view
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
                        },
                        OPEN_VIEW: {
                            target: "create",
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
                            target: "welcome",
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
        openMiPerspective: (context, event) => {
            // replace this with actual logic to open the MI perspective
            vscode.commands.executeCommand('integrationStudio.showDiagram');
        }
    },
    services: {
        waitForLS: (context, event) => {
            // replace this with actual promise that waits for LS to be ready
            return new Promise(async (resolve, reject) => {
                const ls = (await MILanguageClient.getInstance(extension.context)).languageClient;
                resolve(ls);
            });
        },
        waitForloading: (context, event) => {
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
    if (viewLocation.documentUri) {
        const projectRoot = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(viewLocation.documentUri));
        if (projectRoot) {
            viewLocation.projectUri = projectRoot.uri.fsPath;
        }
    }
    stateService.send({ type: "OPEN_VIEW", viewLocation: viewLocation });
}

export function createView(viewLocation: VisualizerLocation) {
    stateService.send({ type: "GET_STARTED", viewLocation: viewLocation });
}

export function fileUpdated(viewLocation: VisualizerLocation) {
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
