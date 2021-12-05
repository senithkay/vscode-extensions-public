import {
    InitializeParams, DidOpenTextDocumentParams, ClientCapabilities
} from 'vscode-languageserver-protocol';
import * as fs from 'fs';



const capabilities: ClientCapabilities = {
    workspace: {
        applyEdit: true,
        workspaceEdit: {
            documentChanges: true,
            resourceOperations: [
                "create",
                "rename",
                "delete"
            ],
            failureHandling: "textOnlyTransactional"
        },
        didChangeConfiguration: {
            dynamicRegistration: true
        },
        didChangeWatchedFiles: {
            dynamicRegistration: true
        },
        symbol: {
            dynamicRegistration: true,
            symbolKind: {
                valueSet: [
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23,
                    24,
                    25,
                    26
                ]
            }
        },
        executeCommand: {
            dynamicRegistration: true
        },
        configuration: true,
        workspaceFolders: true
    },
    textDocument: {
        "moniker": {},
        "publishDiagnostics": {
            "relatedInformation": true,
            "versionSupport": false,
            "tagSupport": {
                "valueSet": [
                    1,
                    2
                ]
            },
        },
        "synchronization": {
            "dynamicRegistration": true,
            "willSave": true,
            "willSaveWaitUntil": true,
            "didSave": true
        },
        "completion": {
            "dynamicRegistration": true,
            "contextSupport": true,
            "completionItem": {
                "snippetSupport": true,
                "commitCharactersSupport": true,
                "documentationFormat": [
                    "markdown",
                    "plaintext"
                ],
                "deprecatedSupport": true,
                "preselectSupport": true,
                "tagSupport": {
                    "valueSet": [
                        1
                    ]
                },
            },
            "completionItemKind": {
                "valueSet": [
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23,
                    24,
                    25
                ]
            }
        },
        "hover": {
            "dynamicRegistration": true,
            "contentFormat": [
                "markdown",
                "plaintext"
            ]
        },
        "signatureHelp": {
            "dynamicRegistration": true,
            "signatureInformation": {
                "documentationFormat": [
                    "markdown",
                    "plaintext"
                ],
                "parameterInformation": {
                    "labelOffsetSupport": true
                },
            },
            "contextSupport": true
        },
        "definition": {
            "dynamicRegistration": true,
            "linkSupport": true
        },
        "references": {
            "dynamicRegistration": true
        },
        "documentHighlight": {
            "dynamicRegistration": true
        },
        "documentSymbol": {
            "dynamicRegistration": true,
            "symbolKind": {
                "valueSet": [
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23,
                    24,
                    25,
                    26
                ]
            },
            "hierarchicalDocumentSymbolSupport": true,

        },
        "codeAction": {
            "dynamicRegistration": true,
            "isPreferredSupport": true,
            "codeActionLiteralSupport": {
                "codeActionKind": {
                    "valueSet": [
                        "",
                        "quickfix",
                        "refactor",
                        "refactor.extract",
                        "refactor.inline",
                        "refactor.rewrite",
                        "source",
                        "source.organizeImports"
                    ]
                }
            },
        },
        "codeLens": {
            "dynamicRegistration": true
        },
        "formatting": {
            "dynamicRegistration": true
        },
        "rangeFormatting": {
            "dynamicRegistration": true
        },
        "onTypeFormatting": {
            "dynamicRegistration": true
        },
        "rename": {
            "dynamicRegistration": true,
            "prepareSupport": true,
        },
        "documentLink": {
            "dynamicRegistration": true,
            "tooltipSupport": true
        },
        "typeDefinition": {
            "dynamicRegistration": true,
            "linkSupport": true
        },
        "implementation": {
            "dynamicRegistration": true,
            "linkSupport": true
        },
        "colorProvider": {
            "dynamicRegistration": true
        },
        "foldingRange": {
            "dynamicRegistration": true,
            "rangeLimit": 5000,
            "lineFoldingOnly": true
        },
        "declaration": {
            "dynamicRegistration": true,
            "linkSupport": true
        },
        "selectionRange": {
            "dynamicRegistration": true
        }
    },
    window: {
        "workDoneProgress": true
    },
};



export function initializeRequest(processId: number): InitializeParams {
    return {
        processId,
        capabilities,
        // We always initilize with empty workspace
        rootUri: null,
        workspaceFolders: null
    };
}

export function didOpenTextDocumentParams(path: string): DidOpenTextDocumentParams {
    const data: string = fs.readFileSync(path, 'utf8')
    return {
        textDocument: {
            uri: file(path),
            languageId: 'ballerina',
            version: 1,
            text: data
        }
    };
}


export function file(path: string): string {
    return "file://" + path;
}
