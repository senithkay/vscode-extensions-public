/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { createMachine, assign, interpret } from 'xstate';
import * as vscode from 'vscode';
import { POPUP_EVENT_TYPE, PopupVisualizerLocation, webviewReady, PopupMachineStateValue, onParentPopupSubmitted } from '@wso2-enterprise/mi-core';
import { VisualizerWebview } from './visualizer/webview';
import { RPCLayer } from './RPCLayer';
import { StateMachine } from './stateMachine';

interface PopupMachineContext extends PopupVisualizerLocation {
    errorCode: string | null;
}

const stateMachinePopup = createMachine<PopupMachineContext>({
    /** @xstate-layout N4IgpgJg5mDOIC5QFsCWA6VA7VAXVAhgDaoBeYAxBAPZZiZYBu1A1vQMYAWY7LACgCdqAKx64A2gAYAuolAAHarDypackAA9EAJgCMANnSSA7AA5dAZgCsuyZIAspyVasAaEAE9E9+7vTHtfQDtK3tJSysATnsAXxj3NAYVYjJKGjoGZjZ0Lh5+IVF2CV1ZJBBFZXw1Mq0EbUlDE3NrWwcnF3cvBFMLdG1jC3sLfVNRyKt9PTiEjGxkknIqWnpsLI5uXkERMXFtUoUlFWrQWr1GswjWx2c3Tx1J9Cs7E0jjXXtQ-WmQRLn8FMWYAEQgE6HkRAIuAAZtQBMgcht8tsilJ9uVDlUsOpalZtJ1EO8rL1IqYSZEgqZAhYLJFvok6AB3LaFXAAETAuDEkCWGVWrHo9LATIKYnZnKKkAQfPYkNUWFRqPUFSOWJqiDe9keuisA2MDX0Nm1+IQ9n0mo+1IGuj0DUi0TpGGoRAgzNFHK5EB5KyY-PQiSdLpFRTFHqlPplmIVMiVGLl2PVw3QQV0kX6NNxI2Ntkaz1MxlNZMk1Id6CIsAAkjhcF7Mr7EmXK3gw8wI3Ko2jlZj43V9JF0JTzDYeu1Ig0s7Y-PZtHbtBZnNpfLT4j8MA2qxQgSCwRDobD4fWK1Xm9RW7R2zHKnG1T2+wPtbph85R-osxZrUZLG-6iY9dYSwIwAICAPHQRhUCFAAZaggOwKAaz5bJEgAoCQLAyDoIgWDj1PeUZEVMpOyvE4CXCPxU2-PVwl7M0s20Bd0DCM1wgsUxTX0P9lyQwDgNA8CGQAZVwAheFg+CfUQjBkJ4tCBKEkSsCgbDZTPPDowI2Njk0Akp20dBBhY4x9AMAJ7BJWj6MYsJLFY-R2Ksf9uNQviADkCDAqBIW5dJvTWP1JMc3ihVc9zPIgJTI1UjsNNVYiEHeOi9KGPMjKCBczLuBBIgsYx0F0Yw7QCB9TEmCYHJQwKGQAJUcigAHk+AAUWcgB9AA1csGoAdXwg5L002p2NMfshhnIs3iyyJaLsXL8tTRxjACEYvk4-zypk6qUIoZyAEF2oAcW2gAVBqevRPqYq0hBBuGmlUzGlMaSzZxDCnO0GhYwI6LK6S+I24CKAAMXLCCGuahrWXLQ7TsI-rEGu1jbvqbKHsmjLLFNJNqXqOjKWiXRvqcoUGsw-AFIocHIea1lauck61N6lVuzNXpnmyrLgmy+xaPJXLqWYpijNCEtGVdIoKqgmCye82sJPQEWg1wcWMKw6VlNw6Roei7sLiTN5SRpYwbFeW4umsXSLW1Oc9cmU1haFUXFfWmr6qatqOu6+mzsZ68el0qJstGa0F0mCxjRCQwnjsZnJFMGxSu+LBqAgOB1DQC9vdigBaF8Mszqx0DtQui6LnUSz+QgFjAdOu2vKdjSGSci20WPrXeUdYhWuX7YVkMJQgauiMu0y-EjkxJDtfQ7Dok3vBpAuiWb0Z6kXfMSwDB3e85fv1PO7sbF6A1JiMiwF0NvNjXMR5niLAw5qnks1zwAfYYQBbufzsk8z0WdbHszupK6AzGusUdJJhCDHXQxlpw3AvqZXWZJ6ikgnqYAmStJZQGfhdWoZghrPh8JAyIlgyTjjtAXBoVhWI+A+AtYwqCZKCWEiwWCmDuyt10s+awRYb62Rzl0AhfY8FPEMq9IW-8AoyWCqgDyW8WHXgMHlPS1p7ADBjuYEqT0KFJgmEMOi1FHAoLEWtX6jlZEgL1GAp45goGjg6GjLGmMT7N1xLOIkS4ZjoAARVYmKgFKmMujgshZpfApiIaSV8vhHimSXraN8U4SyYVgAQAARkQSAfjagjT6M0QIrwixvlDmjIYOVPzWmsGaPUUxO7y2RLgdJiAnj50PoESwp8KHGCzL2IwzwrIUKJCfDu7jqksjQZhXxO8M6XRcAfCYzT+ln3aRlHJSYdHsUkP0celg7bChqRVP6gCvbAMuiSXSh85zBJGDHBZXRm45ScMgz6WUiQdziEAA */
    id: 'mi-popup',
    initial: 'initialize',
    predictableActionArguments: true,
    context: {
        errorCode: null,
        view: null
    },
    states: {
        initialize: {
            invoke: {
                src: 'initializeData',
                onDone: {
                    target: 'ready',
                    actions: assign({
                        documentUri: (context, event) => event.data.documentUri,
                    })
                }
            }
        },
        ready: {
            on: {
                OPEN_VIEW: {
                    target: "open",
                    actions: assign({
                        view: (context, event) => event.viewLocation.view,
                        recentIdentifier: (context, event) => "",
                        documentUri: (context, event) => event.viewLocation.documentUri,
                        customProps: (context, event) => event.viewLocation.customProps,
                    })
                },
            }
        },
        reopen: {
            invoke: {
                src: 'initializeData',
                onDone: {
                    target: 'open',
                    actions: assign({
                        documentUri: (context, event) => event.data.documentUri,
                    })
                }
            }
        },
        open: {
            on: {
                OPEN_VIEW: {
                    target: "reopen",
                    actions: assign({
                        view: (context, event) => event.viewLocation.view,
                        recentIdentifier: (context, event) => "",
                        documentUri: (context, event) => event.viewLocation.documentUri,
                        customProps: (context, event) => event.viewLocation.customProps,
                    })
                },
                CLOSE_VIEW: {
                    target: "notify",
                    actions: assign({
                        view: (context, event) => null,
                        recentIdentifier: (context, event) => event.viewLocation.recentIdentifier
                    })
                },
            }
        },
        notify: {
            invoke: {
                src: 'notifyChange',
                onDone: {
                    target: 'initialize'
                }
            }
        },
        disabled: {
            invoke: {
                src: 'disableExtension'
            },
        },
    },
    on: {
        RESET_STATE: { // Global event to reset the state to "formReady"
            target: "initialize"
        }
    }
}, {
    services: {
        initializeData: (context, event) => {
            // Get context values from the project storage so that we can restore the earlier state when user reopens vscode
            return new Promise((resolve, reject) => {
                const documentUri = StateMachine.context().projectUri;
                resolve({ documentUri });
            });
        },
        notifyChange: (context, event) => {
            return new Promise((resolve, reject) => {
                RPCLayer._messenger.sendNotification(onParentPopupSubmitted, { type: 'webview', webviewType: VisualizerWebview.viewType }, { recentIdentifier: context.recentIdentifier });
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
const popupStateService = interpret(stateMachinePopup);

// Define your API as functions
export const StateMachinePopup = {
    initialize: () => popupStateService.start(),
    service: () => { return popupStateService; },
    context: () => { return popupStateService.getSnapshot().context; },
    state: () => { return popupStateService.getSnapshot().value as PopupMachineStateValue; },
    sendEvent: (eventType: POPUP_EVENT_TYPE) => { popupStateService.send({ type: eventType }); },
    resetState: () => { popupStateService.send({ type: "RESET_STATE" }); },
};

export function openPopupView(type: POPUP_EVENT_TYPE, viewLocation?: PopupVisualizerLocation) {
    popupStateService.send({ type: type, viewLocation: viewLocation });
}
