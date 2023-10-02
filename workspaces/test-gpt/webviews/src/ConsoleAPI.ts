/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export type TestCommand = {
    type: "COMMAND";
    command: string;
}

interface Request {
    method: string;
    path: string;
    inputs: {
        requestBody: any;
    };
}

interface Response {
    code: number,
    payload: any
}

export interface TestResult {
    type: "RESULT";
    request: Request;
    output: Response;
}

export interface Queries {
    query: string;
    scenario: string;
}


export interface StateChangeEvent {
    state: string;
    logs: (TestCommand | TestResult)[];
    queries: Queries[];
}

export class ConsoleAPI {

    private static instance: ConsoleAPI;
    private messenger: any;

    private constructor() {
        const vscode = acquireVsCodeApi();
        const vscode_messenger = require("vscode-messenger-webview");
        this.messenger = new vscode_messenger.Messenger(vscode);
        this.messenger.start();
    }

    public static getInstance(): ConsoleAPI {
        if (!ConsoleAPI.instance) {
            ConsoleAPI.instance = new ConsoleAPI();
        }
        return ConsoleAPI.instance;
    }

    public executeTest(input: string) {
        return this.messenger.sendRequest({ method: 'executeTest' }, { type: 'extension' }, input);
    }

    public setUrl(input: string) {
        return this.messenger.sendRequest({ method: 'setUrl' }, { type: 'extension' }, input);
    }

    public getContext() {
        return this.messenger.sendRequest({ method: 'getContext' }, { type: 'extension' });
    }

    public getState() {
        return this.messenger.sendRequest({ method: 'getState' }, { type: 'extension' });
    }

    public clearTestLogs() {
        return this.messenger.sendRequest({ method: 'clearLogs' }, { type: 'extension' });
    }

    public refreshConsole() {
        return this.messenger.sendRequest({ method: 'refreshConsole' }, { type: 'extension' });
    }

    public onStateChanged(callbal: (state: StateChangeEvent) => void) {
        this.messenger.onNotification({ method: 'stateChanged' }, callbal);
    }
}

