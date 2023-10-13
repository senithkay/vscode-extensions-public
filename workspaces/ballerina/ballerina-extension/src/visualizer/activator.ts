
import { Location, WorkspaceFolder } from 'vscode';
import { createMachine, assign, actions } from 'xstate';


type MyUnion = "Overview" | "Architecture" | "ER" | "Type";


interface VisualizerContext {
    // Currently active view location in source
    view: MyUnion;
    location?: Location;
}

interface OpenViewMessage {
    viewLocation?: Location | string;
}

const textMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QDUCWsCuBDANqgXmAE4B0RYWEAngMQD2ADmAHbICSYA7gNoAMAuolAM6sVABdUdZkJAAPRAGYAbACYSqgBzKALDtUB2AJyrV+wwBoQVRAFoAjLxLLeO+0b0BWHQccn7AL4BVmiYuATEJGhcAIIAxpIAbmA0AMIAMgDyAMoAonyCSCAiYpLSsgoInpo6JEaeiryaqopuhvVWNggOTi5uNUb2xsoGippBIejYeISk0ZzxSSmMLPMFsiUSUjJFlSrqika8yo6jOi5NnYiq9p4aqiZNngY61b6eEyCh0xFzqLEJVDJGgAMTY6VyAH1UgAJGIAOQA4rkACLrIqbMo7UCVZS6OonVy8TzPQyaAxXBDuWqeNQk+yqE7kxSKVSfb7hWZRf4LQHJEiJHlsZgSGgAdVyACF2LkxZCAEq5eEo3Ly9HCURbcq7RD2GokHQeclDHynbyUwyKEi0xk3FyeXiucbBL5TTmReaLIFgAU89J0SiQGiZeEKpUqxVogQbTVYipKAxOUyHZSaTTVQZ6SnnO4GB6KAzKRQM5QeZTst0zD08r38wVcf2BiDB0Oq+WZNXRjGx7bxqkGTQkRTeVSeIas9xjnTZoZDowuE5uR1NHSKCthKt-AFLX1ceXEFgQYgtsPK1Wo9XFHvanGIEZ3PQD-yF3gGc3WRCvAzWhr2V72BleAeZ1Jg3X4SFQEVxBPdJsjDGIUQATUvTFex1KlPAOVdU1aTQGRUTDKVsTQrR8QYjFZPF3CMZ0XWYOgj3gIoOU3GNSjQ29uleOpNHnFlvF8R1BiIoYnCMYx3Eok4jBo9cfi5chKC6DV2JveQlDxIdPAolxeKGed3y6YjSIkijGWk2SXRY8DPT5MA2K1bF1KpJxDR0bQDETRMxzGacPxc79jlHMdGT1UZWTk90t15Hd604YUJAcuN0OqA0jRGLziXsXyLVGa01DUex7UddzIs3blt29XdOEbI8ICSjjnJUQc3PJfRmlcc5FEpVpalMExNCaGjsuaMqbJrOzqv3Zgj3Ieru1UpzKm8Qdk3EgCbV4bLKQdb88xMBpMI8RliTGrlbNinlciIIg6CIBq1MqPU7l0V9eCOZpaULHbXxIfbR2HB59HtM7q0quseX3cgZuIB6lsQI7nE8raWSBvSLROAlxIKrReOMUHSEgxKFscvt1C23gVF0TDeKOEwiJIg1TKk6jaICIA */
    context: {
        view: "Overview"
    } as VisualizerContext,

    initial: 'init',

    states: {
        ready: {
            on: {
                openView: {
                    target: "ViewActive",
                    actions: assign({
                        // increment the current count by the event value
                        count: (context, event) => context.count + event.value,

                        // assign static value to the message (no function needed)
                        message: 'Count changed'
                    })
                    actions: [{

                        view: (typeof message.viewLocation === 'string') ? message.viewLocation : derive(message.viewLocation),
                        location: (typeof message.viewLocation === 'string') ? undefined : message.viewLocation
                    }]
                }
            }
        }
    },

    ViewActive: {
        states: {
            viewInit: {
                on: {
                    WEBVIEW_RENDER: "viewLoaded"
                }
            },

            viewLoaded: {
                on: {
                    ON_RENDERED: "viewRendered",
                    ON_ERROR: "viewError"
                }
            },

            viewRendered: {},
            viewError: {},
            viewRerender: {
                on: {
                    ON_RENDERED: "viewRendered"
                }
            }
        },

        initial: "viewInit",

        on: {
            CLOSE: "ready",
            openView: ".viewRerender",
            FILE_CHANGED: ".viewRerender"
        }
    },

    init: {
        on: {
            ON_LS_READY: "ready"
        }
    }
},

    id: "Visualizer"
})