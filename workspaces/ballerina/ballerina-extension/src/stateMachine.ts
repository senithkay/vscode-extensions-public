
import { ExtendedLangClient } from './core';
import { createMachine, assign, interpret } from 'xstate';
import { activateBallerina } from './extension';
import { EventType, MachineStateValue, MachineViews, STByRangeRequest, SyntaxTreeResponse, VisualizerLocation, webviewReady } from "@wso2-enterprise/ballerina-core";
import { fetchAndCacheLibraryData } from './library-browser';
import { VisualizerWebview } from './visualizer/webview';
import { Uri } from 'vscode';
import { STKindChecker } from '@wso2-enterprise/syntax-tree';
import { RPCLayer } from './RPCLayer';

interface MachineContext extends VisualizerLocation {
    langClient: ExtendedLangClient | null;
    errorCode: string | null;
}

type ViewFlow = {
    [key in MachineViews]: MachineViews[];
};

const viewFlow: ViewFlow = {
    Overview: [],
    ServiceDesigner: ["Overview"],
    DataMapper: ["Overview"],
    ArchitectureDiagram: ["Overview"],
    ERDiagram: ["Overview"],
    GraphQLDiagram: ["Overview"],
    SequenceDiagram: ["Overview"],
    TypeDiagram: ["Overview"]
};

export function getPreviousView(currentView: MachineViews): MachineViews[] {
    return viewFlow[currentView] || [];
}

const stateMachine = createMachine<MachineContext>(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QDUCWsCuBDANqgXmAE4B0AkgHaoAuAxBAPYVgmoUBuDA1i2prgWLkq1BG04BjLNVRMA2gAYAuoqWJQABwawasiupAAPRACYAjGZIKArCYUAOAMxnr1gJz23HgDQgAnqYKjiQmACxeXgBskaEA7KGRsfYAvsm+fNh4hKSUNLTERAykGjjSAGZFALYkGQLZwjRiHAxSMvLKqgZaOm36SEaI0ZEkZiZ21mY2jtbTvgEIbrEkkU4mK7Em7hZOqenomYKkAKJEhUS0AEpHACoXAJqd-d26TAbGCKNziKO7ILVZQguYCwED8tAA8gAFI4AOQA+sgyEcAOqPTTaF59UDvcLBSLTUKhBSbab40JfD6xBQkNyOeKxMzOBRuEyxFm-f6HGqoMAAdwAghIZOwwLQAMIAGXBAGUjmiQM9em9EI5IiYaSYWY57GY3GTEhTHCZ7MtVXFzMyxmZYhz9nUhGg+YLhaKobCEUjUcouhilf13saSI44rYzJ5Qjr4o5HBT7AphrZg9bpmEZpFbfwAaRHQKhagRbQAGJkCVHOFigAS-JhAHEjgAReWKvTKj4KWIUxLDTYKSaOPVeILWDMHeo5535ljsHm83J0RjMVjNHjczNc8d5kUkad8udNSTSPSqJu+lv+xCEhNORw2eyJOJOCludwkWLWXuM+N2SLWFJpP52lm3JOpuU4znO+SnEUJAlOUVSrqODozhOW47rOIj7i0h7tCo3pPKerznh8oSBi49ihKMTjhO+Hb+BexIkBGX5jJq0ZqiO9rZshoEkLyYAAEY5hKDAgpA9BMCw4jcLwgHrtxLq8QJQkiRAkCYa0R4dHh6I9Ge2KILEMRBs+STMmYkQWMSsb4iQ74KPZhJxFGf57GuY7yZOimCTOwmiRAkFnDBpTUBURDVJy7kgQpfHeXyvmqRA6nYRQx7aQqBFYgMCCGaExnWKZbjmZZJixuZVj2e2kRuHExKuBxQEbgpaHxWwUC0IiKJwlc-L1g8aXNoR+lthZjGsn2ozrO41nqhVvZEjE-bWKE9VyVFnkYBoEDSGAObiYuUkrhFSFrVuG1bdQO0zklvSpWo+G6YNWWXrZ163veSQxnR2UWOVvabCY0x-W4K2RbmClndtu0FNBsEhfBR1cSdLAQxdObXZpuF3TpmKts9v7Rm99KPl90TBHZCgkfi1VuL2qT-hQDCqfA-QIz6D2Ze8AC0iTLLYD6TBM9ibLR8yc2+tkVWYCR6vY77hCDQhzmzONESRFLWt24R6hMGw2KyjgK8cUFEMrfpDaMawkHG5iuHSstGtY6uTFY4yMiyzIUbENr-gjJBAiC8zY2bWWqsM+JLbE2rxjE1WffMdjqmEUR6jYHhGstPuyaDKFgKbelZZzuq82ESQC2GmwGl9+XWDSETU6yP6y4bwFg55aFK-dKtDca6ozKMDjGvNCRx4g1MS-ZtiR-lzgZ65iGI63W4xcpfl5497zuNS2ozFS1iRMykdmLGNivnZ5lqvGhVmM3jVtz5KmtWvHOjy4QahHSaw0-brLTePc3xu-Z8s8AJuWOovMCfJ-agifq2C2lhdTWwSESeI79f5a1pD+cyXhnA3w8qdTakMZwwKIpsXKCdL5hDjPGewFIva5R-L+Kk+9+wWG9nPTiLcc7bhnCcM4xChqFRrsGD+VUHAzB-iTKqp8PyhAmE5LwdNkhAA */
        id: "Visualizer",
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
                    src: 'activateLanguageServer',
                    onDone: {
                        target: "lsReady",
                        actions: assign({
                            langClient: (context, event) => event.data
                        })
                    },
                    onError: {
                        target: "lsError"
                    }
                }
            },
            lsError: {
                on: {
                    RETRY: "initialize"
                }
            },
            lsReady: {
                on: {
                    OPEN_VIEW: {
                        target: "viewActive",
                        actions: assign({
                            view: (context, event) => event.viewLocation.view,
                            documentUri: (context, event) => event.viewLocation.documentUri,
                            position: (context, event) => event.viewLocation.position
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
                                target: "webViewLoaded"
                            },
                        }
                    },
                    webViewLoaded: {
                        invoke: {
                            src: 'findView',
                            onDone: {
                                target: "viewReady",
                                actions: assign({
                                    view: (context, event) => event.data.view,
                                    documentUri: (context, event) => event.data.documentUri,
                                    position: (context, event) => event.data.position
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
                                    position: (context, event) => event.viewLocation.position
                                })
                            },
                            FILE_EDIT: {
                                target: "viewEditing",
                                actions: assign({
                                    view: (context, event) => event.viewLocation.view,
                                    documentUri: (context, event) => event.viewLocation.documentUri,
                                    position: (context, event) => event.viewLocation.position
                                })
                            },
                        }
                    },
                    viewEditing: {
                        on: {
                            EDIT_DONE: {
                                target: "viewReady",
                                actions: assign({
                                    view: (context, event) => event.viewLocation.view,
                                    documentUri: (context, event) => event.viewLocation.documentUri,
                                    position: (context, event) => event.viewLocation.position
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
                    const ls = await activateBallerina();
                    fetchAndCacheLibraryData();
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
                        resolve(true);
                    });
                } else {
                    VisualizerWebview.currentPanel!.getWebview()?.reveal();
                    resolve(true);
                }
            });
        },
        findView(context, event): Promise<VisualizerLocation> {
            return new Promise(async (resolve, reject) => {
                if (!context.position) {
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
                        resolve({ view: "ServiceDesigner", documentUri: context.documentUri, position: context.position });
                    } else if (STKindChecker.isFunctionDefinition(node.syntaxTree) && STKindChecker.isExpressionFunctionBody(node.syntaxTree.functionBody)) {
                        resolve({ view: "DataMapper", documentUri: context.documentUri, position: context.position });
                    } else if (STKindChecker.isTypeDefinition(node.syntaxTree) && STKindChecker.isRecordTypeDesc(node.syntaxTree.typeDescriptor)) {
                        resolve({ view: "ArchitectureDiagram", documentUri: context.documentUri });
                    } else {
                        resolve({ view: "Overview", documentUri: context.documentUri });
                    }
                }
                return;
            });
        }
    }
});

// Create a service to interpret the machine
const stateService = interpret(stateMachine);

function startMachine(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        stateService.start().onTransition((state) => {
            if (state.value === "Ready") {
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
    sendEvent: (eventType: EventType) => { stateService.send({ type: eventType }); },
};

export function openView(type: "OPEN_VIEW" | "FILE_EDIT" | "EDIT_DONE", viewLocation: VisualizerLocation) {
    stateService.send({ type: type, viewLocation: viewLocation });
}

