
import { ExtendedLangClient, ballerinaExtInstance } from './core';
import { createMachine, assign, interpret } from 'xstate';
import { activateBallerina } from './extension';
import { EVENT_TYPE, SyntaxTree, History, HistoryEntry, MachineStateValue, STByRangeRequest, SyntaxTreeResponse, UndoRedoManager, VisualizerLocation, webviewReady, MACHINE_VIEW, DIRECTORY_MAP } from "@wso2-enterprise/ballerina-core";
import { fetchAndCacheLibraryData } from './features/library-browser';
import { VisualizerWebview } from './views/visualizer/webview';
import { commands, Uri, workspace } from 'vscode';
import { notifyCurrentWebview, RPCLayer } from './RPCLayer';
import { generateUid, getComponentIdentifier, getNodeByIndex, getNodeByName, getNodeByUid, getView } from './utils/state-machine-utils';
import * as fs from 'fs';
import * as path from 'path';
import { extension } from './BalExtensionContext';
import { EggplantDiagramRpcManager } from './rpc-managers/eggplant-diagram/rpc-manager';
import { StateMachineAI } from './views/ai-panel/aiMachine';
import { StateMachinePopup } from './stateMachinePopup';

interface MachineContext extends VisualizerLocation {
    langClient: ExtendedLangClient | null;
    errorCode: string | null;
}

export let history: History;
export let undoRedoManager: UndoRedoManager;
const showEggplantOverviewV2 = ballerinaExtInstance.eggplantOverviewV2();

const stateMachine = createMachine<MachineContext>(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QDUCWsCuBDANqgXmAE4B0AkgHaoAuAxBAPYVgmoUBuDA1i2prgWLkq1BG04BjLNVRMA2gAYAuoqWJQABwawasiupAAPRACYAjGZIKArCYUAOAMxnr1gJz23HgDQgAnqYKjiQmACxeXgBskaEA7KGRsfYAvsm+fNh4hKSUNLTERAykGjjSAGZFALYkGQLZwjRiHAxSMvLKqgZaOm36SEaI0ZEkZiZ21mY2jtbTvgEIbrEkkU4mK7Em7hZOqenomYKkAKJEhUS0AEpHACoXAJqd-d26TAbGCKNziKO7ILVZQguYCwED8tAA8gAFI4AOQA+sgyEcAOqPTTaF59UDvcLBSLTUKhBSbab40JfD6xBQkNyOeKxMzOBRuEyxFm-f6HGqoMAAdwAghIZOwwLQAMIAGXBAGUjmiQM9em9EI5IiYaSYWY57GY3GTEhTHCZ7MtVXFzMyxmZYhz9nUhGg+YLhaKobCEUjUcouhilf13saSI44rYzJ5Qjr4o5HBT7AphrZg9bpmEZpFbfwAaRHQKhagRbQAGJkCVHOFigAS-JhAHEjgAReWKvTKj4KWIUxLDTYKSaOPVeILWDMHeo5535ljsHm83J0RjMVjNHjczNc8d5kUkad8udNSTSPSqJu+lv+xCEhNORw2eyJOJOCludwkWLWXuM+N2SLWFJpP52lm3JOpuU4znO+SnEUJAlOUVSrqODozhOW47rOIj7i0h7tCo3pPKerznh8oSBi49ihKMTjhO+Hb+BexIkBGX5jJq0ZqiO9rZshoEkLyYAAEY5hKDAgpA9BMCw4jcLwgHrtxLq8QJQkiRAkCYa0R4dHh6I9Ge2KILEMRBs+STMmYkQWMSsb4iQ74KPZhJxFGf57GuY7yZOimCTOwmiRAkFnDBpTUBURDVJy7kgQpfHeXyvmqRA6nYRQx7aQqBFYgMCCGaExnWKZbjmZZJixuZVj2e2kRuHExKuBxQEbgpaHxWwUC0IiKJwlc-L1g8aXNoR+lthZjGsn2ozrO41nqhVvZEjE-bWKE9VyVFnkYBoEDSGAObiYuUkrhFSFrVuG1bdQO0zklvSpWo+G6YNWWXrZ163veSQxnR2UWOVvabCY0x-W4K2RbmClndtu0FNBsEhfBR1cSdLAQxdObXZpuF3TpmKts9v7Rm99KPl90TBHZCgkfi1VuL2qT-hQDCqfA-QIz6D2Ze8AC0iTLLYD6TBM9ibLR8yc2+tkVWYCR6vY77hCDQhzmzONESRFLWt24R6hMGw2KyjgK8cUFEMrfpDaMawkHG5iuHSstGtY6uTFY4yMiyzIUbENr-gjJBAiC8zY2bWWqsM+JLbE2rxjE1WffMdjqmEUR6jYHhGstPuyaDKFgKbelZZzuq82ESQC2GmwGl9+XWDSETU6yP6y4bwFg55aFK-dKtDca6ozKMDjGvNCRx4g1MS-ZtiR-lzgZ65iGI63W4xcpfl5497zuNS2ozFS1iRMykdmLGNivnZ5lqvGhVmM3jVtz5KmtWvHOjy4QahHSaw0-brLTePc3xu-Z8s8AJuWOovMCfJ-agifq2C2lhdTWwSESeI79f5a1pD+cyXhnA3w8qdTakMZwwKIpsXKCdL5hDjPGewFIva5R-L+Kk+9+wWG9nPTiLcc7bhnCcM4xChqFRrsGD+VUHAzB-iTKqp8PyhAmE5LwdNkhAA */
        id: "Visualizer",
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
                    src: checkForProjects,
                    onDone: {
                        target: "activateLS",
                        actions: assign({
                            isEggplant: (context, event) => event.data.isEggplant,
                            projectUri: (context, event) => event.data.projectUri
                        })
                    },
                    onError: {
                        target: "activateLS"
                    }
                }
            },
            activateLS: {
                invoke: {
                    src: 'activateLanguageServer',
                    onDone: {
                        target: "extensionReady",
                        actions: assign({
                            langClient: (context, event) => event.data
                        })
                    },
                    onError: {
                        target: "extensionReady"
                    }
                }
            },
            lsError: {
                on: {
                    RETRY: "initialize"
                }
            },
            extensionReady: {
                on: {
                    OPEN_VIEW: {
                        target: "viewActive",
                        actions: assign({
                            view: (context, event) => event.viewLocation.view,
                            documentUri: (context, event) => event.viewLocation.documentUri,
                            position: (context, event) => event.viewLocation.position,
                            identifier: (context, event) => event.viewLocation.identifier
                        })
                    }
                }
            },
            viewActive: {
                initial: "viewInit",
                states: {
                    viewInit: {
                        invoke: {
                            src: 'openWebView',
                            onDone: {
                                target: "webViewLoading"
                            },
                        }
                    },
                    webViewLoading: {
                        invoke: {
                            src: 'findView', // NOTE: We only find the view and indentifer from this state as we already have the position and the file URL
                            onDone: {
                                target: "webViewLoaded"
                            }
                        }
                    },
                    webViewLoaded: {
                        invoke: {
                            src: 'showView',
                            onDone: {
                                target: "viewReady",
                                actions: assign({
                                    view: (context, event) => event.data.view,
                                    identifier: (context, event) => event.data.identifier,
                                    position: (context, event) => event.data.position,
                                    syntaxTree: (context, event) => event.data.syntaxTree,
                                })
                            }
                        }
                    },
                    viewReady: {
                        on: {
                            OPEN_VIEW: {
                                target: "viewInit",
                                actions: assign({
                                    view: (context, event) => event.viewLocation.view,
                                    documentUri: (context, event) => event.viewLocation.documentUri,
                                    position: (context, event) => event.viewLocation.position,
                                    identifier: (context, event) => event.viewLocation.identifier
                                })
                            },
                            VIEW_UPDATE: {
                                target: "webViewLoaded",
                                actions: assign({
                                    documentUri: (context, event) => event.viewLocation.documentUri,
                                    position: (context, event) => event.viewLocation.position,
                                    view: (context, event) => event.viewLocation.view,
                                    identifier: (context, event) => event.viewLocation.identifier
                                })
                            },
                            FILE_EDIT: {
                                target: "viewEditing",
                                actions: assign({
                                    documentUri: (context, event) => event.viewLocation.documentUri,
                                    position: (context, event) => event.viewLocation.position,
                                    identifier: (context, event) => event.viewLocation.identifier
                                })
                            },
                        }
                    },
                    viewEditing: {
                        on: {
                            EDIT_DONE: {
                                target: "viewReady",
                                actions: assign({
                                    documentUri: (context, event) => event.viewLocation.documentUri,
                                    position: (context, event) => event.viewLocation.position,
                                    identifier: (context, event) => event.viewLocation.identifier
                                })
                            }
                        }
                    }
                }
            }
        }
    }, {
    services: {
        activateLanguageServer: (context, event) => {
            return new Promise(async (resolve, reject) => {
                try {
                    commands.executeCommand('setContext', 'Eggplant.status', 'loading');
                    const ls = await activateBallerina();
                    fetchAndCacheLibraryData();
                    StateMachineAI.initialize();
                    StateMachinePopup.initialize();
                    resolve(ls.langClient);
                } catch (error) {
                    throw new Error("LS Activation failed", error);
                }
            });
        },
        openWebView: (context, event) => {
            // Get context values from the project storage so that we can restore the earlier state when user reopens vscode
            return new Promise((resolve, reject) => {
                if (!VisualizerWebview.currentPanel) {
                    VisualizerWebview.currentPanel = new VisualizerWebview();
                    RPCLayer._messenger.onNotification(webviewReady, () => {
                        history = new History();
                        undoRedoManager = new UndoRedoManager();
                        const webview = VisualizerWebview.currentPanel?.getWebview();
                        if (webview && (context.isEggplant || context.view === MACHINE_VIEW.EggplantWelcome)) {
                            webview.title = "Eggplant";
                            webview.iconPath = {
                                light: Uri.file(path.join(extension.context.extensionPath, 'resources', 'icons', 'dark-icon.svg')),
                                dark: Uri.file(path.join(extension.context.extensionPath, 'resources', 'icons', 'light-icon.svg'))
                            };
                        }
                        resolve(true);
                    });

                } else {
                    VisualizerWebview.currentPanel!.getWebview()?.reveal();
                    resolve(true);
                }
            });
        },
        findView(context, event): Promise<void> {
            return new Promise(async (resolve, reject) => {
                if (!context.view && context.langClient) {
                    if (!context.position || ("groupId" in context.position)) {
                        if (context.isEggplant && showEggplantOverviewV2) {
                            // Render overview 2 if setting is enabled
                            history.push({ location: { view: MACHINE_VIEW.OverviewV2, documentUri: context.documentUri } });
                            return resolve();
                        }
                        if (context.isEggplant) {
                            const entryPoints = (await new EggplantDiagramRpcManager().getProjectStructure()).directoryMap[DIRECTORY_MAP.SERVICES].length;
                            if (entryPoints === 0) {
                                history.push({ location: { view: MACHINE_VIEW.Overview, documentUri: context.documentUri } });
                                return resolve();
                            }
                        }
                        history.push({ location: { view: MACHINE_VIEW.Overview, documentUri: context.documentUri } });
                        return resolve();
                    }
                    const view = await getView(context.documentUri, context.position);
                    history.push(view);
                    return resolve();
                } else {
                    history.push({
                        location: {
                            view: context.view,
                            documentUri: context.documentUri,
                            position: context.position,
                            identifier: context.identifier
                        }
                    });
                    return resolve();
                }
            });
        },
        showView(context, event): Promise<VisualizerLocation> {
            return new Promise(async (resolve, reject) => {
                StateMachinePopup.resetState();
                const historyStack = history.get();
                const selectedEntry = historyStack[historyStack.length - 1];

                if (!context.langClient) {
                    if (!selectedEntry) {
                        return resolve({ view: MACHINE_VIEW.Overview, documentUri: context.documentUri });
                    }
                    return resolve({ ...selectedEntry.location, view: selectedEntry.location.view ? selectedEntry.location.view : MACHINE_VIEW.Overview });
                }

                if (selectedEntry && selectedEntry.location.view === MACHINE_VIEW.ERDiagram) {
                    return resolve(selectedEntry.location);
                }

                const { location: { documentUri, position } = { documentUri: context.documentUri, position: undefined }, uid } = selectedEntry ?? {};
                const node = documentUri && await StateMachine.langClient().getSyntaxTree({
                    documentIdentifier: {
                        uri: Uri.file(documentUri).toString()
                    }
                }) as SyntaxTree;

                if (!selectedEntry?.location.view) {
                    if (context.isEggplant && showEggplantOverviewV2) {
                        // Render overview 2 if setting is enabled
                        return resolve({ view: MACHINE_VIEW.OverviewV2, documentUri: context.documentUri });
                    }
                    return resolve({ view: MACHINE_VIEW.Overview, documentUri: context.documentUri });
                }

                let selectedST;

                if (node?.parseSuccess) {
                    const fullST = node.syntaxTree;
                    if (!uid && position) {
                        const generatedUid = generateUid(position, fullST);
                        selectedST = getNodeByUid(generatedUid, fullST);
                        if (generatedUid) {
                            history.updateCurrentEntry({
                                ...selectedEntry,
                                location: {
                                    ...selectedEntry.location,
                                    position: selectedST.position,
                                    syntaxTree: selectedST
                                },
                                uid: generatedUid
                            });
                        } else {
                            // show identification failure message
                        }
                    }

                    if (uid && position) {
                        selectedST = getNodeByUid(uid, fullST);

                        if (!selectedST) {
                            const nodeWithUpdatedUid = getNodeByName(uid, fullST);
                            selectedST = nodeWithUpdatedUid[0];

                            if (selectedST) {
                                history.updateCurrentEntry({
                                    ...selectedEntry,
                                    location: {
                                        ...selectedEntry.location,
                                        position: selectedST.position,
                                        syntaxTree: selectedST
                                    },
                                    uid: nodeWithUpdatedUid[1]
                                });
                            } else {
                                const nodeWithUpdatedUid = getNodeByIndex(uid, fullST);
                                selectedST = nodeWithUpdatedUid[0];

                                if (selectedST) {
                                    history.updateCurrentEntry({
                                        ...selectedEntry,
                                        location: {
                                            ...selectedEntry.location,
                                            identifier: getComponentIdentifier(selectedST),
                                            position: selectedST.position,
                                            syntaxTree: selectedST
                                        },
                                        uid: nodeWithUpdatedUid[1]
                                    });
                                } else {
                                    // show identification failure message
                                }
                            }
                        } else {
                            history.updateCurrentEntry({
                                ...selectedEntry,
                                location: {
                                    ...selectedEntry.location,
                                    position: selectedST.position,
                                    syntaxTree: selectedST
                                }
                            });
                        }
                    }
                    undoRedoManager.updateContent(documentUri, node?.syntaxTree?.source);
                }
                const updatedHistory = history.get();
                return resolve(updatedHistory[updatedHistory.length - 1].location);
            });
        }
    }
});

// Create a service to interpret the machine
const stateService = interpret(stateMachine);

function startMachine(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        stateService.start().onTransition((state) => {
            if (state.value === "extensionReady") {
                resolve();
            }
        });
    });
}

// Define your API as functions
export const StateMachine = {
    initialize: async () => await startMachine(),
    service: () => { return stateService; },
    context: () => { return stateService.getSnapshot().context; },
    langClient: () => { return stateService.getSnapshot().context.langClient; },
    state: () => { return stateService.getSnapshot().value as MachineStateValue; },
    sendEvent: (eventType: EVENT_TYPE) => { stateService.send({ type: eventType }); },
};

export function openView(type: EVENT_TYPE, viewLocation: VisualizerLocation) {
    stateService.send({ type: type, viewLocation: viewLocation });
}

export function updateView() {
    const historyStack = history.get();
    const lastView = historyStack[historyStack.length - 1];
    stateService.send({ type: "VIEW_UPDATE", viewLocation: lastView ? lastView.location : { view: "Overview" } });
    if (StateMachine.context().isEggplant) {
        commands.executeCommand("Eggplant.project-explorer.refresh");
    }
    notifyCurrentWebview();
}

async function checkForProjects() {
    let isEggplant = false;
    let projectUri = '';
    try {
        const workspaceFolders = workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            throw new Error("No workspace folders found");
        }
        // Assume we are only interested in the root workspace folder
        const rootFolder = workspaceFolders[0].uri.fsPath;
        const ballerinaTomlPath = path.join(rootFolder, 'Ballerina.toml');
        projectUri = rootFolder;

        if (fs.existsSync(ballerinaTomlPath)) {
            const data = await fs.promises.readFile(ballerinaTomlPath, 'utf8');
            isEggplant = data.includes('eggplant = true');
        }
    } catch (err) {
        console.error(err);
    }
    commands.executeCommand('setContext', 'isEggplantProject', isEggplant);
    return { isEggplant, projectUri };
}
