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

import { WebViewMethod, WebViewRPCMessage } from './model';
import { commands, WebviewPanel } from 'vscode';
import { ExtendedLangClient } from 'src/core/extended-language-client';
import { debug } from '..';

const getLangClientMethods = (langClient: ExtendedLangClient): WebViewMethod[] => {
    return [{
        methodName: 'getSyntaxTree',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                const response = langClient.getSyntaxTree(args[0]);
                consoleLog(start, 'getSyntaxTree');
                return response;
            });
        }
    },
    {
        methodName: 'getCompletion',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                const response = langClient.getCompletion(args[0]);
                consoleLog(start, 'getCompletion');
                return response;
            });
        }
    },
    {
        methodName: 'getType',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                const response = langClient.getType(args[0]);
                consoleLog(start, 'getType');
                return response;
            });
        }
    },
    {
        methodName: 'getDiagnostics',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                const response = langClient.getDiagnostics(args[0]);
                consoleLog(start, 'getDiagnostics');
                return response;
            });
        }
    },
    {
        methodName: 'getExamples',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            return langClient.onReady().then(() => {
                const response = langClient.fetchExamples();
                consoleLog(start, 'getExamples');
                return response;
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
            const start = new Date().getTime();
            const response = langClient.registerPublishDiagnostics();
            consoleLog(start, 'registerPublishDiagnostics');
            return response;
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
        methodName: 'getConnectors',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.getConnectors(args[0]);
            consoleLog(start, 'getConnectors');
            return response;
        }
    }, {
        methodName: 'getTriggers',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.getTriggers(args[0]);
            consoleLog(start, 'getTriggers');
            return response;
        }
    }, {
        methodName: 'getConnector',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.getConnector(args[0]);
            consoleLog(start, 'getConnector');
            return response;
        }
    }, {
        methodName: 'getTrigger',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.getTrigger(args[0]);
            consoleLog(start, 'getTrigger');
            return response;
        }
    }, {
        methodName: 'getRecord',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.getRecord(args[0]);
            consoleLog(start, 'getRecord');
            return response;
        }
    }, {
        methodName: 'astModify',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.astModify(args[0]);
            consoleLog(start, 'astModify');
            return response;
        }
    }, {
        methodName: 'stModify',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.stModify(args[0]);
            consoleLog(start, 'stModify');
            return response;
        }
    }, {
        methodName: 'triggerModify',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.triggerModify(args[0]);
            consoleLog(start, 'triggerModify');
            return response;
        }
    }, {
        methodName: 'getDocumentSymbol',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.getDocumentSymbol(args[0]);
            consoleLog(start, 'getDocumentSymbol');
            return response;
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
            const response = langClient.convertJsonToRecord(args[0]);
            consoleLog(start, 'convert');
            return response;
        }
    }, {
        methodName: 'getSTForSingleStatement',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.getSTForSingleStatement(args[0]);
            consoleLog(start, 'getSTForSingleStatement');
            return response;
        }
    }, {
        methodName: 'getSTForExpression',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.getSTForExpression(args[0]);
            consoleLog(start, 'getSTForExpression');
            return response;
        }
    }, {
        methodName: 'getSTForModuleMembers',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.getSTForModuleMembers(args[0]);
            consoleLog(start, 'getSTForModuleMembers');
            return response;
        }
    }, {
        methodName: 'getPerfEndpoints',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.getPerfEndpoints(args[0]);
            consoleLog(start, 'getPerfEndpoints');
            return response;
        }
    }, {
        methodName: 'resolveMissingDependencies',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.resolveMissingDependencies(args[0]);
            consoleLog(start, 'resolveMissingDependencies');
            return response;
        }
    }, {
        methodName: 'getExecutorPositions',
        handler: (args: any[]) => {
            const start = new Date().getTime();
            const response = langClient.getExecutorPositions(args[0]);
            consoleLog(start, 'getExecutorPositions');
            return response;
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

    constructor(public methods: Array<WebViewMethod>, public webViewPanel: WebviewPanel) {
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
        webViewPanel: WebviewPanel,
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
