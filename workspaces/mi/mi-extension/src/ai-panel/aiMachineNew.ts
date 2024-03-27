/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

/* eslint-disable @typescript-eslint/naming-convention */
import { createMachine, assign, interpret } from 'xstate';
import * as vscode from 'vscode';
import { EVENT_TYPE, MachineStateValue, AI_MACHINE_VIEW, webviewReady, AIVisualizerLocation, MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { AiPanelWebview } from './webview';
import { RPCLayer } from '../RPCLayer';
import { StateMachine } from '../stateMachine';

interface AiMachineContext extends AIVisualizerLocation {
    token: string | undefined;
    errorCode: string | null;
}

const aiStateMachine = createMachine<AiMachineContext>({
    /** @xstate-layout N4IgpgJg5mDOIC5QFsCWBaAhqgdKgdqgC6qYA2qAXmAMQQD2+Ye+AbvQNbNpa4HGkK1BAXYBjTCUYBtAAwBdOfMSgADvVgDGKkAA9EAJlkA2HLICsRgJyXzADll2ALAYMAaEAE9D5pzgNWAIzGxgYA7K5hAMyuAL6xHjzYLALkVLQMTCzsXDhJfIQkacKi9BJS+ErSgcpIIOqaFTr6CEZ+Th0GgU5hwSEG5mEe3gjG5oE45qEWxk5WTuaOBvGJGMn8RUK0YABOO-Q7OKpkkgBmB8h5awWpWyJsZZKoMgpKOg1a+M2IUWE4xmErEYwrMxuM7EMvIh7LIcPNjIEBlFjFEbL8ViB8jgdmBMBBPDhWKgwAB3AAy9DxBCgdEYzFKuSxOLxBKJpIpVPwUHu4ieL0UCneGk+3wQgXFsPGUSiFnMNjsxjsgWGP26OCig2MVmiA26VmcGKZuPxhOJJIAcpgiVBJJBaVkGdxrtjjayzZbrbaIDzHhUqoK6h8mnUWuKnHYcE5ZEFkQYnBqwlMVWLw-5xXYugsYoFZAYoobncyTWySQAlV00ADyAAUAKLmgD6ADUAJK1gDqb0DwuDoBa0T+4aM0ZlsgidnMyYCsIC40T0oCCrCBd4LpZptJ5ZZNAAwmTawBBUsN6ulysAWWrABUu2oe88viHoQN-iFpVL4xZISMohHtWOhxBLMbBXZIizdTcKwAMRbfcG1rAARFsbwDO9GgfUUB0jDNZBHXDx0nKEEHjUwXFzQIMwMMYNXMcxQNwcCNxJWsIAELkaEQ5CGwQytzVrW96nvbQnwQMInAmFE7BlZFaMCOVvx+Cc4SMQJ5jjDoo2MeIEhAfB6AgOAdHyIV0OEvtEHQKI-Ao8wNXmKYrBiFxk3QQINXVUJBisFEEV6IF6JSTZ0hMkURLlOEIl+YIQVkZFo2TMJYSCRwtX1QZAVsgKyHoKAYAgSsAFciBC3s9EQUI-ksf8gXsCFHISuYcETDpkTk1xQisALwJKjCRJ6P4QhRDU3M-KZCJGdBU1UuVEXFGIQURLrXSYjlWK5HqzLKhArFkCZejjaUrB27pESnXocBzYwTCs+E8zsJb1xLD1UBtIhIA2x9zLFX4rEmOqQlzBwwjsZM3N+xZaLHRFtSBCwHuLM0t3xD7RSmCYZtRcI7Ck7yrGTFwonVRLXAVBwNQneGIOY1iSHW7tTM+rbscqvNEqVE6wgifGogmaVFXGIccxMALWNgTAACMyHe+nQq+tycCVJxZgsT8AXsKJk3lJr7Fo+Y5NRcZtNiIA */
    id: 'mi-ai',
    initial: 'initialize',
    predictableActionArguments: true,
    context: {
        token: undefined,
        view: null,
        errorCode: null
    },
    states: {
        initialize: {
            invoke: {
                src: "checkToken",
                onDone: [
                    {
                        cond: (context, event) => event.data !== undefined, // Token is valid
                        target: 'ready',
                        actions: assign({
                            token: (context, event) => event.data
                        })
                    },
                    {
                        cond: (context, event) => event.data === undefined, // No token found
                        target: 'loggedOut'
                    }
                ],
                onError: {
                    target: 'disabled',
                    actions: assign({
                        errorCode: (context, event) => event.data
                    })
                }
            }
        },
        loggedOut: {

        },
        ready: {
            initial: 'viewReady',
            states: {
                viewLoading: {
                    invoke: {
                        src: 'openWebPanel',
                        onDone: {
                            target: 'viewNavigated'
                        }
                    }
                },
                viewNavigated: {
                    invoke: {
                        src: 'findView',
                        onDone: {
                            target: 'viewReady',
                            actions: assign({
                                view: (context, event) => event.data
                            })
                        }
                    }
                },
                viewReady: {
                    on: {
                        OPEN_VIEW: {
                            target: "viewLoading",
                            actions: assign({
                                initialPrompt: (context, event) => event.viewLocation?.initialPrompt
                            })
                        },
                        CLEAR_PROMPT: {
                            target: "viewReady",
                            actions: assign({
                                initialPrompt: (context, event) => undefined
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
        }
    }
}, {
    guards: {
        tokenExists: (context, event) => {
            return context.token !== undefined;
        },
        tokenNotFound: (context, event) => {
            return context.token === undefined;
        }
    },
    services: {
        checkToken: (context, event) => {
            return new Promise((resolve, reject) => {
                // Check for AI API status
                resolve(true);
            });
        },
        openWebPanel: (context, event) => {
            return new Promise((resolve, reject) => {
                if (!AiPanelWebview.currentPanel) {
                    AiPanelWebview.currentPanel = new AiPanelWebview();
                    RPCLayer._messenger.onNotification(webviewReady, () => {
                        resolve(true);
                    });
                } else {
                    AiPanelWebview.currentPanel!.getWebview()?.reveal();
                    resolve(true);
                }
            });
        },
        disableExtension: (context, event) => {
            return async (resolve, reject) => {
                vscode.commands.executeCommand('setContext', 'MI.aiStatus', 'disabled');
            };
        },
        findView: (context, event) => {
            return new Promise((resolve, reject) => {
                switch (StateMachine.context().view) {
                    case MACHINE_VIEW.Overview:
                        resolve(AI_MACHINE_VIEW.AIOverview);
                        break;
                    default:
                        resolve(AI_MACHINE_VIEW.AIArtifact);
                        break;
                }
            });
        }
    }
});


// Create a service to interpret the machine
export const aiStateService = interpret(aiStateMachine);

// Define your API as functions
export const StateMachineAI = {
    initialize: () => aiStateService.start(),
    service: () => { return aiStateService; },
    context: () => { return aiStateService.getSnapshot().context; },
    state: () => { return aiStateService.getSnapshot().value as MachineStateValue; },
    sendEvent: (eventType: EVENT_TYPE) => { aiStateService.send({ type: eventType }); },
};

export function openAIView(type: EVENT_TYPE, viewLocation?: AIVisualizerLocation) {
    aiStateService.send({ type: type, viewLocation: viewLocation });
}

async function checkAiStatus() {
    return new Promise((resolve, reject) => {
        // Check for AI API status
        resolve(true);
    });
}
