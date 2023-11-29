import { FunctionDefinition } from "@wso2-enterprise/syntax-tree";

export const fnST: FunctionDefinition = {
    "kind": "FunctionDefinition",
    "qualifierList": [],
    "functionKeyword": {
        "kind": "FunctionKeyword",
        "isToken": true,
        "value": "function",
        "source": "function",
        "syntaxDiagnostics": [],
        "isMissing": false,
        "position": {
            "startLine": 18,
            "startColumn": 0,
            "endLine": 18,
            "endColumn": 8
        },
        "leadingMinutiae": [
            {
                "kind": "END_OF_LINE_MINUTIAE",
                "minutiae": "\n",
                "isInvalid": false,
            }
        ],
        "trailingMinutiae": [
            {
                "kind": "WHITESPACE_MINUTIAE",
                "minutiae": " ",
                "isInvalid": false,
                
            }
        ],
    },
    "functionName": {
        "kind": "IdentifierToken",
        "isToken": true,
        "value": "transform",
        "source": "transform",
        "syntaxDiagnostics": [],
        "isMissing": false,
        "position": {
            "startLine": 18,
            "startColumn": 9,
            "endLine": 18,
            "endColumn": 18
        },
        "leadingMinutiae": [],
        "trailingMinutiae": [],
    },
    "relativeResourcePath": [],
    "functionSignature": {
        "kind": "FunctionSignature",
        "openParenToken": {
            "kind": "OpenParenToken",
            "isToken": true,
            "value": "(",
            "source": "(",
            "syntaxDiagnostics": [],
            "isMissing": false,
            "position": {
                "startLine": 18,
                "startColumn": 18,
                "endLine": 18,
                "endColumn": 19
            },
            "leadingMinutiae": [],
            "trailingMinutiae": [],
        },
        "parameters": [
            {
                "kind": "RequiredParam",
                "annotations": [],
                "typeName": {
                    "kind": "SimpleNameReference",
                    "name": {
                        "kind": "IdentifierToken",
                        "isToken": true,
                        "value": "E",
                        "source": "E",
                        "syntaxDiagnostics": [],
                        "isMissing": false,
                        "position": {
                            "startLine": 18,
                            "startColumn": 19,
                            "endLine": 18,
                            "endColumn": 20
                        },
                        "leadingMinutiae": [],
                        "trailingMinutiae": [
                            {
                                "kind": "WHITESPACE_MINUTIAE",
                                "minutiae": " ",
                                "isInvalid": false,
                            }
                        ],
                    },
                    "source": "E ",
                    "syntaxDiagnostics": [],
                    "leadingMinutiae": [],
                    "trailingMinutiae": [
                        {
                            "kind": "WHITESPACE_MINUTIAE",
                            "minutiae": " ",
                            "isInvalid": false,
                        }
                    ],
                    "position": {
                        "startLine": 18,
                        "startColumn": 19,
                        "endLine": 18,
                        "endColumn": 20
                    },
                    "typeData": {
                        "typeSymbol": {
                            "name": "E",
                            "moduleID": {
                                "orgName": "madusha",
                                "packageName": "sample",
                                "moduleName": "sample",
                                "version": "0.1.0"
                            },
                            "definition": {
                                "deprecated": false,
                                "moduleID": {
                                    "orgName": "madusha",
                                    "packageName": "sample",
                                    "moduleName": "sample",
                                    "version": "0.1.0"
                                },
                                "kind": "TYPE_DEFINITION",
                                "readonly": false,
                                "moduleQualifiedName": "sample:E"
                            },
                            "kind": "TYPE",
                            "typeKind": "typeReference",
                            "signature": "madusha/sample:0.1.0:E"
                        },
                        "symbol": {
                            "name": "E",
                            "moduleID": {
                                "orgName": "madusha",
                                "packageName": "sample",
                                "moduleName": "sample",
                                "version": "0.1.0"
                            },
                            "definition": {
                                "deprecated": false,
                                "moduleID": {
                                    "orgName": "madusha",
                                    "packageName": "sample",
                                    "moduleName": "sample",
                                    "version": "0.1.0"
                                },
                                "kind": "TYPE_DEFINITION",
                                "readonly": false,
                                "moduleQualifiedName": "sample:E"
                            },
                            "kind": "TYPE",
                            "typeKind": "typeReference",
                            "signature": "madusha/sample:0.1.0:E"
                        },
                        "diagnostics": []
                    }
                },
                "paramName": {
                    "kind": "IdentifierToken",
                    "isToken": true,
                    "value": "e",
                    "source": "e",
                    "syntaxDiagnostics": [],
                    "isMissing": false,
                    "position": {
                        "startLine": 18,
                        "startColumn": 21,
                        "endLine": 18,
                        "endColumn": 22
                    },
                    "leadingMinutiae": [],
                    "trailingMinutiae": [],
                },
                "source": "E e",
                "syntaxDiagnostics": [],
                "leadingMinutiae": [],
                "trailingMinutiae": [],
                "position": {
                    "startLine": 18,
                    "startColumn": 19,
                    "endLine": 18,
                    "endColumn": 22
                },
                "typeData": {
                    "typeSymbol": {
                        "name": "E",
                        "moduleID": {
                            "orgName": "madusha",
                            "packageName": "sample",
                            "moduleName": "sample",
                            "version": "0.1.0"
                        },
                        "definition": {
                            "deprecated": false,
                            "moduleID": {
                                "orgName": "madusha",
                                "packageName": "sample",
                                "moduleName": "sample",
                                "version": "0.1.0"
                            },
                            "kind": "TYPE_DEFINITION",
                            "readonly": false,
                            "moduleQualifiedName": "sample:E"
                        },
                        "kind": "TYPE",
                        "typeKind": "typeReference",
                        "signature": "madusha/sample:0.1.0:E"
                    },
                    "symbol": {
                        "moduleID": {
                            "orgName": "madusha",
                            "packageName": "sample",
                            "moduleName": "sample",
                            "version": "0.1.0"
                        },
                        "kind": "PARAMETER",
                        "signature": "madusha/sample:0.1.0:E e"
                    },
                    "diagnostics": []
                },
            }
        ],
        "closeParenToken": {
            "kind": "CloseParenToken",
            "isToken": true,
            "value": ")",
            "source": ")",
            "syntaxDiagnostics": [],
            "isMissing": false,
            "position": {
                "startLine": 18,
                "startColumn": 22,
                "endLine": 18,
                "endColumn": 23
            },
            "leadingMinutiae": [],
            "trailingMinutiae": [
                {
                    "kind": "WHITESPACE_MINUTIAE",
                    "minutiae": " ",
                    "isInvalid": false,
                }
            ],
        },
        "returnTypeDesc": {
            "kind": "ReturnTypeDescriptor",
            "returnsKeyword": {
                "kind": "ReturnsKeyword",
                "isToken": true,
                "value": "returns",
                "source": "returns",
                "syntaxDiagnostics": [],
                "isMissing": false,
                "position": {
                    "startLine": 18,
                    "startColumn": 24,
                    "endLine": 18,
                    "endColumn": 31
                },
                "leadingMinutiae": [],
                "trailingMinutiae": [
                    {
                        "kind": "WHITESPACE_MINUTIAE",
                        "minutiae": " ",
                        "isInvalid": false,
                    }
                ],
            },
            "annotations": [],
            "type": {
                "kind": "SimpleNameReference",
                "name": {
                    "kind": "IdentifierToken",
                    "isToken": true,
                    "value": "R",
                    "source": "R",
                    "syntaxDiagnostics": [],
                    "isMissing": false,
                    "position": {
                        "startLine": 18,
                        "startColumn": 32,
                        "endLine": 18,
                        "endColumn": 33
                    },
                    "leadingMinutiae": [],
                    "trailingMinutiae": [
                        {
                            "kind": "WHITESPACE_MINUTIAE",
                            "minutiae": " ",
                            "isInvalid": false,
                        }
                    ],
                },
                "source": "R ",
                "syntaxDiagnostics": [],
                "leadingMinutiae": [],
                "trailingMinutiae": [
                    {
                        "kind": "WHITESPACE_MINUTIAE",
                        "minutiae": " ",
                        "isInvalid": false,
                    }
                ],
                "position": {
                    "startLine": 18,
                    "startColumn": 32,
                    "endLine": 18,
                    "endColumn": 33
                },
                "typeData": {
                    "typeSymbol": {
                        "name": "R",
                        "moduleID": {
                            "orgName": "madusha",
                            "packageName": "sample",
                            "moduleName": "sample",
                            "version": "0.1.0"
                        },
                        "definition": {
                            "deprecated": false,
                            "moduleID": {
                                "orgName": "madusha",
                                "packageName": "sample",
                                "moduleName": "sample",
                                "version": "0.1.0"
                            },
                            "kind": "TYPE_DEFINITION",
                            "readonly": false,
                            "moduleQualifiedName": "sample:R"
                        },
                        "kind": "TYPE",
                        "typeKind": "typeReference",
                        "signature": "madusha/sample:0.1.0:R"
                    },
                    "symbol": {
                        "name": "R",
                        "moduleID": {
                            "orgName": "madusha",
                            "packageName": "sample",
                            "moduleName": "sample",
                            "version": "0.1.0"
                        },
                        "definition": {
                            "deprecated": false,
                            "moduleID": {
                                "orgName": "madusha",
                                "packageName": "sample",
                                "moduleName": "sample",
                                "version": "0.1.0"
                            },
                            "kind": "TYPE_DEFINITION",
                            "readonly": false,
                            "moduleQualifiedName": "sample:R"
                        },
                        "kind": "TYPE",
                        "typeKind": "typeReference",
                        "signature": "madusha/sample:0.1.0:R"
                    },
                    "diagnostics": []
                },
            },
            "source": "returns R ",
            "syntaxDiagnostics": [],
            "leadingMinutiae": [],
            "trailingMinutiae": [
                {
                    "kind": "WHITESPACE_MINUTIAE",
                    "minutiae": " ",
                    "isInvalid": false,
                }
            ],
            "position": {
                "startLine": 18,
                "startColumn": 24,
                "endLine": 18,
                "endColumn": 33
            },
            "typeData": {
                "diagnostics": []
            },
        },
        "source": "(E e) returns R ",
        "syntaxDiagnostics": [],
        "leadingMinutiae": [],
        "trailingMinutiae": [
            {
                "kind": "WHITESPACE_MINUTIAE",
                "minutiae": " ",
                "isInvalid": false,
            }
        ],
        "position": {
            "startLine": 18,
            "startColumn": 18,
            "endLine": 18,
            "endColumn": 33
        },
        "typeData": {
            "diagnostics": []
        },
    },
    "functionBody": {
        "kind": "ExpressionFunctionBody",
        "rightDoubleArrow": {
            "kind": "RightDoubleArrowToken",
            "isToken": true,
            "value": "=>",
            "source": "=>",
            "syntaxDiagnostics": [],
            "isMissing": false,
            "position": {
                "startLine": 18,
                "startColumn": 34,
                "endLine": 18,
                "endColumn": 36
            },
            "leadingMinutiae": [],
            "trailingMinutiae": [
                {
                    "kind": "WHITESPACE_MINUTIAE",
                    "minutiae": " ",
                    "isInvalid": false,
                }
            ],
        },
        "expression": {
            "kind": "MappingConstructor",
            "openBrace": {
                "kind": "OpenBraceToken",
                "isToken": true,
                "value": "{",
                "source": "{",
                "syntaxDiagnostics": [],
                "isMissing": false,
                "position": {
                    "startLine": 18,
                    "startColumn": 37,
                    "endLine": 18,
                    "endColumn": 38
                },
                "leadingMinutiae": [],
                "trailingMinutiae": [
                    {
                        "kind": "END_OF_LINE_MINUTIAE",
                        "minutiae": "\n",
                        "isInvalid": false,
                    }
                ],
            },
            "fields": [],
            "closeBrace": {
                "kind": "CloseBraceToken",
                "isToken": true,
                "value": "}",
                "source": "}",
                "syntaxDiagnostics": [],
                "isMissing": false,
                "position": {
                    "startLine": 20,
                    "startColumn": 0,
                    "endLine": 20,
                    "endColumn": 1
                },
                "leadingMinutiae": [
                    {
                        "kind": "END_OF_LINE_MINUTIAE",
                        "minutiae": "\n",
                        "isInvalid": false,
                    }
                ],
                "trailingMinutiae": [],
            },
            "source": "{\n\n}",
            "syntaxDiagnostics": [],
            "leadingMinutiae": [],
            "trailingMinutiae": [],
            "position": {
                "startLine": 18,
                "startColumn": 37,
                "endLine": 20,
                "endColumn": 1
            },
            "typeData": {
                "typeSymbol": {
                    "kind": "TYPE",
                    "typeKind": "CompilationError",
                    "signature": "$CompilationError$"
                },
                "diagnostics": [
                    {
                        "message": "missing non-defaultable required record field 'a'",
                        "diagnosticInfo": {
                            "code": "BCE2520",
                            "severity": "ERROR"
                        }
                    }
                ]
            },
        },
        "semicolon": {
            "kind": "SemicolonToken",
            "isToken": true,
            "value": ";",
            "source": ";",
            "syntaxDiagnostics": [],
            "isMissing": false,
            "position": {
                "startLine": 20,
                "startColumn": 1,
                "endLine": 20,
                "endColumn": 2
            },
            "leadingMinutiae": [],
            "trailingMinutiae": [
                {
                    "kind": "END_OF_LINE_MINUTIAE",
                    "minutiae": "\n",
                    "isInvalid": false,
                }
            ],
        },
        "source": "=> {\n\n};\n",
        "syntaxDiagnostics": [],
        "leadingMinutiae": [],
        "trailingMinutiae": [
            {
                "kind": "END_OF_LINE_MINUTIAE",
                "minutiae": "\n",
                "isInvalid": false,
            }
        ],
        "position": {
            "startLine": 18,
            "startColumn": 34,
            "endLine": 20,
            "endColumn": 2
        },
        "typeData": {
            "diagnostics": [
                {
                    "message": "missing non-defaultable required record field 'a'",
                    "diagnosticInfo": {
                        "code": "BCE2520",
                        "severity": "ERROR"
                    }
                }
            ]
        },
    },
    "source": "\nfunction transform(E e) returns R => {\n\n};\n",
    "syntaxDiagnostics": [],
    "leadingMinutiae": [
        {
            "kind": "END_OF_LINE_MINUTIAE",
            "minutiae": "\n",
            "isInvalid": false,
        }
    ],
    "trailingMinutiae": [
        {
            "kind": "END_OF_LINE_MINUTIAE",
            "minutiae": "\n",
            "isInvalid": false,
        }
    ],
    "position": {
        "startLine": 18,
        "startColumn": 0,
        "endLine": 20,
        "endColumn": 2
    },
    "typeData": {
        "symbol": {
            "deprecated": false,
            "moduleID": {
                "orgName": "madusha",
                "packageName": "sample",
                "moduleName": "sample",
                "version": "0.1.0"
            },
            "kind": "FUNCTION",
            "external": false
        },
        "diagnostics": [
            {
                "message": "missing non-defaultable required record field 'a'",
                "diagnosticInfo": {
                    "code": "BCE2520",
                    "severity": "ERROR"
                }
            }
        ]
    },
};
