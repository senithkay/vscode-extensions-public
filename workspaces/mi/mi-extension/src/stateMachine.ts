/* eslint-disable @typescript-eslint/naming-convention */
import { createMachine, assign, interpret } from 'xstate';
import * as vscode from 'vscode';
import { Uri, window } from 'vscode';
import { MILanguageClient } from './lang-client/activator';
import { extension } from './MIExtensionContext';
import { EVENT_TYPE, MACHINE_VIEW, MachineStateValue, VisualizerLocation, webviewReady } from '@wso2-enterprise/mi-core';
import { ExtendedLanguageClient } from './lang-client/ExtendedLanguageClient';
import { VisualizerWebview } from './visualizer/webview';
import { RPCLayer } from './RPCLayer';
import { history } from './history/activator';
import { COMMANDS } from './constants';
import { StateMachineAI, openAIView } from './ai-panel/aiMachine';
import { AiPanelWebview } from './ai-panel/webview';

interface MachineContext extends VisualizerLocation {
    langClient: ExtendedLanguageClient | null;
    errorCode: string | null;
}

const stateMachine = createMachine<MachineContext>({
    /** @xstate-layout N4IgpgJg5mDOIC5QFsCWA6VA7VAXVAhgDaoBeYAxBAPZZiZYBu1A1vQMYAWY7LACgCdqAKx64A2gAYAuolAAHarDypackAA9EAJgDMAVnT6AjABZ9uyduMB2bad0AOUwBoQAT0QBaJ+mNWATgsAm10ANn99UwBfaLc0BhViMkowASEBdHkiAlwAM2oBZHQuHn4hUXYJGXVFZXw1JE0dbUNtR3b7MMt9fW1JRzdPBF1+9FNO0zD9SX0w7Rsg2PiMeQqxABEwXDFIKlp6bGY2dAS1kU3t3YgEI+p2XNUsKWkX2qUVRtAtBDDncdMi30AQ6gNmgw8iEiRkksMki0kxkcMwCyxACSIsAAkjhcPs6AxjvQMdjcbcmPdHrQXm8mnVPlh1D9jNZDJZzPpQgFAaZJK5ISMDOgQY5FqLupYAto0SScXgKGkMlkcvlCsVZWS7g8Gs8ZLSFB8dUyoQ5HOgbMZdDYrLZZrpTBDhgEAsKLWFAfNtCFJCCZRgBGACBB3OhGKgwAB3AAy1CD2Cg+MOFJOCQDQZDYcjMbjWCg5OY2qeNJqdMNT2NCBZ2m06D+QQsugCjcWYSGiEWxiMAQifMbjicvri6P9geDofDEYAyrgCLx44nCaxiSP0+PI9PZyx4-nKTri7JS-Vy01mRL0PCZlFTCC-tW2wgO12wvDpgt7aE-eg02PMxGAHIEGGUC5Hs+ogPSRonjogTjI4LLcl0N6tgKdhmnC1izLMFjIp+34ZhOABKo7uBQADyfAAKJ-gA+gAaliFEAOpgRBx7fFCYTWuMXp6DY0zIvocH3vMujCjMrR2CCBicbhxFrhGRHphQf4AIL0QA4ipAAqFEsWWXzNJWIRmpxUoWNeYTdMYyHDDYNiGDMVhwcizpcrJq6-opwYUAAYliUYUdRFEbFiWl6UeBnMsZtaLK09rdlZNmIJxNgwjaYRNiCzrSkOqZyb+FEQCouYUMFoXURspF-rpJYGhFjJQUZNgmbF5kJbo1nCQs56wtWuhWhMYSfnQEaCBcVTydmRUlTQBJ3CmGAjWNlS4JNsbTXmWpUrqry1eB+kNexCC8eg2gZRl5iWk4dmOslLLjOEfEdf21pRMNkbLWI8leSR5FUXRDHMXtrGRTojhmsY3b9sYMNBB0SUICYYToHBtimA4-XWdysRDlg1AQHA6hoO89UVl4jjIxazq2uY6NIgE95eCybTnV6ASwki-X6J+2BJCQ5AkwyFburW9hWo4zpWpeNj3o4ki1pZlng86EujNzuWrOsVRbDsVSQILkFHRYnbAn2-YhNWISy6lQR9iYopo5an6YnKuAG2xhksoi5rcsY9tPaYnUCjDpindeQS06Kgm6O5wbu6DCDcsjGXOoH-YmDMxj3hYlPp3BVq2M4sf4Vm63xvHh2GantbOr76d+4i972Z2vLWXYYqNsYxfyRuc65hXFZmHotbR83Jg+mYTecad8z2faSPOkNGtfvlE4AUBIEQAPjXWPYRjuhEfHg8i-K2VKrq+0iAxtzY3eecR29HUiYxguzfs2A4QTaE3yLniyzUdWfHLOYd8JyFWKlAR+hld6hzmFMWwfxwZRGEnYcY1lwZTGakEbGy8iqwAIAAIyIPrQ8QtGq2DGH7OK4t2iLHvDDTstDLBcxvHxLuy8lpazdqQw2hkfBmipgEGmV56b3gmC6d0Mw-i8mmAld6o0uFrRzJAnhHsfgunaLCDoEdeioyzgKPoLp2b9FaP0D+sIYgcI+oo++6YoE-FNKdJw14ZgGEDtybOgIxL2QlnoaYnIl6xCAA */
    id: 'mi',
    initial: 'initialize',
    predictableActionArguments: true,
    context: {
        langClient: null,
        errorCode: null,
        view: MACHINE_VIEW.Welcome
    },
    states: {
        initialize: {
            invoke: {
                id: 'checkProject',
                src: checkIfMiProject,
                onDone: [
                    {
                        target: 'projectDetected',
                        cond: (context, event) => event.data.isProject === true, // Assuming true means project detected
                        actions: assign({
                            view: (context, event) => MACHINE_VIEW.Overview,
                            projectUri: (context, event) => event.data.projectUri
                        })
                    },
                    {
                        target: 'newProject',
                        cond: (context, event) => event.data.isProject === false, // Assuming false means new project
                        actions: assign({
                            view: (context, event) => MACHINE_VIEW.Welcome
                        })
                    }
                    // No need for an explicit action for the false case unless you want to assign something specific
                ],
                onError: {
                    target: 'disabled',
                    actions: assign({
                        errorCode: (context, event) => event.data
                    })
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
                            target: "viewNavigated"
                        }
                    }
                },
                viewNavigated: {
                    invoke: {
                        src: 'updateAIView',
                        onDone: {
                            target: "viewReady"
                        }
                    }
                },
                viewReady: {
                    on: {
                        OPEN_VIEW: {
                            target: "viewLoading",
                            actions: assign({
                                view: (context, event) => event.viewLocation.view,
                                identifier: (context, event) => event.viewLocation.identifier,
                                documentUri: (context, event) => event.viewLocation.documentUri,
                                projectUri: (context, event) => event.viewLocation.projectUri,
                                position: (context, event) => event.viewLocation.position,
                                projectOpened: (context, event) => true,
                                customProps: (context, event) => event.viewLocation.customProps
                            })
                        },
                        NAVIGATE: {
                            target: "viewNavigated",
                            actions: assign({
                                view: (context, event) => event.viewLocation.view,
                                identifier: (context, event) => event.viewLocation.identifier,
                                documentUri: (context, event) => event.viewLocation.documentUri ? event.viewLocation.documentUri : context.documentUri,
                                position: (context, event) => event.viewLocation.position,
                                projectOpened: (context, event) => true,
                                customProps: (context, event) => event.viewLocation.customProps
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
            invoke: {
                src: 'disableExtension'
            },
        },
        newProject: {
            initial: "viewLoading",
            states: {
                viewLoading: {
                    invoke: {
                        src: 'openWebPanel',
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
                                view: (context, event) => event.viewLocation.view
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
                vscode.commands.executeCommand('setContext', 'MI.status', 'projectLoaded');
                // Activate the AI Panel State machine after LS is loaded.
                StateMachineAI.initialize();
                resolve(ls);
            });
        },
        openWebPanel: (context, event) => {
            // Get context values from the project storage so that we can restore the earlier state when user reopens vscode
            return new Promise((resolve, reject) => {
                if (!VisualizerWebview.currentPanel) {
                    VisualizerWebview.currentPanel = new VisualizerWebview(context.view!);
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
                if (!context.view?.includes("Form")) {
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
        updateAIView: () => {
            return new Promise(async (resolve, reject) => {
                if (AiPanelWebview.currentPanel) {
                    openAIView(EVENT_TYPE.OPEN_VIEW);
                }
                resolve(true);
            });
        },
        disableExtension: (context, event) => {
            return async (resolve, reject) => {
                vscode.commands.executeCommand('setContext', 'MI.status', 'disabled');
                // TODO: Display the error message to the user
                // User should be able to see the error message and retry
            };
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
    sendEvent: (eventType: EVENT_TYPE) => { stateService.send({ type: eventType }); },
};

export function openView(type: EVENT_TYPE, viewLocation?: VisualizerLocation) {
    if (viewLocation?.documentUri) {
        viewLocation.documentUri = Uri.parse(viewLocation.documentUri).fsPath;
    }
    updateProjectExplorer(viewLocation);
    stateService.send({ type: type, viewLocation: viewLocation });
}

export function navigate() {
    const historyStack = history.get();
    if (historyStack.length === 0) {
        history.push({ location: { view: MACHINE_VIEW.Overview, } });
        stateService.send({ type: "NAVIGATE", viewLocation: { view: MACHINE_VIEW.Overview } });
    } else {
        const location = historyStack[historyStack.length - 1].location;
        stateService.send({ type: "NAVIGATE", viewLocation: location });
    }
    const location = history.get()[history.get().length - 1].location;
    updateProjectExplorer(location);
}

function updateProjectExplorer(location: VisualizerLocation | undefined) {
    if (location && location.documentUri) {
        const projectRoot = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(location.documentUri));
        if (projectRoot) {
            location.projectUri = projectRoot.uri.fsPath;
            vscode.commands.executeCommand(COMMANDS.REVEAL_ITEM_COMMAND, location);
        }

    }
    const webview = VisualizerWebview.currentPanel?.getWebview();
    if (webview) {
        if (location && location.view) {
            webview.title = location.view;
        }
    }
}

async function checkIfMiProject() {
    let isMiProject = false;
    let projectUri = '';
    try {
        // Check for pom.xml files excluding node_modules directory
        const pomFiles = await vscode.workspace.findFiles('**/pom.xml', '**/node_modules/**', 1);
        if (pomFiles.length > 0) {
            const pomContent = await vscode.workspace.openTextDocument(pomFiles[0]);
            if (pomContent.getText().includes('<projectType>integration-project</projectType>')) {
                isMiProject = true;
                projectUri = pomFiles[0].fsPath;
            }
        }

        // If not found, check for .project files
        if (!isMiProject) {
            const projectFiles = await vscode.workspace.findFiles('**/.project', '**/node_modules/**', 1);
            if (projectFiles.length > 0) {
                const projectContent = await vscode.workspace.openTextDocument(projectFiles[0]);
                if (projectContent.getText().includes('<nature>org.wso2.developerstudio.eclipse.mavenmultimodule.project.nature</nature>')) {
                    isMiProject = true;
                    projectUri = projectFiles[0].fsPath;
                }
            }
        }
    } catch (err) {
        console.error(err);
        throw err; // Rethrow the error to ensure the error handling flow is not broken
    }

    if (isMiProject) {
        vscode.commands.executeCommand('setContext', 'MI.status', 'projectDetected');
    } else {
        vscode.commands.executeCommand('setContext', 'MI.status', 'unknownProject');
    }

    return {
        isProject: isMiProject,
        projectUri // Return the path of the detected project
    }
}
