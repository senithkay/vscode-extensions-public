/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { BracedExpression, STNode, StringLiteral } from "@wso2-enterprise/syntax-tree";

export const DefaultModelsByKind: { [key: string]: STNode | BracedExpression | StringLiteral } = {
    DefaultArithmetic: {
        "kind": "BracedExpression",
        "source": "",
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
                "kind": "StringLiteral",
                "literalToken": {
                    "kind": "StringLiteralToken",
                    "isToken": true,
                    "value": "expression",
                    "source": "",
                    "position": {
                        "startLine": 4,
                        "startColumn": 11,
                        "endLine": 4,
                        "endColumn": 13
                    }
                },
                "source": "",
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
                "kind": "StringLiteral",
                "literalToken": {
                    "kind": "StringLiteralToken",
                    "isToken": true,
                    "value": "expression",
                    "source": "",
                    "position": {
                        "startLine": 4,
                        "startColumn": 16,
                        "endLine": 4,
                        "endColumn": 18
                    }
                },
                "source": "",
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
            "source": "",
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
    },
    DefaultString: {
        "kind": "StringLiteral",
        "literalToken": {
            "kind": "StringLiteralToken",
            "isToken": true,
            "value": "expression",
            "source": "",
            "position": {
                "startLine": 4,
                "startColumn": 11,
                "endLine": 4,
                "endColumn": 13
            }
        },
        "source": "",
        "position": {
            "startLine": 4,
            "startColumn": 11,
            "endLine": 4,
            "endColumn": 13
        },
        "typeData": {
            "typeSymbol": {
                "typeKind": "string",
                "kind": "TYPE",
                "signature": "string"
            },
            "diagnostics": []
        }
    }
}
