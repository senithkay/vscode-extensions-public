/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { actions, createMachine, interpret, State, assign, EventObject } from 'xstate';
import API from './API';




const outputChannel = vscode.window.createOutputChannel('TestGPT');

export type TestCommand = {
    type: "COMMAND";
    command: string;
}

interface Request {
    method: string;
    path: string;
    inputs: {
        requestBody: any;
        queryParameters: any;
        pathParameters: any;
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

export interface AuthBasic {
    type: "basic";
    username: string;
    password: string;
}

export interface AuthBearer {
    type: "bearer";
    token: string;
}

export interface AuthKey {
    type: "key";
    headerName: string;
    headerValue: string;
}

export interface AuthNone {
    type: "none"
}

export interface TestMachineContext {
    openapi?: object;
    baseURL?: string;
    apiClient?: AxiosInstance;
    apiSpec?: any;
    queries?: any;
    command?: string;
    nextRequest?: Request;
    taskStatus?: string;
    testCaseId?: string;
    lastResult?: Response;
    logs: (TestCommand | TestResult)[];
    authData: AuthBasic | AuthBearer | AuthKey | AuthNone;
    errorMessage?: string;
}

interface SetOpenAPIEvent {
    openapi: object,
    type: string
}

interface SetCommandEvent {
    command: string,
    type: string
}

interface SetAuthData {
    authData: AuthBasic | AuthBearer | AuthKey | AuthNone;
    type: string;
}



export interface Queries {
    queries: string;
    scenario: string;
}


function extractApiUrl(openapi: any): string | undefined {
    if (openapi && openapi.hasOwnProperty('servers') && Array.isArray(openapi.servers) && openapi.servers.length > 0) {
        const server = openapi.servers[0];
        if (server.hasOwnProperty('url') && typeof server.url === 'string') {
            return server.url;
        }
    }
    return undefined;
}

function makeRequest(apiClient: AxiosInstance, request: Request, authData: any) {
    const path = replacePathParameters(request);
    request.path = path;
    // console.log(`curl -X ${request.method} ${apiClient.getUri()}${path} -d '${JSON.stringify(request.inputs.requestBody)}'`);

    switch (request.method) {
        case 'GET':
            return apiClient.get(path, {
                headers: generateAuthHeaders(authData)
            })
        case 'POST':
            return apiClient.post(path, request.inputs.requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    ...generateAuthHeaders(authData)
                }
            });
        case 'PUT':
            return apiClient.put(path, request.inputs.requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    ...generateAuthHeaders(authData)
                }
            });
        case 'PATCH':
            return apiClient.patch(path, request.inputs.requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    ...generateAuthHeaders(authData)
                }
            });
        case 'DELETE':
            return apiClient.delete(path)

    }
    return Promise.reject('Unsupported method');
}

function replacePathParameters(request: Request): string {
    const pathParameters = request.inputs.pathParameters;
    const queryParameters = request.inputs.queryParameters;
    const pathParams = request.path.match(/{\w+}/g);
    let path: string = request.path;
    if (pathParams) {
        pathParams.forEach((param: string) => {
            const paramName = param.slice(1, -1);
            if (pathParameters.hasOwnProperty(paramName)) {
                path = path.replace(param, pathParameters[paramName]);
                delete pathParameters[paramName];
            }
        });
    }
    if (queryParameters) {
        const queryParams = Object.entries(queryParameters).map(([key, value]) => `${key}=${value}`).join('&');
        path += `?${queryParams}`;
    }
    return path;
}

const assignOpenAPI = assign<TestMachineContext, SetOpenAPIEvent>({
    openapi: (context, event) => event.openapi
});

const assignCommand = assign<TestMachineContext, SetCommandEvent>({
    command: (context, event) => event.command
});

const clearTestLogs = assign<TestMachineContext>({
    logs: (context) => []
});

const assignAuthData = assign<TestMachineContext, SetAuthData>({
    authData: (context, event) => event.authData
});


const getTools = (context: TestMachineContext, event: any) => {
    return new Promise((resolve, reject) => {
        API.ready.then((client: any) => {
            client.post('/prepare', { openapi: context.openapi })
                .then((response: { status: number; data: unknown; }) => {
                    if (response.status === 201) {
                        resolve(response.data);
                    } else {
                        reject(new Error('Request failed'));
                    }
                })
                .catch((error: any) => {
                    reject(error.message);
                });
        });
    });
};

const executeCommand = (context: TestMachineContext, event: any) => {
    return new Promise((resolve, reject) => {
        const payload = (context.taskStatus === undefined) ?
            { apiSpec: context.apiSpec, command: context.command } :
            {
                testCaseId: context.testCaseId, response: context.lastResult
            };
        API.ready.then((client: any) => {
            client.post('/execute', payload)
                .then((response: { status: number; data: any; }) => {
                    if (response.status === 201) {
                        resolve(response.data);
                    } else {
                        reject(response.data);
                    }
                })
                .catch((error: any) => {
                    reject(error);
                });
        });
    });
};

const initExecution = (context: TestMachineContext, event: any) => {
    return new Promise((resolve, reject) => {
        if (context.command) {
            const log: TestCommand = { command: context.command, type: "COMMAND" };
            context.logs.push(log);
        }
        resolve({});
    });
}

const executeRequest = (context: TestMachineContext, event: any) => {
    return new Promise((resolve, reject) => {
        const apiClient = context.apiClient;
        const request = context.nextRequest;
        if (apiClient === undefined) {
            reject("API Url is not defined");
        } else {
            if (request === undefined) {
                reject("Request is not defined");
            }
            else {
                makeRequest(apiClient, request, context.authData)
                    .then((response: AxiosResponse) => {
                        const mappedResponse: Response = {
                            code: response.status,
                            payload: response.data
                        };
                        resolve(mappedResponse);
                    }).catch((error: AxiosError) => {
                        const mappedResponse: Response = {
                            code: error.response?.status || 0,
                            payload: error.response?.data
                        };
                        resolve(mappedResponse);
                    });
            }
        }
    });
};

const processRequest = (context: TestMachineContext, event: any) => {
    return new Promise((resolve, reject) => {
        //todo combine to create log
        if (context.nextRequest && context.lastResult) {
            let log: TestResult = {
                type: "RESULT",
                request: context.nextRequest,
                output: context.lastResult
            };
            context.logs.push(log);
        }
        resolve({ taskStatus: context.taskStatus });
    });
};

const createClient = (context: TestMachineContext, event: any) => {
    return new Promise((resolve, reject) => {
        if (context.baseURL === undefined) {
            const url = extractApiUrl(context.openapi);
            if (url === undefined) {
                reject();
            }
            context.baseURL = url;
        }
        const client = axios.create({
            baseURL: context.baseURL
        })
        resolve(client);
    });
}

const generateAuthHeaders = (authData: AuthBasic | AuthBearer | AuthKey | AuthNone): Record<string, string> => {
    let headers: Record<string, string> = {};

    switch (authData.type) {
        case "none":
            break;
        case "basic":
            headers["Authorization"] = `Basic ${btoa(`${authData.username}:${authData.password}`)}`;
            break;
        case "bearer":
            headers["Authorization"] = `Bearer ${authData.token}`;
            break;
        case "key":
            headers[authData.headerName] = authData.headerValue;
            break;
        default:
            break;
    }

    return headers;
};

const testMachine = createMachine({
    /** @xstate-layout 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-Hc-wvggA */
    id: "TestEngine",
    initial: "init",
    predictableActionArguments: true,
    schema: {
        context: {} as TestMachineContext
    },
    context: {
        openapi: undefined,
        logs: [],
        authData: { type: "none" }
    },
    states: {
        init: {
            on: {
                SET_OPENAPI: {
                    target: "loading",
                    actions: assignOpenAPI
                }
            }
        },

        loading: {
            initial: "getTools",

            states: {
                getTools: {
                    invoke: {
                        id: "getTools",
                        src: getTools,
                        onDone: {
                            target: "createClient",
                            actions: assign({
                                apiSpec: (context, event) => event.data.apiSpec,
                                queries: (context, event) => event.data.queries
                            })
                        },
                        onError: {
                            target: "#TestEngine.error",
                            actions: assign({
                                errorMessage: (context, event) => event.data
                            })
                        }
                    }
                },
                createClient: {

                    invoke: {
                        id: "createClient",
                        src: createClient,
                        onDone: {
                            target: "#TestEngine.ready",
                            actions: assign({
                                apiClient: (context: any, event: { data: any; }) => event.data,
                            })
                        },
                        onError: {
                            target: "getUrl"
                        }
                    }
                },
                getUrl: {
                    on: {
                        SET_URL: {
                            target: "createClient",
                            actions: assign({
                                baseURL: (context: any, event: { url: string }) => event.url
                            })
                        }
                    }
                }
            }
        },
        ready: {
            on: {
                EXECUTE: {
                    target: "executing",
                    actions: assignCommand
                },

                CLEAR: {
                    target: "ready",
                    actions: clearTestLogs
                },

                CONFIGURE_CLIENT: {
                    target: "loading.createClient",
                    actions: assignAuthData
                }
            }
        },

        executing: {
            initial: "initExecution",
            on: {
                FINISH: "ready"
            },
            states: {
                initExecution: {
                    invoke: {
                        id: "initEcecution",
                        src: initExecution,
                        onDone: {
                            target: "fetchRequest"
                        }
                    }
                },
                fetchRequest: {
                    invoke: {
                        id: "execute",
                        src: executeCommand,
                        onDone: {
                            target: "executeRequest",
                            actions: assign({
                                nextRequest: (context, event) => event.data.resource,
                                taskStatus: (context, event) => event.data.taskStatus,
                                testCaseId: (context, event) => event.data.testCaseId
                            })
                        },
                        onError: {
                            target: "end",
                            actions: assign({
                                nextRequest: (context, event) => event.data,
                            })
                        }
                    },
                },
                executeRequest: {
                    invoke: {
                        id: "executeRequest",
                        src: executeRequest,
                        onDone: {
                            target: "processRequest",
                            actions: assign({
                                lastResult: (context, event) => event.data
                            })
                        },
                        onError: {
                            target: "end",
                        }
                    }
                },
                processRequest: {
                    invoke: {
                        id: "processRequest",
                        src: processRequest,
                        onError: {
                            target: "end",
                        },
                        onDone: [
                            { target: "end", cond: (context, event) => context.taskStatus === "COMPLETED" || context.taskStatus === "TERMINATED" },
                            { target: "fetchRequest", cond: (context, event) => context.taskStatus === "IN_PROGRESS" },
                        ]
                    }
                },
                end: {
                    invoke: {
                        src: (context, event) => (callback, onReceive) => {
                            context.taskStatus = undefined;
                            callback('FINISH');
                        },
                    },
                }
            }
        },
        error: {
            on: {
                RETRY: "loading"
            }
        }
    },
    on: {
        RESET: {
            target: "init",
            // @ts-ignore
            actions: assign(ctx => {
                return { openapi: undefined, logs: [], authData: { type: "none" } };
            })
        },
        REFRESH: {
            target: "loading",
            // @ts-ignore
            actions: assign(ctx => {
                return { logs: [] };
            })
        }
    }
});

let service = interpret(testMachine);
service.start();

export function getService() {
    return service;
}

export function setOpenAPI(openapi: object) {
    service.send({ type: "SET_OPENAPI", openapi: openapi });
}

export function retry() {
    service.send({ type: "retry" });
}

export function getState() {
    return service.state.value;
}

export function runExecute(command: string) {
    service.send({ type: "EXECUTE", command });
}

export function reset() {
    service.send({ type: "RESET" });
}

export function getLogs() {
    service.getSnapshot().context.logs
}

export function clearLogs() {
    service.send({ type: "CLEAR" });
}

export function refresh() {
    service.send({ type: "REFRESH" });
}

export function setUrl(url: string) {
    service.send({ type: "SET_URL", url: url });
}

export function setAuthentication(authData: AuthBasic | AuthBearer | AuthKey | AuthNone) {
    service.send({ type: "CONFIGURE_CLIENT", authData: authData });
}

export function getAuthentication(): AuthBasic | AuthBearer | AuthKey | AuthNone {
    return service.getSnapshot().context.authData;
}