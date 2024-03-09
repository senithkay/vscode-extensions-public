import { LangClientInterface, MachineStateValue, VisualizerLocation, EventType, MachineViews, webviewReady, STByRangeRequest, SyntaxTreeResponse } from '@wso2-enterprise/eggplant-core';
import { createMachine, assign, interpret } from 'xstate';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Uri, window } from 'vscode';
import { registerNewLSMethods } from './utils/lang-client';
import { activateLibraryBrowser } from './library-browser/activate';
import { PALETTE_COMMANDS } from './eggplantExtentionContext';
import { VisualizerWebview } from './visualizer/webview';
import { RPCLayer } from './RPCLayer';
import { STKindChecker } from '@wso2-enterprise/syntax-tree';

interface Context extends VisualizerLocation {
    langClient: LangClientInterface | null;
    errorCode: string | null;
}

const stateMachine = createMachine<Context>({
    /** @xstate-layout N4IgpgJg5mDOIC5RilADgGwIYDsAuAdAJY5F5FYZEBeYAxBAPY5jE4BujA1qwMYAWYXlwAKAJ0YArIXgDaABgC6iUGkawyRZipAAPRACZ5ANgLyArABZjADgDMNmwYDsBp3YA0IAJ6IAjBYEAJwhQTZ+xs7GbpE2AL5xXijo2PhsmpQ09GBiEmIEmFh4AGaMYgC2BAJCohLSvHJKOmoa5NpIeoZB8gTGls5+lpaDfnZDds5evggG5s4EdvKjfn4h5qsmlglJqIVpaHUyACJgeDKQdArKHS2a7aD6COYGU4gD893RQQHOzmFW23Au1ShAAMgBlACSpDwDGYrBInB4BGSezBUJhCERjF4RS0OCuV2a6juOB0jzsdiCBBs3QGFgm5lpg1eCGMEQI-WMTMWziWQQMxkBqJBBAh0LIdByeQK2BKZUqItw6IleCxHBxeOYhKaNxJbTJHQpVJpdIC5kZzMsrL51MsBiCAzsfSCdis5mFwOVBDEYCwEG8BHYRDAAHcAEp+gN0ADyIgAogA5AD6ADVIfGAOpEvWtfHkxA2cx2ynOZ3mKwRe2s8x9AiDB1+WnyWkDLaJIEpb2+-2B4NhgCqaAgRXoTBYbCRrCVaR7AaDIdDQ5HZ3VnFxBp111U+vzRsLBj8BGcTICDtdxnk1p8iH6dgIbnkjMsdgMlMsV4SHZwjAgcB0M54MSeb3J0CAALR+PMizrMYQSWI6fLOI4rKQSsD7yM4L4vrMfizPIBiel2aQkBkVC0MBpIFggYymqMtK0valLwayER2jY8jwXMlaCtyRFogUhwNCcZwNJAlEGtRiy9PB9gWARDqHi8N4QW+x6YS+rjyJh2m2B6HaAWKGJkBJe4PP4-RmEWQRwRWd4WsYrJwfeH7RMhxhuieQT6TsxGEHO0w7iBhrmWyZYPosl6eX4cycayDjmMeHEOBMdijJYjj8aKAULmGka9qZoGPK4R5viYT5zDFto1n8D42Oy7KrK43xZd2UZ9ouy6joVIVgeadrctpzrGB5ArKdMFY9JYzz2OYnFNnBzitWkEBELAWAAEYYOJuZUfuTzfMe3lFtNtYEUE8UGJYGGRNYHkce6X5xEAA */
    id: 'eggplant',
    initial: 'initialize',
    predictableActionArguments: true,
    context: { // Add this
        langClient: null,
        errorCode: null,
    },
    states: {
        initialize: {
            invoke: {
                id: 'checkProject',
                src: checkIfEggplantProject,
                onDone: {
                    target: 'projectDetected'
                },
                onError: {
                    target: 'newProject'
                }
            }
        },
        projectDetected: {
            entry: "openEggplantPerspective",
            invoke: {
                src: 'openWebView',
                onDone: {
                    target: 'LSInit'
                },
                onError: {
                    target: 'initialize'
                }
            }
        },
        LSInit: {
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
            initial: 'viewInit',
            states: {
                viewInit: {
                    invoke: {
                        src: 'openWebView',
                        onDone: {
                            target: "webViewLoaded"
                        },
                    }
                },
                webViewLoaded: {
                    invoke: {
                        src: 'findView', // NOTE: We only find the view and indentifer from this state as we already have the position and the file URL
                        onDone: {
                            target: "viewReady",
                            actions: assign({
                                view: (context, event) => event.data.view,
                                identifier: (context, event) => event.data.identifier
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
                                documentUri: (context, event) => event.viewLocation.documentUri ? event.viewLocation.documentUri : context.documentUri,
                                position: (context, event) => event.viewLocation.position,
                                identifier: (context, event) => event.viewLocation.identifier
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
                    invoke: {
                        src: 'openWebView'
                    },
                    on: {
                        GET_STARTED: {
                            target: "create",
                        }
                    }
                },
                create: {
                    invoke: {
                        src: 'openWebView'
                    },
                    on: {
                        CANCEL_CREATION: {
                            target: "welcome"
                        },
                        GET_STARTED: {
                            target: "create",
                        }
                    }
                }
            }
        }
    }
}, {
    actions: {
        openEggplantPerspective: (context, event) => {
            vscode.commands.executeCommand('workbench.view.extension.eggplant');
        }
    },
    services: {
        openWebView: (context, event) => {
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
        findView(context, event): Promise<VisualizerLocation> {
            return new Promise(async (resolve, reject) => {
                if (!context.view) {
                    if (!context.position || ("groupId" in context.position)) {
                        resolve({ view: "Overview" });
                        return;
                    }
                    const req: STByRangeRequest = {
                        documentIdentifier: { uri: Uri.file(context.documentUri).toString() },
                        lineRange: {
                            start: {
                                line: context.position.startLine,
                                character: context.position.startColumn
                            },
                            end: {
                                line: context.position.endLine,
                                character: context.position.endColumn
                            }
                        }
                    };

                    const node = await StateMachine.langClient().getSTByRange(req) as SyntaxTreeResponse;

                    if (node.parseSuccess) {
                        if (STKindChecker.isServiceDeclaration(node.syntaxTree)) {
                            resolve({
                                view: "ServiceDesigner",
                                identifier: node.syntaxTree.absoluteResourcePath.map((path) => path.value).join('')
                            });
                        } else if (STKindChecker.isFunctionDefinition(node.syntaxTree) || STKindChecker.isResourceAccessorDefinition(node.syntaxTree)) {
                            resolve({ view: "EggplantDiagram", documentUri: context.documentUri, position: context.position });
                        } else {
                            resolve({ view: "Overview", documentUri: context.documentUri });
                        }
                    }
                    return;
                }
                else {
                    resolve({
                        view: context.view,
                        documentUri: context.documentUri,
                        position: context.position,
                        identifier: context.identifier
                    });
                    return;
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
    langClient: () => { return stateService.getSnapshot().context.langClient; },
    state: () => { return stateService.getSnapshot().value as MachineStateValue; },
    sendEvent: (eventType: EventType) => { stateService.send({ type: eventType }); },
};

export function openView(type: "OPEN_VIEW" | "FILE_EDIT" | "EDIT_DONE", viewLocation: VisualizerLocation) {
    stateService.send({ type: type, viewLocation: viewLocation });
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
        throw new Error("Eggplant project not found");
    }
    return isEggplant;
}

type ViewFlow = {
    [key in MachineViews]: MachineViews[];
};

const viewFlow: ViewFlow = {
    Overview: [],
    ServiceDesigner: ["Overview"],
    EggplantDiagram: ["Overview"],
};

export function getPreviousView(currentView: MachineViews): MachineViews[] {
    return viewFlow[currentView] || [];
}
