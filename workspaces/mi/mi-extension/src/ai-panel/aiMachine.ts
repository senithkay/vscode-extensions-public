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
    errorCode: string | null;
}

const aiStateMachine = createMachine<AiMachineContext>({
    /** @xstate-layout N4IgpgJg5mDOIC5QFsCWBaAhqgdKgdqgC6qYA2qAXmAMQQD2+Ye+AbvQNbNpa4HGkK1BAXYBjTCUYBtAAwBdOfMSgADvVgDGKkAA9EAJlkA2HCYMBWAIwAOY0YMGbAdmMAaEAE9ENqzguygQYALAbOzrKWzgYAvjEePNgsAuRUtGAAThn0GTiqZJIAZjnIOIl8hCSpwqL0ElL4Sko66poNOvoIRqbm1nYOTq4e3ghWzsE4AJwWAMxWwa52xpOOcQkYSRlgmBCeOKyoYADuADL0OwRQdIzMtVxlG7hbO3sHx2cX+FAibHWSqDIFM0kCBWlp8B1EDMQlNJnC4WNZM4bMF3F5ENEbDgrNCbI4xrZgi41iByjhnrt9ocjgBlIiYMQcS7XJgsdj3MkU17UukMplfH7if6AxQKFoacGQhDOGYWHAzSYo4Ko6IWezDDFObG4-HOQnE+Kkx7k7aUt5HABymAOUEkkBowLUEvaIM6VhxfjxsmCCtkCJmMzRI2MxgmVkck1keJckScJM5pu5xwASomaAB5AAKAFELQB9ABqAElswB1R2g50AiGujHRHDjRzK4wBAwByYahAWCyTKbmMKTYz9Hvx41cqkptMWgCCxYA4tOACrZitgl2gN1RvyBZGNv3GGY+zt6vz2JyTKyzRXdqyj3gml4To6pl40ABiRZO2bz2YAIkXF1XKttFrUYtzMJEXFCfdDxmTtjBxHAzy9cMt3DO9NkTJ9swgAQvhoP8ALzX90wtFcxRBNdqylKxwJ3KCjEHWDOzVGZsQjBZQ0VAwQziQ18HoCA4B0cpxTaajQPQINECkjCKhSIQwDEyVQNCTtJgmRwW3CSNdxsGY5IfXZlPXPREGCDt0QQBYDBwYJzBRCxwjmWQDMNBNH3ND5cK+EyJI3RBJmceCXAbKwEJmP19IPYxnEM8dzV5RlLj8kCAq7SwpiHcYbA0sYAjgqyIjYg8wnGVVfWCeKsPNK0bTtCBUprdLwx4vsDx9S97APKxjwMXtrAQwJaMHWxjGqzzqRfYzKOA5qzIQFZbOcQcNIssJA3Cvq-AsCzQnCqCnIms1qRwvCoCamitPa2Cup4uZ4KjfwFRsv0XJWQzcNgTAACMyEgS7QKczsUSxJFjD9frAjhZwLD4mIgA */
    id: 'mi-ai',
    initial: 'initialize',
    predictableActionArguments: true,
    context: {
        view: null,
        errorCode: null
    },
    states: {
        initialize: {
            invoke: {
                src: checkAiStatus,
                onDone: [
                    {
                        target: 'ready',
                        actions: assign({
                            view: (context, event) => AI_MACHINE_VIEW.AIOverview
                        })
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
    services: {
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
