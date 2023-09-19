export type TestCommand = {
    type: "COMMAND";
    command: string;
};
interface Request {
    method: string;
    path: string;
    inputs: {
        requestBody: any;
    };
}
interface Response {
    code: number;
    payload: any;
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
export declare class ConsoleAPI {
    private static instance;
    private messenger;
    private constructor();
    static getInstance(): ConsoleAPI;
    executeTest(input: string): any;
    getContext(): any;
    getState(): any;
    onStateChanged(callbal: (state: StateChangeEvent) => void): void;
}
export {};
