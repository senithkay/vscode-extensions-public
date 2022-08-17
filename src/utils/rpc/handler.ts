/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import { deflateSync } from "zlib";

import { WebViewMethod, WebViewRPCMessage } from './model';
import { commands, WebviewPanel, WebviewView } from 'vscode';
import { ExtendedLangClient } from 'src/core/extended-language-client';
import { debug } from '..';

const getLangClientMethods = (langClient: ExtendedLangClient): WebViewMethod[] => {
    return [{
        methodName: 'getSyntaxTree',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                return langClient.getSyntaxTree(args[0]).then((result) => {
                    consoleLog(start, 'getSyntaxTree');
                    const zippedResult = deflateSync(Buffer.from(JSON.stringify(result)));
                    return Promise.resolve(zippedResult);
                });
            });
        }
    },
    {
        methodName: 'getCompletion',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                return langClient.getCompletion(args[0]).then(result => {
                    consoleLog(start, 'getCompletion');
                    return Promise.resolve(result);
                });
            });
        }
    },
    {
        methodName: 'getType',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                return langClient.getType(args[0]).then(result => {
                    consoleLog(start, 'getType');
                    return Promise.resolve(result);
                });
            });
        }
    },
    {
        methodName: 'getDiagnostics',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                return langClient.getDiagnostics(args[0]).then(result => {
                    consoleLog(start, 'getDiagnostics');
                    return Promise.resolve(result);
                });
            });
        }
    },
    {
        methodName: 'getExamples',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                return langClient.fetchExamples().then(result => {
                    consoleLog(start, 'getExamples');
                    return Promise.resolve(result);
                });
            });
        }
    },
    {
        methodName: 'didOpen',
        handler: (args: any[]) => {
            langClient.didOpen(args[0]);
        }
    }, {
        methodName: 'registerPublishDiagnostics',
        handler: () => {
            langClient.registerPublishDiagnostics();
        }
    }, {
        methodName: 'didClose',
        handler: (args: any[]) => {
            langClient.didClose(args[0]);
        }
    }, {
        methodName: 'didChange',
        handler: (args: any[]) => {
            langClient.didChange(args[0]);
        }
    }, {
        methodName: 'definition',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.definition(args[0]).then(result => {
                consoleLog(start, 'definition');
                return Promise.resolve(result);
            });
        }
    }, {
        methodName: 'getConnectors',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.getConnectors(args[0]).then(result => {
                consoleLog(start, 'getConnectors');
                return Promise.resolve(result);
            });
        }
    }, {
        methodName: 'getTriggers',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.getTriggers(args[0]).then(result => {
                consoleLog(start, 'getTriggers');
                return Promise.resolve(result);
            });
        }
    }, {
        methodName: 'getConnector',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.getConnector(args[0]).then(result => {
                consoleLog(start, 'getConnector');
                return Promise.resolve(result);
            });
        }
    }, {
        methodName: 'getTrigger',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.getTrigger(args[0]).then(result => {
                consoleLog(start, 'getTrigger');
                return Promise.resolve(result);
            });
        }
    }, {
        methodName: 'getRecord',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.getRecord(args[0]).then(result => {
                consoleLog(start, 'getRecord');
                return Promise.resolve(result);
            });
        }
    }, {
        methodName: 'astModify',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.astModify(args[0]).then(result => {
                consoleLog(start, 'astModify');
                return Promise.resolve(result);
            });
        }
    }, {
        methodName: 'stModify',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.stModify(args[0]).then(result => {
                consoleLog(start, 'stModify');
                const zippedResult = deflateSync(Buffer.from(JSON.stringify(result)));
                return Promise.resolve(zippedResult);
            });
        }
    }, {
        methodName: 'triggerModify',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.triggerModify(args[0]).then(result => {
                consoleLog(start, 'triggerModify');
                return Promise.resolve(result);
            });
        }
    }, {
        methodName: 'getDocumentSymbol',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.getDocumentSymbol(args[0]).then(result => {
                consoleLog(start, 'getDocumentSymbol');
                return Promise.resolve(result);
            });
        }
    }, {
        methodName: 'close',
        handler: () => {
            langClient.close();
        }
    }, {
        methodName: 'getDidOpenParams',
        handler: () => {
            const start = new Date().getTime();
            const response = langClient.getDidOpenParams();
            consoleLog(start, 'getDidOpenParams');
            return response;
        }
    }, {
        methodName: 'convert',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.convertJsonToRecord(args[0]).then(result => {
                consoleLog(start, 'convert');
                return result;
            });
        }
    }, {
        methodName: 'getSTForSingleStatement',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.getSTForSingleStatement(args[0]).then(result => {
                consoleLog(start, 'getSTForSingleStatement');
                return result;
            });
        }
    }, {
        methodName: 'getSTForExpression',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.getSTForExpression(args[0]).then(result => {
                consoleLog(start, 'getSTForExpression');
                return result;
            });
        }
    }, {
        methodName: 'getSTForModuleMembers',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.getSTForModuleMembers(args[0]).then(result => {
                consoleLog(start, 'getSTForModuleMembers');
                return result;
            });
        }
    }, {
        methodName: 'getSTForModulePart',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.getSTForModulePart(args[0]).then(result => {
                consoleLog(start, 'getSTForModulePart');
                return result;
            });
        }
    }, {
        methodName: 'getSTForResource',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.getSTForResource(args[0]).then(result => {
                consoleLog(start, 'getSTForResource');
                return result;
            });
        }
    }, {
        methodName: 'getPerfEndpoints',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.getResourcesWithEndpoints(args[0]);
            consoleLog(start, 'getPerfEndpoints');
            return response;
        }
    }, {
        methodName: 'resolveMissingDependencies',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.resolveMissingDependencies(args[0]).then(result => {
                consoleLog(start, 'resolveMissingDependencies');
                return result;
            });
        }
    }, {
        methodName: 'getExecutorPositions',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.getExecutorPositions(args[0]).then(result => {
                consoleLog(start, 'getExecutorPositions');
                return result;
            });
        }
    }, {
        methodName: 'getNotebookVariables',
        handler: () => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                return langClient.getNotebookVariables().then(result => {
                    consoleLog(start, 'getNotebookVariables');
                    return Promise.resolve(result);
                });
            });
        }
    }, {
        methodName: 'getSymbolDocumentation',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                return langClient.getSymbolDocumentation(args[0]).then(result => {
                    consoleLog(start, 'getSymbolDocumentation');
                    return Promise.resolve(result);
                });
            });
        }
    }, {
        methodName: 'codeAction',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.codeAction(args[0]).then(result => {
                consoleLog(start, 'codeAction');
                return result;
            });
        }
    }, {
        methodName: 'getTypeFromExpression',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                return langClient.getTypeFromExpression(args[0]).then(result => {
                    consoleLog(start, 'getTypeFromExpression');
                    return Promise.resolve(result);
                });
            });
        }
    }, {
        methodName: 'getTypeFromSymbol',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                return langClient.getTypeFromSymbol(args[0]).then(result => {
                    consoleLog(start, 'getTypeFromSymbol');
                    return Promise.resolve(result);
                });
            });
        }
    }
    ];
};

const undoRedoMethods = [{
    methodName: 'undo',
    handler: (args: any[]) => {
        commands.executeCommand('workbench.action.focusPreviousGroup')
            .then(() => {
                commands.executeCommand('undo');
            });
    }
},
{
    methodName: 'redo',
    handler: (args: any[]) => {
        commands.executeCommand('workbench.action.focusPreviousGroup')
            .then(() => {
                commands.executeCommand('redo');
            });

    }
}
];

function consoleLog(start, fnName) {
    const end = new Date().getTime();
    debug(`Backend - Time taken for ${fnName}: ${end - start}ms`);
}

export class WebViewRPCHandler {

    private _sequence: number = 1;
    private _callbacks: Map<number, Function> = new Map();

    constructor(public methods: Array<WebViewMethod>, public webViewPanel: WebviewPanel | WebviewView) {
        webViewPanel.webview.onDidReceiveMessage(this._onRemoteMessage.bind(this));
        this.webViewPanel = webViewPanel;
    }

    private _getMethod(methodName: string) {
        return this.methods.find(method => (method.methodName === methodName));
    }

    private _onRemoteMessage(msg: WebViewRPCMessage) {
        if (msg.id !== undefined) {
            // this is a request from remote
            const method = this._getMethod(msg.methodName);
            if (method) {
                const handler = method.handler(msg.arguments || [], this.webViewPanel);
                if (!handler) {
                    return;
                }
                handler.then((response: Thenable<any>) => {
                    this.webViewPanel.webview.postMessage({
                        originId: msg.id,
                        response: JSON.stringify(response)
                    });
                });
            }
        } else if (msg.originId !== undefined) {
            // this is a response from remote to one of our requests
            const callback = this._callbacks.get(msg.originId);
            if (callback) {
                callback(JSON.parse(msg.response));
                this._callbacks.delete(msg.originId);
            }
        }
    }

    invokeRemoteMethod(methodName: string, args: any[] = [], callback: Function) {
        const msg = {
            id: this._sequence,
            methodName,
            arguments: args,
        };
        this._callbacks.set(this._sequence, callback);
        this.webViewPanel.webview.postMessage(msg);
        this._sequence++;
    }

    static create(
        webViewPanel: WebviewPanel | WebviewView,
        langClient: ExtendedLangClient,
        methods: Array<WebViewMethod> = [])
        : WebViewRPCHandler {
        return new WebViewRPCHandler(
            [...methods, ...getLangClientMethods(langClient), ...undoRedoMethods],
            webViewPanel);
    }

    dispose() {
        // TODO unregister event handlers
    }
}
