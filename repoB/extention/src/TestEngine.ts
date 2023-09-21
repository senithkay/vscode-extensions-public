/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { interfaces } from 'mocha';
import { start } from 'repl';
import { actions, createMachine, interpret, State, assign, EventObject } from 'xstate';
import API from './API';
import { error, log } from 'console';


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



export interface TestMachineContext {
    openapi: object | undefined;
    apiClient?: AxiosInstance;
    apiSpec?: any;
    queries?: any;
    command?: string;
    nextRequest?: Request;
    taskStatus?: string;
    testCaseId?: string;
    lastResult?: Response;
    logs: (TestCommand | TestResult)[];
}

interface SetOpenAPIEvent {
    openapi: object,
    type: string
}

interface SetCommandEvent {
    command: string,
    type: string
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

function makeRequest(apiClient: AxiosInstance, request: Request) {
    const path = replacePathParameters(request);
    request.path = path;
    console.log(`curl -X ${request.method} ${apiClient.getUri()}${path} -d '${JSON.stringify(request.inputs.requestBody)}'`);

    switch (request.method) {
        case 'GET':
            return apiClient.get(path)
        case 'POST':
            return apiClient.post(path, request.inputs.requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        case 'PUT':
            return apiClient.put(path, request.inputs.requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        case 'PATCH':
            return apiClient.patch(path, request.inputs.requestBody, {
                headers: {
                    'Content-Type': 'application/json',
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
    openapi: (context, event) => event.openapi,
    apiClient: (context: any, event: { openapi: any; }) => axios.create({
        baseURL: extractApiUrl(event.openapi)
    })
});

const assignCommand = assign<TestMachineContext, SetCommandEvent>({
    command: (context, event) => event.command
});

const clearTestLogs = assign<TestMachineContext>({
    logs: (context) => []
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
                    console.log(error)
                    reject(error);
                });
        });
    });
};

const executeCommand = (context: TestMachineContext, event: any) => {
    console.log("execute command");
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
                        console.log(response);
                        reject(response.data);

                    }
                })
                .catch((error: any) => {
                    console.log(error);
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
    console.log("executeRequest");
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
                makeRequest(apiClient, request)
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


const testMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QBU4BcCiA7KBLLYAdPrmgMQDKGyA+gPIAKGAcgIIMCSA2gAwC6iUAAcA9rFK4RWQSAAeiAIwAWABw9CAVgDMygGwKATDyUHVBgDQgAnogC0BjUsIB2LQ4Cc25wp8H3BgF8Ay1RYTBx8IgAbEQBDCHwoMggpInwANxEAayIYNGQRESjYXgEkEFFxNElpcvkEBRVlQgMtd10VXQ1PEy7LGwQTAxaldzGFHi1dd1UFLSCQ9Gw8AkIY+MSyMAAnbZFtwiEo2LQAM32AW0I8gqKS-hlKiSkZesb3dTdTUZ53ZyUNAZdP1FHNCCpWrolFoeBoJkoAc4FiBQuEVtE4gkcJRqPQmGxOKVHmJnrVQG9nM4VIQtD9DGMeAZWkoQQhbHN3IRJkYNCodBpnFDdMjUctIoRtmB4lYyBgABoYADCAFVkBgieUntUXnVFH5dIRGt0VH8eP9phZrIh3ApORp7bpdKZJgC+SKlhFVpLpTjaIwWOxuA9NSTtWS5IoOloWs52japgZKUpnKygeoumpJr8s41hcEUR70RKpRAZYqADIYVgAJQ1wlDNVeiCMCmcMd+ui0KmcaeUqcd4MMGlh0JNQIU7rCYtWYFkYAAxgBXarYgBiHGYHAoAAk6xUGzryZH9ODph8oQK-lDWbHhvpAbGBVpn7zJ2jxbOF8vNlQ-fjA3uWqNrqDSulyfJuJSkwqBCwJWgg0xtjwKjGkoPA8E6+iBPmoqekQn5LiuUCEKcYBoPOAAW1ZgAAjou6DJKkxBYJkOSEARy5gIBB7hvUzgaIQNr8Sh8aCrSGisvaAm2h8jQKJ2JiCm+074XOhGJCRZGUdRdEMTsewHEcJznNsVwcWgXHBvWVTAUeCBqE4Wa3t0UnQpJCgCe4tJKF0rT2om8w4YWH5qd+ODsaFFk6fRYSMasGTZKpX5RbRMVoNxNmHhGCBAp5uhJm4radFMN7eDSnSGOhPj2r8yl4RFyUaeZYDRXpuz7IcxxnJcDWES1qXoBlpJNjl0IxpSw4Pt2yGstV0Y1X4BgTICPCGHVRbmRpQh7POcCwK1sUpPFLGJYcO17Qd6VWfumW8YgClcmaPy8lS3isvl0ZLRCXlmkY-HYYsU71Zt4XbSIu2wPtA2HUxCVsWDENQ7pYRcAoZTWcNIFTE4Wi8gYMF8rokzXvBOhOGOSjyUCDLnutIWNaD52Q5dWztYZXUmVcCMXdDV3ozdmN2d0TiOk0toaE6riOrNq2OZBuNS8m+h0zObNkNW1DVgAmkNYYjY0xgtG0HRdD0uWss+hovpTbRmp43xBPmWAiBAcAyLh6LErdI32OoyGmMoyFOlM9osvBtjeG2RhtGMS3Js4xgq2kWCkF7gvZcosaaOOvkS5HKisrYTqcgnaETIYgpGCoSdrJiiRp3rIHKO0hqxvJPnG2YhcGgnYz2z47RtPjNfeqWDe2dlRitIQ0JiZe0zDpaAxTG2OimD0-xaAngWA++M6RfXIbeyBiaCa2vLdHMYkInBAxMqv-iUx0iZDInQVAxtB-haR5FUbz49ZXqO4akPYZi4x8vlAmWgLbNC8sODy3YoTKAnO-PeSV1LhWapdABd0cpNHBG3Hotomj6Ekq4TQnQX5UkpuhHeBYP70wwcRbmzN-5H3TvUF6hAOjdFth5R+0D4IwRLsAjsEwzxrVQSpXqYViJgCwBAHBI0mjqDzvAqECcr6zVMHlKCJhjDlwBvQtB7E2ZKKbjMA0-tlCQizDNcOwwTBoRhI0IwHwJbKEdgEIAA */
    id: "TestEngine",
    initial: "init",
    predictableActionArguments: true,
    schema: {
        context: {} as TestMachineContext
    },
    context: {
        openapi: undefined,
        logs: []
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
            invoke: {
                id: "getTools",
                src: getTools,
                onDone: {
                    target: "ready",
                    actions: assign({
                        apiSpec: (context, event) => event.data.apiSpec,
                        queries: (context, event) => event.data.queries
                    })
                },
                onError: {
                    target: "error"
                }
            },
            on: {
                SET_OPENAPI: {
                    target: "loading",
                    actions: assignOpenAPI
                }
            }
        },
        ready: {
            on: {
                EXECUTE: {
                    target: "executing",
                    actions: assignCommand
                },
                SET_OPENAPI: {
                    target: "loading",
                    actions: assignOpenAPI
                },
                CLEAR: {
                    target: "ready",
                    actions: clearTestLogs
                }
            }
        },

        executing: {
            initial: "initExecution",
            on: {
                FINISH: "ready",
                SET_OPENAPI: {
                    target: "loading",
                    actions: assignOpenAPI
                }
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
    }
});

const service = interpret(testMachine);
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
    service.stop();
    service.start();
}

export function getLogs() {
    service.getSnapshot().context.logs
}

export function clearLogs() {
    service.send({ type: "CLEAR" });
}

export function refresh() {
    service.send({ type: "SET_OPENAPI", openapi: service.getSnapshot().context.openapi });
}

