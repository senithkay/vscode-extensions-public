
import { ExtendedLangClient, ballerinaExtInstance } from './core';
import { createMachine, assign, interpret } from 'xstate';
import { activateBallerina } from './extension';
import { EventType, GetSyntaxTreeResponse, HistoryEntry, MachineStateValue, STByRangeRequest, SyntaxTreeResponse, VisualizerLocation, webviewReady } from "@wso2-enterprise/ballerina-core";
import { fetchAndCacheLibraryData } from './library-browser';
import { VisualizerWebview } from './visualizer/webview';
import { Uri } from 'vscode';
import { STKindChecker, STNode, traversNode } from '@wso2-enterprise/syntax-tree';
import { RPCLayer } from './RPCLayer';
import { history } from './history';
import { UIDGenerationVisitor } from './history/utils/visitors/uid-generation-visitor';
import { FindNodeByUidVisitor } from './history/utils/visitors/find-node-by-uid';
import { FindConstructByNameVisitor } from './history/utils/visitors/find-construct-by-name-visitor';
import { FindConstructByIndexVisitor } from './history/utils/visitors/find-construct-by-index-visitor';
import { getConstructBodyString } from './history/utils/visitors/util';

interface MachineContext extends VisualizerLocation {
    langClient: ExtendedLangClient | null;
    errorCode: string | null;
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
                            documentUri: (context, event) => event.viewLocation.documentUri ? event.viewLocation.documentUri : context.documentUri,
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
                                target: "webViewLoaded"
                            },
                        }
                    },
                    webViewLoaded: {
                        invoke: {
                            src: 'findView', // NOTE: We only find the view and indentifer from this state as we already have the position and the file URL
                            onDone: {
                                target: "updatedHistory"
                            }
                        }
                    },
                    updatedHistory: {
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
                                    documentUri: (context, event) => event.viewLocation.documentUri ? event.viewLocation.documentUri : context.documentUri,
                                    position: (context, event) => event.viewLocation.position,
                                    identifier: (context, event) => event.viewLocation.identifier
                                })
                            },
                            GO_BACK: {
                                target: "updatedHistory",
                                actions: assign({
                                    documentUri: (context, event) => event.viewLocation.documentUri ? event.viewLocation.documentUri : context.documentUri,
                                    position: (context, event) => event.viewLocation.position,
                                    view: (context, event) => event.viewLocation.view,
                                    identifier: (context, event) => event.viewLocation.identifier
                                })
                            },
                            NAVIGATE: {
                                target: "updatedHistory",
                                actions: assign({
                                    documentUri: (context, event) => event.viewLocation.documentUri ? event.viewLocation.documentUri : context.documentUri,
                                    position: (context, event) => event.viewLocation.position,
                                    view: (context, event) => event.viewLocation.view,
                                    identifier: (context, event) => event.viewLocation.identifier
                                })
                            },
                            FILE_EDIT: {
                                target: "viewEditing",
                                actions: assign({
                                    documentUri: (context, event) => event.viewLocation.documentUri ? event.viewLocation.documentUri : context.documentUri,
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
                                    documentUri: (context, event) => event.viewLocation.documentUri ? event.viewLocation.documentUri : context.documentUri,
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
        findView(context, event): Promise<void> {
            return new Promise(async (resolve, reject) => {
                if (ballerinaExtInstance.getPersistDiagramStatus()) {
                    history.push({
                        location: {
                            view: "ERDiagram",
                            identifier: context.identifier
                        }
                    });
                    resolve();
                    return;
                }
                if (!context.view) {
                    if (!context.position || ("groupId" in context.position)) {
                        history.push({ location: { view: "Overview", documentUri: context.documentUri } });
                        resolve();
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
                            const expr = node.syntaxTree.expressions[0];
                            if (expr?.typeData?.typeSymbol?.signature?.includes("graphql")) {
                                history.push({
                                    location: {
                                        view: "GraphQLDiagram",
                                        identifier: node.syntaxTree.absoluteResourcePath.map((path) => path.value).join(''),
                                        documentUri: context.documentUri,
                                        position: context.position
                                    }
                                });
                                resolve();
                            } else {
                                history.push({
                                    location: {
                                        view: "ServiceDesigner",
                                        identifier: node.syntaxTree.absoluteResourcePath.map((path) => path.value).join(''),
                                        documentUri: context.documentUri,
                                        position: context.position
                                    }
                                });
                                resolve();
                            }
                        } else if (STKindChecker.isFunctionDefinition(node.syntaxTree) && STKindChecker.isExpressionFunctionBody(node.syntaxTree.functionBody)) {
                            history.push({
                                location: {
                                    view: "DataMapper",
                                    documentUri: context.documentUri,
                                    position: context.position,
                                    identifier: node.syntaxTree.functionName.value
                                },
                                dataMapperDepth: 0
                            });
                            resolve();
                        } else if (STKindChecker.isFunctionDefinition(node.syntaxTree) || STKindChecker.isResourceAccessorDefinition(node.syntaxTree)) {
                            history.push({
                                location: {
                                    view: "SequenceDiagram",
                                    documentUri: context.documentUri,
                                    position: context.position
                                },
                                dataMapperDepth: 0
                            });
                            resolve();
                        } else {
                            history.push({ location: { view: "Overview", documentUri: context.documentUri } });
                            resolve();
                        }
                    }
                    return;
                } else {
                    history.push({
                        location: {
                            view: context.view,
                            documentUri: context.documentUri,
                            position: context.position,
                            identifier: context.identifier
                        }
                    });
                    resolve();
                    return;
                }
            });
        },
        showView(context, event): Promise<VisualizerLocation> {
            return new Promise(async (resolve, reject) => {
                const historyStack = history.get();
                const selectedEntry: HistoryEntry = historyStack[historyStack.length - 1]?.location.view
                    ? historyStack[historyStack.length - 1]
                    : { location: { view: "Overview" } };

                const { location: { documentUri, position }, uid } = selectedEntry;
                const node = await StateMachine.langClient().getSyntaxTree({
                    documentIdentifier: {
                        uri: Uri.file(documentUri).toString()
                    }
                }) as GetSyntaxTreeResponse;

                if (selectedEntry.location.view === "Overview") {
                    resolve({ ...selectedEntry.location, syntaxTree: node.syntaxTree });
                    return;
                }

                let selectedST;

                if (node.parseSuccess) {
                    const fullST = node.syntaxTree;
                    if (!uid && position) {
                        const uidGenVisitor = new UIDGenerationVisitor(position);
                        traversNode(fullST, uidGenVisitor);
                        const generatedUid = uidGenVisitor.getUId();
                        const nodeFindingVisitor = new FindNodeByUidVisitor(generatedUid);
                        traversNode(fullST, nodeFindingVisitor);
                        selectedST = nodeFindingVisitor.getNode();

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
                        const nodeFindingVisitor = new FindNodeByUidVisitor(uid);
                        traversNode(fullST, nodeFindingVisitor);

                        if (!nodeFindingVisitor.getNode()) {
                            const visitorToFindConstructByName = new FindConstructByNameVisitor(uid);
                            traversNode(fullST, visitorToFindConstructByName);

                            if (visitorToFindConstructByName.getNode()) {
                                selectedST = visitorToFindConstructByName.getNode();

                                history.updateCurrentEntry({
                                    ...selectedEntry,
                                    location: {
                                        ...selectedEntry.location,
                                        position: selectedST.position,
                                        syntaxTree: selectedST
                                    },
                                    uid: visitorToFindConstructByName.getUid()
                                });
                            } else {
                                const visitorToFindConstructByIndex =
                                    new FindConstructByIndexVisitor(uid, getConstructBodyString(fullST));
                                traversNode(fullST, visitorToFindConstructByIndex);
                                if (visitorToFindConstructByIndex.getNode()) {
                                    selectedST = visitorToFindConstructByIndex.getNode();

                                    history.updateCurrentEntry({
                                        ...selectedEntry,
                                        location: {
                                            ...selectedEntry.location,
                                            position: selectedST.position,
                                            syntaxTree: selectedST
                                        },
                                        uid: visitorToFindConstructByIndex.getUid()
                                    });
                                } else {
                                    // show identification failure message
                                }
                            }
                        } else {
                            selectedST = nodeFindingVisitor.getNode();
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
                }
                const updatedHistory = history.get();
                resolve(updatedHistory[updatedHistory.length - 1].location);
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
            if (state.value === "lsReady") {
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

export function goBackOneView() {
    const historyStack = history.get();
    const lastView = historyStack[historyStack.length - 1];
    stateService.send({ type: "GO_BACK", viewLocation: lastView ? lastView.location : { view: "Overview" } });
}

export function navigate() {
    const historyStack = history.get();
    const lastView = historyStack[historyStack.length - 1];
    stateService.send({ type: "NAVIGATE", viewLocation: lastView ? lastView.location : { view: "Overview" } });
}
