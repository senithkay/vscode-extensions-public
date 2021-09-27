import {BracedExpression} from "@ballerina/syntax-tree";

// export const DefaultModelsByKind: { [key: string]: BinaryExpression } = {
//     DefaultBoolean: {
//         // "kind": "IfElseStatement",
//         // "ifKeyword": {
//         //     "kind": "IfKeyword",
//         //     "isToken": true,
//         //     "value": "if",
//         //     "source": "",
//         //     "position": {
//         //         "startLine": 4,
//         //         "startColumn": 8,
//         //         "endLine": 4,
//         //         "endColumn": 10
//         //     }
//         // },
//         // "condition": {
//         "kind": "BinaryExpression",
//         "lhsExpr": {
//             "kind": "NumericLiteral",
//             "literalToken": {
//                 "kind": "DecimalIntegerLiteralToken",
//                 "isToken": true,
//                 "value": "20",
//                 "source": "",
//                 "position": {
//                     "startLine": 4,
//                     "startColumn": 11,
//                     "endLine": 4,
//                     "endColumn": 13
//                 }
//             },
//             "source": "20 ",
//             "position": {
//                 "startLine": 4,
//                 "startColumn": 11,
//                 "endLine": 4,
//                 "endColumn": 13
//             },
//             "typeData": {
//                 "typeSymbol": {
//                     "typeKind": "int",
//                     "kind": "TYPE",
//                     "signature": "int"
//                 },
//                 "diagnostics": []
//             }
//         },
//         "operator": {
//             "kind": "PlusToken",
//             "isToken": true,
//             "value": "+",
//             "source": "",
//             "position": {
//                 "startLine": 4,
//                 "startColumn": 14,
//                 "endLine": 4,
//                 "endColumn": 15
//             }
//         },
//         "rhsExpr": {
//             "kind": "NumericLiteral",
//             "literalToken": {
//                 "kind": "DecimalIntegerLiteralToken",
//                 "isToken": true,
//                 "value": "10",
//                 "source": "",
//                 "position": {
//                     "startLine": 4,
//                     "startColumn": 16,
//                     "endLine": 4,
//                     "endColumn": 18
//                 }
//             },
//             "source": "10 ",
//             "position": {
//                 "startLine": 4,
//                 "startColumn": 16,
//                 "endLine": 4,
//                 "endColumn": 18
//             },
//             "typeData": {
//                 "typeSymbol": {
//                     "typeKind": "int",
//                     "kind": "TYPE",
//                     "signature": "int"
//                 },
//                 "diagnostics": []
//             }
//         },
//         "source": "20 + 10 ",
//         "position": {
//             "startLine": 4,
//             "startColumn": 11,
//             "endLine": 4,
//             "endColumn": 18
//         },
//         "typeData": {
//             "typeSymbol": {
//                 "typeKind": "boolean",
//                 "kind": "TYPE",
//                 "signature": "boolean"
//             },
//             "diagnostics": []
//         }
//         // },
//         // "ifBody": {
//         //     "kind": "BlockStatement",
//         //     "openBraceToken": {
//         //         "kind": "OpenBraceToken",
//         //         "isToken": true,
//         //         "value": "{",
//         //         "source": "",
//         //         "position": {
//         //             "startLine": 4,
//         //             "startColumn": 19,
//         //             "endLine": 4,
//         //             "endColumn": 20
//         //         }
//         //     },
//         //     "statements": [],
//         //     "closeBraceToken": {
//         //         "kind": "CloseBraceToken",
//         //         "isToken": true,
//         //         "value": "}",
//         //         "source": "",
//         //         "position": {
//         //             "startLine": 5,
//         //             "startColumn": 8,
//         //             "endLine": 5,
//         //             "endColumn": 9
//         //         }
//         //     },
//         //     "source": "{\n        } ",
//         //     "position": {
//         //         "startLine": 4,
//         //         "startColumn": 19,
//         //         "endLine": 5,
//         //         "endColumn": 9
//         //     },
//         //     "typeData": {
//         //         "diagnostics": []
//         //     }
//         // },
//         // "elseBody": {
//         //     "kind": "ElseBlock",
//         //     "elseKeyword": {
//         //         "kind": "ElseKeyword",
//         //         "isToken": true,
//         //         "value": "else",
//         //         "source": "",
//         //         "position": {
//         //             "startLine": 5,
//         //             "startColumn": 10,
//         //             "endLine": 5,
//         //             "endColumn": 14
//         //         }
//         //     },
//         //     "elseBody": {
//         //         "kind": "BlockStatement",
//         //         "openBraceToken": {
//         //             "kind": "OpenBraceToken",
//         //             "isToken": true,
//         //             "value": "{",
//         //             "source": "",
//         //             "position": {
//         //                 "startLine": 5,
//         //                 "startColumn": 15,
//         //                 "endLine": 5,
//         //                 "endColumn": 16
//         //             }
//         //         },
//         //         "statements": [],
//         //         "closeBraceToken": {
//         //             "kind": "CloseBraceToken",
//         //             "isToken": true,
//         //             "value": "}",
//         //             "source": "",
//         //             "position": {
//         //                 "startLine": 6,
//         //                 "startColumn": 8,
//         //                 "endLine": 6,
//         //                 "endColumn": 9
//         //             }
//         //         },
//         //         "source": "{\n        }\n",
//         //         "position": {
//         //             "startLine": 5,
//         //             "startColumn": 15,
//         //             "endLine": 6,
//         //             "endColumn": 9
//         //         },
//         //         "typeData": {
//         //             "diagnostics": []
//         //         }
//         //     },
//         //     "source": "else {\n        }\n",
//         //     "position": {
//         //         "startLine": 5,
//         //         "startColumn": 10,
//         //         "endLine": 6,
//         //         "endColumn": 9
//         //     },
//         //     "typeData": {
//         //         "diagnostics": []
//         //     }
//         // },
//         // "source": "        if 20 > 10 {\n        } else {\n        }\n",
//         // "position": {
//         //     "startLine": 4,
//         //     "startColumn": 8,
//         //     "endLine": 6,
//         //     "endColumn": 9
//         // },
//         // "typeData": {
//         //     "diagnostics": []
//         // }
//     }
// }


// if (20 > 10) {} else {}
export const DefaultModelsByKind: { [key: string]: BracedExpression } = {
    DefaultBoolean: {
        // "kind": "IfElseStatement",
        // "ifKeyword": {
        //     "kind": "IfKeyword",
        //     "isToken": true,
        //     "value": "if",
        //     "source": "",
        //     "position": {
        //         "startLine": 4,
        //         "startColumn": 8,
        //         "endLine": 4,
        //         "endColumn": 10
        //     }
        // },
        // "condition": {
        "kind": "BracedExpression",
        "source": "(1 == 1) ",
        "closeParen": {
            "kind": "CloseParenToken",
            "isToken": true,
            "value": ")",
            "source": "",
            "position": {
                "startLine": 4,
                "startColumn": 18,
                "endLine": 4,
                "endColumn": 19
            }
        },
        "expression": {
            "kind": "BinaryExpression",
            "lhsExpr": {
                "kind": "NumericLiteral",
                "literalToken": {
                    "kind": "DecimalIntegerLiteralToken",
                    "isToken": true,
                    "value": "20",
                    "source": "",
                    "position": {
                        "startLine": 4,
                        "startColumn": 11,
                        "endLine": 4,
                        "endColumn": 13
                    }
                },
                "source": "20 ",
                "position": {
                    "startLine": 4,
                    "startColumn": 11,
                    "endLine": 4,
                    "endColumn": 13
                },
                "typeData": {
                    "typeSymbol": {
                        "typeKind": "int",
                        "kind": "TYPE",
                        "signature": "int"
                    },
                    "diagnostics": []
                }
            },
            "operator": {
                "kind": "PlusToken",
                "isToken": true,
                "value": "+",
                "source": "",
                "position": {
                    "startLine": 4,
                    "startColumn": 14,
                    "endLine": 4,
                    "endColumn": 15
                }
            },
            "rhsExpr": {
                "kind": "NumericLiteral",
                "literalToken": {
                    "kind": "DecimalIntegerLiteralToken",
                    "isToken": true,
                    "value": "10",
                    "source": "",
                    "position": {
                        "startLine": 4,
                        "startColumn": 16,
                        "endLine": 4,
                        "endColumn": 18
                    }
                },
                "source": "10 ",
                "position": {
                    "startLine": 4,
                    "startColumn": 16,
                    "endLine": 4,
                    "endColumn": 18
                },
                "typeData": {
                    "typeSymbol": {
                        "typeKind": "int",
                        "kind": "TYPE",
                        "signature": "int"
                    },
                    "diagnostics": []
                }
            },
            "source": "20 + 10 ",
            "position": {
                "startLine": 4,
                "startColumn": 11,
                "endLine": 4,
                "endColumn": 18
            },
            "typeData": {
                "typeSymbol": {
                    "typeKind": "boolean",
                    "kind": "TYPE",
                    "signature": "boolean"
                },
                "diagnostics": []
            }
        },
        "openParen": {
            "kind": "OpenParenToken",
            "isToken": true,
            "value": "(",
            "source": "",
            "position": {
                "startLine": 4,
                "startColumn": 11,
                "endLine": 4,
                "endColumn": 12
            }
        }
        // },
        // "ifBody": {
        //     "kind": "BlockStatement",
        //     "openBraceToken": {
        //         "kind": "OpenBraceToken",
        //         "isToken": true,
        //         "value": "{",
        //         "source": "",
        //         "position": {
        //             "startLine": 4,
        //             "startColumn": 19,
        //             "endLine": 4,
        //             "endColumn": 20
        //         }
        //     },
        //     "statements": [],
        //     "closeBraceToken": {
        //         "kind": "CloseBraceToken",
        //         "isToken": true,
        //         "value": "}",
        //         "source": "",
        //         "position": {
        //             "startLine": 5,
        //             "startColumn": 8,
        //             "endLine": 5,
        //             "endColumn": 9
        //         }
        //     },
        //     "source": "{\n        } ",
        //     "position": {
        //         "startLine": 4,
        //         "startColumn": 19,
        //         "endLine": 5,
        //         "endColumn": 9
        //     },
        //     "typeData": {
        //         "diagnostics": []
        //     }
        // },
        // "elseBody": {
        //     "kind": "ElseBlock",
        //     "elseKeyword": {
        //         "kind": "ElseKeyword",
        //         "isToken": true,
        //         "value": "else",
        //         "source": "",
        //         "position": {
        //             "startLine": 5,
        //             "startColumn": 10,
        //             "endLine": 5,
        //             "endColumn": 14
        //         }
        //     },
        //     "elseBody": {
        //         "kind": "BlockStatement",
        //         "openBraceToken": {
        //             "kind": "OpenBraceToken",
        //             "isToken": true,
        //             "value": "{",
        //             "source": "",
        //             "position": {
        //                 "startLine": 5,
        //                 "startColumn": 15,
        //                 "endLine": 5,
        //                 "endColumn": 16
        //             }
        //         },
        //         "statements": [],
        //         "closeBraceToken": {
        //             "kind": "CloseBraceToken",
        //             "isToken": true,
        //             "value": "}",
        //             "source": "",
        //             "position": {
        //                 "startLine": 6,
        //                 "startColumn": 8,
        //                 "endLine": 6,
        //                 "endColumn": 9
        //             }
        //         },
        //         "source": "{\n        }\n",
        //         "position": {
        //             "startLine": 5,
        //             "startColumn": 15,
        //             "endLine": 6,
        //             "endColumn": 9
        //         },
        //         "typeData": {
        //             "diagnostics": []
        //         }
        //     },
        //     "source": "else {\n        }\n",
        //     "position": {
        //         "startLine": 5,
        //         "startColumn": 10,
        //         "endLine": 6,
        //         "endColumn": 9
        //     },
        //     "typeData": {
        //         "diagnostics": []
        //     }
        // },
        // "source": "        if 20 > 10 {\n        } else {\n        }\n",
        // "position": {
        //     "startLine": 4,
        //     "startColumn": 8,
        //     "endLine": 6,
        //     "endColumn": 9
        // },
        // "typeData": {
        //     "diagnostics": []
        // }
    }
}
