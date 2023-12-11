
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
        type: "FILE_CHANGED";
        viewLocation?: VisualizerLocationContext;
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
            { viewColumn: ViewColumn.Beside, preserveFocus: false },
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

export function updateView(viewLocation: VisualizerLocationContext) {
    service.send({ type: "FILE_CHANGED", viewLocation: viewLocation });
}

export function closeView() {
    service.send({ type: "CLOSE" });
}


const visualizerMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QDUCWsCuBDANqgXmAE4B0AkgHaoAuAxBAPYVgmoUBuDA1i2prgWLkq1BG04BjLNVRMA2gAYAuoqWJQABwawasiupAAPRACYAjGZIKArCYUAOAMxnr1gJz23HgDQgAnqYKjiQmACxeXgBskaEA7KGRsfYAvsm+fNh4hKSUNLTERAykGjjSAGZFALYkGQLZwjRiHAxSMvLKqgZaOm36SEaI0ZEkZiZ21mY2jtbTvgEIbrEkkU4mK7Em7hZOqenomYKkAKJEhUS0AEpHACoXAJqd-d26TAbGCKNziKO7ILVZQguYCwED8tAA8gAFI4AOQA+sgyEcAOqPTTaF59UDvcLBSLTUKhBSbab40JfD6xBQkNyOeKxMzOBRuEyxFm-f6HGqoMAAdwAghIZOwwLQAMIAGXBAGUjmiQM9em9EI5IiYaSYWY57GY3GTEhTHCZ7MtVXFzMyxmZYhz9nUhGg+YLhaKobCEUjUcouhilf13saSI44rYzJ5Qjr4o5HBT7AphrZg9bpmEZpFbfwAaRHQKhagRbQAGJkCVHOFigAS-JhAHEjgAReWKvTKj4KWIUxLDTYKSaOPVeILWDMHeo5535ljsHm83J0RjMVjNHjczNc8d5kUkad8udNSTSPSqJu+lv+xCEhNORw2eyJOJOCludwkWLWXuM+N2SLWFJpP52lm3JOpuU4znO+SnEUJAlOUVSrqODozhOW47rOIj7i0h7tCo3pPKerznh8oSBi49ihKMTjhO+Hb+BexIkBGX5jJq0ZqiO9rZshoEkLyYAAEY5hKDAgpA9BMCw4jcLwgHrtxLq8QJQkiRAkCYa0R4dHh6I9Ge2KILEMRBs+STMmYkQWMSsb4iQ74KPZhJxFGf57GuY7yZOimCTOwmiRAkFnDBpTUBURDVJy7kgQpfHeXyvmqRA6nYRQx7aQqBFYgMCCGaExnWKZbjmZZJixuZVj2e2kRuHExKuBxQEbgpaHxWwUC0IiKJwlc-L1g8aXNoR+lthZjGsn2ozrO41nqhVvZEjE-bWKE9VyVFnkYBoEDSGAObiYuUkrhFSFrVuG1bdQO0zklvSpWo+G6YNWWXrZ163veSQxnR2UWOVvabCY0x-W4K2RbmClndtu0FNBsEhfBR1cSdLAQxdObXZpuF3TpmKts9v7Rm99KPl90TBHZCgkfi1VuL2qT-hQDCqfA-QIz6D2Ze8AC0iTLLYD6TBM9ibLR8yc2+tkVRYLgRmGz4g0Ic5szjREkRS1rduEeoTBsNiso48vHFBRBK36Q2jGsJBxuYrh0vYMybGrkxWOMjIssyFGxDa-4IyQQIgvM2Om1lqrDPiS2xNq8YxNVn3zHY6phFEeo2B4RrLd7smgyhYAm3pWWc7qvNhEkAthpsBpfdYP6vnZN4kUt5EmAbwFg55aGK-dytDca6ozKMDjGvNCSx4g1MS-ZtgR-lzjp65iGI63W4xcpfm5497zuNS2ozFSVfMhHZixjYNf2eZarxoVZjN41bc+SprVrxzo8uEGoR0msNN20aIuIHeveS0PRas8AJuWOovMCfI-agkfq2c2lhdRWwSESeIb9pqMQiKqCYVVaRXwzqAhe2cSAo0unyGBREe62WcHYIW5F4zD07DMEIdl3B3hsPlYGeD54t0IWhE4ZwyFDUKtYV+78qoOHtj-BA0Q3AnwsKECYTkvB02SEAA */
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
                FILE_CHANGED: {
                    target: "ViewActive.webViewLoaded",
                    actions: assign({
                        // we will set either location or view
                        view: (context, event) => event.viewLocation.view,
                        location: (context, event) =>  event.viewLocation.location
                    })
                }
            }
        }
    },
    id: "Visualizer"
});

let service = interpret(visualizerMachine);

