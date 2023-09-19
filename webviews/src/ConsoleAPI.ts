
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

    public getContext() {
        return this.messenger.sendRequest({ method: 'getContext' }, { type: 'extension' });
    }

    public getState() {
        return this.messenger.sendRequest({ method: 'getState' }, { type: 'extension' });
    }

    public onStateChanged(callbal: (state: StateChangeEvent) => void) {
        this.messenger.onNotification({ method: 'stateChanged' }, callbal);
    }
}

