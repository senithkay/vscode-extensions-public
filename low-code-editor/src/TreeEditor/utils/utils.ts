import {BinaryExpression, STNode} from "@ballerina/syntax-tree";

import * as c from "../constants";
import { Expression } from '../models/definitions';

export interface Operator {
    value: string,
    kind: string
}

export function deleteExpression(model: Expression) { // Need to handle accordingly with ST
    delete model.expressionType;
}

export function addOperator(model: STNode, operator: Operator) {
    const expression: any = model;
    if ("typeDescriptor" in expression) {
        expression.typeDescriptor = operator.value;
    } else {
        expression.operator.value = operator.value;
        expression.operator.kind = operator.kind;
    }
}

export function addExpression(model: STNode, kind: string, value?: any) {
    if (kind === c.ARITHMETIC) {
        Object.assign(model, createArithmetic(value));
    } else if (kind === c.RELATIONAL) {
        Object.assign(model, createRelational(value));
    } else {
        console.log(`Unsupported kind. (${kind})`);
    }
}


function createArithmetic(operator: "*" | "/" | "%" | "+" | "-" | "operator"): BinaryExpression {
    return {
        kind: "BinaryExpression",
        lhsExpr: {
            kind: "NumericLiteral",
            literalToken: {
                kind: "DecimalIntegerLiteralToken",
                isToken: false,
                value: "expression",
                source: ""
            },
            source: ""
        },
        operator: {
            kind: "PlusToken",
            isToken: false,
            value: "+",
            source: ""
        },
        rhsExpr: {
            kind: "NumericLiteral",
            literalToken: {
                kind: "DecimalIntegerLiteralToken",
                isToken: false,
                value: "expression",
                source: ""
            },
            source: ""
        },
        source: ""
    };
}

function createRelational(operator: "*" | "/" | "%" | "+" | "-" | "operator"): BinaryExpression {
    return {
        kind: "BinaryExpression",
        lhsExpr: {
            kind: "NumericLiteral",
            literalToken: {
                kind: "DecimalIntegerLiteralToken",
                isToken: false,
                value: "expression",
                source: ""
            },
            source: ""
        },
        operator: {
            kind: "GtToken",
            isToken: false,
            value: ">",
            source: ""
        },
        rhsExpr: {
            kind: "NumericLiteral",
            literalToken: {
                kind: "DecimalIntegerLiteralToken",
                isToken: false,
                value: "expression",
                source: ""
            },
            source: ""
        },
        source: ""
    };
}

// export const ExpressionSuggestionsByKind : {[key: string]: string[]} = {
//     literal : ["comparison", "logical", "arithmetic"],
//     comparison : ["arithmetic", "conditional", "type-checks"],
//     relational : ["arithmetic", "conditional", "type-checks"],
//     ArithmeticC : ["literal","ArithmeticC", "conditional"],
//     logical : ["conditional"],
//     conditional : ["literal"]
// }

export const ExpressionSuggestionsByKind: { [key: string]: string[] } = {
    Literal: [],
    Relational: [c.ARITHMETIC, c.CONDITIONAL, c.TYPE_CHECK, c.RELATIONAL, c.LITERAL],
    Arithmetic: [c.LITERAL, c.ARITHMETIC, c.CONDITIONAL],
    Logical: [c.RELATIONAL, c.LOGICAL, c.CONDITIONAL, c.LITERAL],
    Conditional: [c.LITERAL, c.RELATIONAL, c.TYPE_CHECK, c.CONDITIONAL],
    Equality: [c.ARITHMETIC, c.CONDITIONAL, c.LITERAL, c.STRING_TEMPLATE,],
    DefaultBoolean: [c.RELATIONAL, c.EQUALITY, c.LOGICAL, c.LITERAL, c.TYPE_CHECK, c.CONDITIONAL, c.UNARY],
    TypeCheck: [c.LITERAL, c.CONDITIONAL   ],
    Unary: [c.LITERAL, c.RELATIONAL, c.EQUALITY, c.ARITHMETIC],
    StringTemplate: [c.STRING_TEMPLATE, c.ARITHMETIC, c.CONDITIONAL]
}

export const ExpressionKindByOperator: { [key: string]: string } = {
    AsteriskToken: c.ARITHMETIC,
    BitwiseAndToken: c.ARITHMETIC,
    BitwiseXorToken: c.ARITHMETIC,
    DoubleDotLtToken: c.ARITHMETIC,
    DoubleEqualToken: c.EQUALITY,
    EllipsisToken: c.ARITHMETIC,
    ElvisToken: c.ARITHMETIC,
    GtEqualToken: c.RELATIONAL,
    GtToken: c.RELATIONAL,
    LogicalAndToken: c.LOGICAL,
    LogicalOrToken: c.LOGICAL,
    LtEqualToken: c.RELATIONAL,
    LtToken: c.RELATIONAL,
    NotDoubleEqualToken: c.EQUALITY,
    NotEqualToken: c.EQUALITY,
    PercentToken: c.ARITHMETIC,
    PipeToken: c.ARITHMETIC,
    PlusToken: c.ARITHMETIC,
    SlashToken: c.ARITHMETIC,
    TrippleEqualToken: c.EQUALITY
}

// export const booleanDefaultModel: Expression = {
//     type: ["boolean"],
//     kind: "DefaultBooleanC"
// }

// export const DefaultModelsByKind: { [key: string]: Expression } = {
//     DefaultBooleanC: booleanDefaultModel
// }

export const DefaultModelsByKind: { [key: string]: BinaryExpression } = {
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


// Since there is no LS backend,we will not be able to find the type
// export const ExpressionSuggestionByType : {[key: string]: string[]}= {
//    "int"  : ["comparison", "logical", "arithmetic","shift-expr","unary-expr"],
//    "float" : ["comparison", "logical", "arithmetic","shift-expr","unary-expr"],
//    "decimal" : ["comparison", "logical", "arithmetic","shift-expr","unary-expr"],
//    "boolean" : ["comparison", "logical", "literal","shift-expr","unary-expr"], // negation
//    "string" : ["string-template", "arithmetic", "literal"]

// }

export const TypesForExpressionKind: { [key: string]: string[] } = {
    TypeCheckC: ["string ", "int ", "float ", "decimal ", "boolean ", "error "]
    // comparison : ["int","decimal","float","string"],
    // literal : ["boolean", "int", "string", "float", "decimal"],
    // arithmetic : ["int","decimal","float","string"]
}

// export const OperatorsForExpressionKind: { [key: string]: string[] } = {
//     ArithmeticC: ["+ ", "- ", "* ", "/ ", "% "],
//     RelationalC: ["> ", ">= ", "< ", "<= "],
//     EqualityC: ["== ", "!= ", "=== ", "!== "],
//     LogicalC: ["&& ", "|| "],
//     UnaryC: ["+ ", "- ", "! ", "~ "],
//     // comparison: [">","<",">=","<=","==","!=","===","!=="],
//     ShiftC: ["<< ", ">> ", ">>> "],
//     RangeC: ["... ", "..< "]
// }

export const OperatorsForExpressionKind: { [key: string]: Operator[] } = {
    Arithmetic: [
        {value: "+", kind: "PlusToken"},
        {value: "-", kind: "MinusToken"},
        {value: "*", kind: "AsteriskToken"},
        {value: "/", kind: "SlashToken"},
        {value: "%", kind: "PercentToken"}
    ],
    Relational: [
        {value: ">", kind: "GtToken"},
        {value: ">=", kind: "GtEqualToken"},
        {value: "<", kind: "LtToken"},
        {value: "<=", kind: "LtEqualToken"}
    ],
    Equality: [
        {value: "==", kind: "DoubleEqualToken"},
        {value: "!=", kind: "NotEqualToken"},
        {value: "===", kind: "TrippleEqualToken"},
        {value: "!==", kind: "NotDoubleEqualToken"}
    ],
    Logical: [
        {value: "&&", kind: "LogicalAndToken"},
        {value: "||", kind: "LogicalOrToken"}
    ],
    Unary: [
        {value: "+", kind: "PlusToken"},
        {value: "-", kind: "MinusToken"},
        {value: "!", kind: "Unknown"},
        {value: "~", kind: "Unknown"}
    ],
    Shift: [
        {value: "<<", kind: "Unknown"},
        {value: ">>", kind: "Unknown"},
        {value: ">>>", kind: "Unknown"}
    ],
    Range: [
        {value: "...", kind: "Unknown"},
        {value: "..<", kind: "DoubleDotLtToken"}
    ]
}
