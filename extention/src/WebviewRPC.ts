import * as vscode from 'vscode';
import { Messenger } from 'vscode-messenger';
import { NotificationType, RequestType } from "vscode-messenger-common";
import { getService, runExecute, TestMachineContext, getState, TestCommand, TestResult, Queries } from './TestEngine';

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


function stateString(state: any) {
    if (typeof state === 'string') {
        return state;
    } else if (typeof state === 'object' && state.hasOwnProperty('executing')) {
        return "executing";
    } else {
        return ""
    }
}