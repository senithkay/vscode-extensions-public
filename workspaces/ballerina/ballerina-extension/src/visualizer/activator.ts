
import { BallerinaExtension, ExtendedLangClient, LANGUAGE } from '../core';
import { ExtensionContext, ViewColumn, WebviewPanel, window } from 'vscode';
import { createMachine, assign, interpret } from 'xstate';
import { getCommonWebViewOptions } from '../utils';
import { activateBallerina } from '../extension';
import { VisualizerLocationContext } from "@wso2-enterprise/ballerina-core";
import { RPCLayer } from './webRPCRegister';
import { render } from './renderer';


let webViewPanel: WebviewPanel | undefined;

let vsContext: ExtensionContext;
let balExtContext: BallerinaExtension;

type Event =
    | {
        type: "OPEN_VIEW";
        viewLocation?: VisualizerLocationContext;
    }
    | {
        type: "RENDER_WEB_VIEW"
    }
    | {
        type: "RETRY"
    }
    | {
        type: "VIEW_READY"
    }
    | {
        type: "CLOSE"
    }
    | {
        type: "FILE_CHANGED"
    };

function activateLanguageServer(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        // wait for ls to be started
        balExtContext = await activateBallerina(vsContext);
        resolve();
    });
}

function openWebView(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        webViewPanel = window.createWebviewPanel(
            "visualizer",
            "Visualizer",
            { viewColumn: ViewColumn.One, preserveFocus: false },
            getCommonWebViewOptions()
        );

        webViewPanel.onDidDispose(() => {
            webViewPanel = undefined;
            closeView();
        });
        webViewPanel.webview.html = render(webViewPanel.webview);
        RPCLayer.create(webViewPanel, balExtContext);

        resolve();
    });
}

function findView(context: VisualizerLocationContext): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        // Find the exact location or the view to render and show
        resolve();
    });
}

function updateViewLocation(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        resolve();
    });
}


export function startMachine(context: any) {
    vsContext = context;
    service.start();
}

export function getService() {
    return service;
}

export function getLangClient() {
    return <ExtendedLangClient>balExtContext.langClient;
}

export function getContext() {
    return vsContext;
}

export function openView(viewLocation: VisualizerLocationContext) {
    service.send({ type: "OPEN_VIEW", viewLocation: viewLocation });
}

export function closeView() {
    service.send({ type: "CLOSE" });
}


const visualizerMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QDUCWsCuBDANqgXmAE4B0AkgHaoAuAxBAPYVgmoUBuDA1i2prgWLkq1BG04BjLNVRMA2gAYAuoqWJQABwawasiupAAPRACYAjGZIKArCYUAOAMxnr1gJz23HgDQgAnqYKjiQmACxeXgBskaEA7KGRsfYAvsm+fNh4hKSUNLTERAykGjjSAGZFALYkGQLZwjRiHAxSMvLKqgZaOm36SEaI0ZEkZiZ21mY2jtbTvgEIbrEkkU4mK7Em7hZOqenomYKkAKJEhUS0AEpHACoXAJqd-d26TAbGCKNziKO7ILVZQguYCwED8tAA8gAFI4AOQA+sgyEcAOqPTTaF59UDvcLBSLTUKhBSbab40JfD6xBQkNyOeKxMzOBRuEyxFm-f6HGqoMAAdwAghIZOwwLQAMIAGXBAGUjmiQM9em9EI5IiYaSYWY57GY3GTEhTHCZ7MtVXFzMyxmZYhz9nUhGg+YLhaKobCEUjUcouhilf13pNYhT7AphsSHEMZms3NZbfwAaRHQKhagRbQAGJkCVHOFigAS-JhAHEjgAReWKvTKj4KIP+QaxYabBSTRx6rxBWNpP52hPcp0pkUkdg83m5OiMZisZo8bnxrlJ52plgjvnjpqSaR6VQV31V-2IQnDaxORw2eyJOJOCkxtwkWLWFuM0N2SInuMHeqLwcr0fj-KnEUJAlOUVRzp+DqjkuQ6rmOIgbi0W7tCo3pPHurwHh8oTGiMJ6hKMTjhI+dbzES6qhCGapjJqjiqiYH72omUE-iQvJgAARkmEoMCCkD0EwLDiNwvC9guzEuqxHFcTxECQAhrTbh0qHoj0+7YogjahCQbbWEkzJmJEFjEsG+IkI+CgWYScTxNqDF9t+ElsZxo7cbxEAAWcwGlNQFRENUnJfuJy6Sc5fKubJEDyUhFA7spCroViAwIJp2kxnpbgGUZJjBgZVgWbWkRuHExKuHZYkDhJsHhWwUC0IiKJwlc-Klg8cWVhh6k1oZJDYQyQSjOs7gmeq+UtkSMQ6aEZWBRVwUYBoEDSGASb8VOQmzgFkGzUO82LdQy2jlFvSxWoaGqR1SVHmZp7npeSSOBSDKWPloy2NMLaatNW3JhJu1LStBRASBPlgZtTHbSwf37UmR2KShp0qZi1ZXSetG3fS171gg0TBOZCjYfiRVuC2qTdhQDCyfA-Rgz652Je8AC0qoUgzD49REiwuPpCRfTkIi00jmHYRS1pNuEeoTBsNiso4vMkCcZwC36nWjGsJAhuYrh0vYUbWCLkxWOMjIssy+GxDa3ZgyQQIgvMiPK0lqrDPi1hxNqoYxEVD1Y3Y6phFEeo2B4RpTZbokzT9y5K2pSVDVj1hvve5nm-EmqhDMcsOcFsHjtHF3vMa6ozKMDjGuNCTe-MRNmfltixNM9dmKHezzhH0EsE50luXn9OIO41LajMVIJ8yjfBjYScWQZaqhhlZiZ0FMEuTJNU99WGXWNpoR0tGDhRiRiAXkXL3l5NC8Q8Oo426Ca+Yarli6hrCREvE2-DezXiqhMhW0vPYet99duJAoYHT5LfTqhczLODsPYMuoYK4UjfMEZsQcLw2F0m4c+kcl58gVkUcBSUN5bx3oVPeRoD7Y0KpPCw6cm7my8KTZIQA */
    tsTypes: {} as import("./activator.typegen").Typegen0,
    schema: {
        context: {} as VisualizerLocationContext,
        events: {} as Event
    },
    context: {
        view: "Overview"
    },
    initial: 'Init',

    states: {
        Init: {
            invoke: {
                src: activateLanguageServer,
                onDone: {
                    target: "Ready"
                }, // refers to `someSrc` being done
                onError: {
                    target: "Error"
                }
            }
        },
        Error: {
            on: {
                RETRY: "Init"
            }
        },
        Ready: {
            on: {
                OPEN_VIEW: {
                    target: "ViewActive",
                    actions: assign({
                        // we will set either location or view
                        view: (context, event) => event.viewLocation.view,
                        location: (context, event) =>  event.viewLocation.location
                    })
                }
            }
        },
        ViewActive: {
            initial: "viewInit",
            states: {
                viewInit: {
                    invoke: {
                        src: openWebView,

                        onDone: {
                            target: "webViewLoaded"
                        },

                        onError: "#Visualizer.Error"
                    }
                },

                webViewLoaded: {
                    invoke: {
                        src: findView,
                        onDone: {
                            target: "viewLoading", // wait for loading to be finished
                            // Need to add more actions here
                        },
                        onError: {
                            target: "viewError"
                        }
                    }
                },

                viewLoading: {
                    on: {
                        VIEW_READY: "viewReady"
                    }
                },

                viewReady: {

                },

                updateView: {
                    invoke: {
                        src: updateViewLocation,
                        onDone: {
                            target: "webViewLoaded"
                        },
                        onError: {
                            target: "viewError"
                        }
                    }
                },

                viewError: {}
            },
            on: {
                CLOSE: "Ready",
                OPEN_VIEW: {
                    target: "ViewActive.webViewLoaded",
                    actions: assign({
                        // we will set either location or view
                        view: (context, event) => event.viewLocation.view,
                        location: (context, event) =>  event.viewLocation.location
                    })
                },
                FILE_CHANGED: "ViewActive.updateView"
            }
        }
    },
    id: "Visualizer"
});

let service = interpret(visualizerMachine);

