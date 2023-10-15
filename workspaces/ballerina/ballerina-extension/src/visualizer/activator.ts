
import { Location } from 'vscode';
import { createMachine, assign } from 'xstate';


type Views = "Overview" | "Architecture" | "ER" | "Type" | "Unsupported";
type Model = any;


interface VisualizerContext {
    // Currently active view location in source
    view?: Views;
    location?: Location;
    model?: Model;
}

interface OpenViewEvent {
    type: "openView"
    viewLocation?: Location | Views;
}

interface RenderWebViewEvent {
    type: "renderWebView"
}

type Event =
    | {
        type: "OPEN_VIEW";
        viewLocation?: Location | string;
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
    return new Promise<void>((resolve, reject) => {
        resolve();
    });
}

function openWebView(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        resolve();
    });
}

function findView(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        resolve();
    });
}

function updateViewLocation(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        resolve();
    });
}


const textMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QDUCWsCuBDANqgXmAE4B0AkgHaoAuAxBAPYVgmoUBuDA1i2prgWLkq1BG04BjLNVRMA2gAYAuoqWJQABwawasiupAAPRACYAjGZIKArCYUAOAMxnr1gJz23HgDQgAnqYKjiQmACxeXgBskaEA7KGRsfYAvsm+fNh4hKSUNLTERAykGjjSAGZFALYkGQLZwjRiHAxSMvLKqgZaOm36SEaI0ZEkZiZ21mY2jtbTvgEIbrEkkU4mK7Em7hZOqenomYKkAKJEhUS0AEpHACoXAJqd-d26TAbGCKNziKO7ILVZQguYCwED8tAA8gAFI4AOQA+sgyEcAOqPTTaF59UDvcLBSLTUKhBSbab40JfD6xBQkNyOeKxMzOBRuEyxFm-f6HGqoMAAdwAghIZOwwLQAMIAGXBAGUjmiQM9em9EI5IiYaSYWY57GY3GTEhTHCZ7MtVXFzMyxmZYhz9nUhGg+YLhaKobCEUjUcouhilf13pNYhT7AphsSHEMZms3NZbfwAaRHQKhagRbQAGJkCVHOFigAS-JhAHEjgAReWKvTKj4KIP+QaxYabBSTRx6rxBWNpP52hPcp0pkUkdg83m5OiMZisZo8bnxrlJ52plgjvnjpqSaR6VQV31V-2IQnDaxORw2eyJOJOCkxtwkWLWFuM0N2SInuMHeqLwcr0fj-KnEUJAlOUVRzp+DqjkuQ6rmOIgbi0W7tCo3pPHurwHh8oTGiMJ6hKMTjhI+dbzES6qhCGapjJqjiqiYH72omUE-iQvJgAARkmEoMCCkD0EwLDiNwvC9guzEuqxHFcTxECQAhrTbh0qHoj0+7YogjahCQbbWEkzJmJEFjEsG+IkI+CgWYScTxNqDF9t+ElsZxo7cbxEAAWcwGlNQFRENUnJfuJy6Sc5fKubJEDyUhFA7spCroViAwIJp2kxnpbgGUZJjBgZVgWbWkRuHExKuHZYkDhJsHhWwUC0IiKJwlc-Klg8cWVhh6k1oZJDYQyQSjOs7gmeq+UtkSMQ6aEZWBRVwUYBoEDSGASb8VOQmzgFkGzUO82LdQy2jlFvSxWoaGqR1SVHmZp7npeSSOBSDKWPloy2NMLaatNW3JhJu1LStBRASBPlgZtTHbSwf37UmR2KShp0qZi1ZXSetG3fS171gg0TBOZCjYfiRVuC2qTdhQDCyfA-Rgz652Je8AC0qoUgzD49REiwuPpCRfTkIi00jmHYRS1pNuEeoTBsNiso4vMkCcZwC36nWjGsJAhuYrh0vYUbWCLkxWOMjIssy+GxDa3ZgyQQIgvMiPK0lqrDPi1hxNqoYxEVD1Y3Y6phFEeo2B4RpTZbokzT9y5K2pSVDVj1hvve5nm-EmqhDMcsOcFsHjtHF3vMa6ozKMDjGuNCTe-MRNmfltixNM9dmKHezzhH0EsE50luXn9OIO41LajMVIJ8yjfBjYScWQZaqhhlZiZ0FMEuTJNU99WGXWNpoR0tGDhRiRiAXkXL3l5NC8Q8Oo426Ca+Yarli6hrCREvE2-DezXiqhMhW0vPYet99duJAoYHT5LfTqhczLODsPYMuoYK4UjfMEZsQcLw2F0m4c+kcl58gVkUcBSUN5bx3oVPeRoD7Y0KpPCw6cm7my8KTZIQA */
    tsTypes: {} as import("./activator.typegen").Typegen0,
    schema: {
        context: {} as VisualizerContext,
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
                        view: (context, event) => (typeof event.viewLocation === 'string') ? event.viewLocation as Views : undefined,
                        location: (context, event) => (typeof event.viewLocation === 'string') ? undefined : event.viewLocation
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
                            target: "viewLoading"
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
                        view: (context, event) => (typeof event.viewLocation === 'string') ? event.viewLocation as Views : undefined,
                        location: (context, event) => (typeof event.viewLocation === 'string') ? undefined : event.viewLocation
                    })
                },
                FILE_CHANGED: "ViewActive.updateView"
            }
        }
    },
    id: "Visualizer"
});