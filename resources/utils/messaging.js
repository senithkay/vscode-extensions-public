class WebViewRPCHandler {

    constructor(methods) {
        this._sequence = 1;
        this._callbacks = {};
        this.methods = methods || [];
        this._onRemoteMessage = this._onRemoteMessage.bind(this);
        window.addEventListener('message', this._onRemoteMessage);
    }

    _onRemoteMessage(evt) {
        const msg = evt.data;
        if (msg.id) {
            const methodName = msg.methodName;
            // this is a request from remote
            const method = this.methods.find(method => method.methodName === methodName);
            if (method) {
                method.handler(msg.arguments)
                    .then((response) => {
                        vscode.postMessage({
                            originId: msg.id,
                            response: JSON.stringify(response)
                        });
                    });
            }
        } else if (msg.originId) {
            // this is a response from remote
            const seqId = msg.originId;
            if (this._callbacks[seqId]) {
                this._callbacks[seqId](JSON.parse(msg.response));
                delete this._callbacks[seqId];
            }
        }
    }

    addMethod(methodName, handler = () => { }) {
        this.methods.push({ methodName, handler });
    }

    invokeRemoteMethod(methodName, args, onReply = () => { }) {
        const msg = {
            id: this._sequence,
            methodName: methodName,
            arguments: args,
        }
        this._callbacks[this._sequence] = onReply;
        vscode.postMessage(msg);
        this._sequence++;
    }

    dispose() {
        window.removeEventListener('message', this._onRemoteMessage);
    }
}

var webViewRPCHandler = new WebViewRPCHandler([]);

var vscode = acquireVsCodeApi();


function getLangClient() {
    return {
        isInitialized: true,
        getProjectAST: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getProjectAST', [params.sourceRoot], (resp) => {
                    logConsole(start, 'getProjectAST');
                    resolve(resp);
                });
            });
        },
        getSyntaxTree: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getSyntaxTree', [params], (resp) => {
                    logConsole(start, 'getSyntaxTree');
                    resolve(resp);
                });
            });
        },
        getCompletion: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getCompletion', [params], (resp) => {
                    logConsole(start, 'getCompletion');
                    resolve(resp);
                });
            });
        },
        getType: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getType', [params], (resp) => {
                    logConsole(start, 'getType');
                    resolve(resp);
                });
            });
        },
        getDiagnostics: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getDiagnostics', [params], (resp) => {
                    logConsole(start, 'getDiagnostics');
                    resolve(resp);
                });
            });
        },
        getEndpoints: () => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getEndpoints', [], (resp) => {
                    logConsole(start, 'getEndpoints');
                    resolve(resp);
                });
            })
        },
        revealRange: (params) => {
            if (params) {
                return new Promise((resolve, _reject) => {
                    const start = new Date();
                    webViewRPCHandler.invokeRemoteMethod(
                        'revealRange',
                        [JSON.stringify(params)],
                        (resp) => {
                            logConsole(start, 'revealRange');
                            resolve(resp);
                        }
                    );
                })
            }
        },
        goToSource: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod(
                    'goToSource',
                    [JSON.stringify(params)],
                    (resp) => {
                        logConsole(start, 'goToSource');
                        resolve(resp);
                    }
                );
            })
        },
        getExamples: () => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getExamples', [], (resp) => {
                    logConsole(start, 'getExamples');
                    resolve(resp.samples);
                });
            })
        },
        getDefinitionPosition: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getDefinitionPosition', [params], (resp) => {
                    logConsole(start, 'getDefinitionPosition');
                    resolve(resp);
                });
            })
        },
        didOpen: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('didOpen', [params], (resp) => {
                    logConsole(start, 'didOpen');
                    resolve(resp);
                });
            })
        },
        registerPublishDiagnostics: () => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('registerPublishDiagnostics', [], (resp) => {
                    logConsole(start, 'registerPublishDiagnostics');
                    resolve(resp);
                });
            })
        },
        didClose: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('didClose', [params], (resp) => {
                    logConsole(start, 'didClose');
                    resolve(resp);
                });
            })
        },
        didChange: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('didChange', [params], (resp) => {
                    logConsole(start, 'didChange');
                    resolve(resp);
                });
            })
        },
        syntaxTreeModify: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('syntaxTreeModify', [params], (resp) => {
                    logConsole(start, 'syntaxTreeModify');
                    resolve(resp);
                });
            })
        },
        getConnectors: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getConnectors', [params], (resp) => {
                    logConsole(start, 'getConnectors');
                    resolve(resp);
                });
            })
        },
        getTriggers: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getTriggers', [params], (resp) => {
                    logConsole(start, 'getTriggers');
                    resolve(resp);
                });
            })
        },
        getConnector: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getConnector', [params], (resp) => {
                    logConsole(start, 'getConnector');
                    resolve(resp);
                });
            })
        },
        getTrigger: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getTrigger', [params], (resp) => {
                    logConsole(start, 'getTrigger');
                    resolve(resp);
                });
            })
        },
        getRecord: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getRecord', [params], (resp) => {
                    logConsole(start, 'getRecord');
                    resolve(resp);
                });
            })
        },
        astModify: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('astModify', [params], (resp) => {
                    logConsole(start, 'astModify');
                    resolve(resp);
                });
            })
        },
        stModify: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('stModify', [params], (resp) => {
                    logConsole(start, 'stModify');
                    resolve(resp);
                });
            })
        },
        triggerModify: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('triggerModify', [params], (resp) => {
                    logConsole(start, 'triggerModify');
                    resolve(resp);
                });
            })
        },
        getDocumentSymbol: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getDocumentSymbol', [params], (resp) => {
                    logConsole(start, 'getDocumentSymbol');
                    resolve(resp);
                });
            })
        },
        close: () => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('close', [], (resp) => {
                    logConsole(start, 'close');
                    resolve(resp);
                });
            })
        },
        getDidOpenParams: () => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getDidOpenParams', [], (resp) => {
                    logConsole(start, 'getDidOpenParams');
                    resolve(resp);
                });
            })
        },
        getSyntaxTreeFileRange: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getSyntaxTreeFileRange', [params], (resp) => {
                    logConsole(start, 'getSyntaxTreeFileRange');
                    resolve(resp);
                });
            })
        },
        convert: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('convert', [params], (resp) => {
                    logConsole(start, 'convert');
                    resolve(resp);
                });
            })
        },
        getSTForSingleStatement: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getSTForSingleStatement', [params], (resp) => {
                    logConsole(start, 'getSTForSingleStatement');
                    resolve(resp);
                });
            })
        },
        getSTForExpression: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getSTForExpression', [params], (resp) => {
                    logConsole(start, 'getSTForExpression');
                    resolve(resp);
                });
            })
        },
        getSTForModuleMembers: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getSTForModuleMembers', [params], (resp) => {
                    logConsole(start, 'getSTForModuleMembers');
                    resolve(resp);
                });
            })
        },
        getRealtimePerformanceData: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getRealtimePerformanceData', [params], (resp) => {
                    logConsole(start, 'getRealtimePerformanceData');
                    resolve(resp);
                });
            })
        },
        getPerformanceGraphData: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getPerformanceGraphData', [params], (resp) => {
                    logConsole(start, 'getPerformanceGraphData');
                    resolve(resp);
                });
            })
        },
        resolveMissingDependencies: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('resolveMissingDependencies', [params], (resp) => {
                    logConsole(start, 'resolveMissingDependencies');
                    resolve(resp);
                });
            })
        },
        getExecutorPositions: (params) => {
            return new Promise((resolve, _reject) => {
                const start = new Date();
                webViewRPCHandler.invokeRemoteMethod('getExecutorPositions', [params], (resp) => {
                    logConsole(start, 'getExecutorPositions');
                    resolve(resp);
                });
            })
        }        
    }
}

function logConsole(start, fnName) {
    const end = new Date();
    console.debug(`Time taken for ${fnName}: ${end - start}ms`);
}
