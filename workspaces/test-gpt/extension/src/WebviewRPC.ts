/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { Messenger } from 'vscode-messenger';
import { NotificationType, RequestType } from "vscode-messenger-common";
import { getService, runExecute, clearLogs, TestMachineContext, getState, TestCommand, TestResult, Queries } from './TestEngine';

export const messenger = new Messenger();

interface StateChangeEvent {
    state: string;
    logs: (TestCommand | TestResult)[];
    queries: Queries[];
}

// Handle incoming view notification
const executeTest: NotificationType<string> = { method: 'executeTest' };
const stateChanged: NotificationType<StateChangeEvent> = { method: 'stateChanged' };
const getContext: RequestType<string, TestMachineContext> = { method: 'getContext' };
const getStateValue: RequestType<string, string> = { method: 'getState' };
const clearTestLogs: NotificationType<void> = { method: 'clearLogs' };



// Inform console of changing state
getService().onTransition((state) => {
    const snapshot: StateChangeEvent = { state: stateString(state.value), logs: state.context.logs, queries: state.context.queries };
    messenger.sendNotification(stateChanged, { type: 'webview', webviewType: 'testgpt-console' }, snapshot);
});

// Execute Tests
messenger.onRequest(executeTest, (params: string) => {
    runExecute(params);
});

// Get the initial state for console
messenger.onRequest(getStateValue, () => {
    return stateString(getState());

});

// Clear Logs
messenger.onRequest(clearTestLogs, () => {
    clearLogs();
});

function stateString(state: any) {
    if (typeof state === 'string') {
        return state;
    } else if (typeof state === 'object' && state.hasOwnProperty('executing')) {
        return "executing";
    } else {
        return ""
    }
}