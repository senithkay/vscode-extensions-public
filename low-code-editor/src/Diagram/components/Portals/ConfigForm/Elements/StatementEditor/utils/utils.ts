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
import { BinaryExpression, BracedExpression, NumericLiteral, STNode, StringLiteral } from "@ballerina/syntax-tree";

import * as c from "../constants";
import { SuggestionItem } from "../models/definitions";

export function addOperator(model: STNode, operator: SuggestionItem) {
    const expression: any = model;
    if ("typeDescriptor" in expression) {
        expression.typeDescriptor = operator.value;
    } else {
        expression.operator.value = operator.value;
        expression.operator.kind = operator.kind;
    }
}

export function addVariableSuggestion(model: STNode, suggestion: SuggestionItem) {
    const initialKeys = Object.keys(model);
    initialKeys.forEach((key) => {
        delete model[key];
    });
    if (suggestion.kind === "string") {
        Object.assign(model, createStringLiteral(suggestion.value));
    }
}

export function addExpression(model: any, kind: string, value?: any) {
    const initialKeys = Object.keys(model);
    initialKeys.forEach((key) => {
        delete model[key];
    });

    if (kind === c.ARITHMETIC) {
        Object.assign(model, createArithmetic());
    } else if (kind === c.RELATIONAL) {
        Object.assign(model, createRelational());
    } else if (kind === c.EQUALITY) {
        Object.assign(model, createEquality());
    } else if (kind === c.STRING_LITERAL) {
        if (value) {
            Object.assign(model, createStringLiteral(value));
        } else {
            Object.assign(model, createStringLiteral(""));
        }
    } else if (kind === c.NUMERIC_LITERAL) {
        if (value) {
            Object.assign(model, createNumericLiteral(value));
        } else {
            Object.assign(model, createNumericLiteral(""));
        }
    } else {
        // tslint:disable-next-line:no-console
        console.log(`Unsupported kind. (${kind})`);
    }
}

function createArithmetic(): BracedExpression {
    return {
        kind: "BracedExpression",
        source: "",
        closeParen: {
            kind: "CloseParenToken",
            isToken: true,
            value: ")",
            source: "",
        },
        expression: {
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
        },
        openParen: {
            kind: "OpenParenToken",
            isToken: true,
            value: "(",
            source: ""
        }
    };
}

function createRelational(): BinaryExpression {
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

function createEquality(): BinaryExpression {
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
            kind: "TrippleEqualToken",
            isToken: false,
            value: "===",
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

function createStringLiteral(value: string): StringLiteral {
    return {
        "kind": "StringLiteral",
        "literalToken": {
            "kind": "StringLiteralToken",
            "isToken": true,
            "value": value,
            "source": ""
        },
        "source": ""
    };
}

function createNumericLiteral(value: string): NumericLiteral {
    return {
        "kind": "NumericLiteral",
        "literalToken": {
            "kind": "DecimalIntegerLiteralToken",
            "isToken": true,
            "value": value,
            "source": ""
        },
        "source": ""
    };
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

export const OperatorsForExpressionKind: { [key: string]: SuggestionItem[] } = {
    Arithmetic: [
        { value: "+", kind: "PlusToken" },
        { value: "-", kind: "MinusToken" },
        { value: "*", kind: "AsteriskToken" },
        { value: "/", kind: "SlashToken" },
        { value: "%", kind: "PercentToken" }
    ],
    Relational: [
        { value: ">", kind: "GtToken" },
        { value: ">=", kind: "GtEqualToken" },
        { value: "<", kind: "LtToken" },
        { value: "<=", kind: "LtEqualToken" }
    ],
    Equality: [
        { value: "==", kind: "DoubleEqualToken" },
        { value: "!=", kind: "NotEqualToken" },
        { value: "===", kind: "TrippleEqualToken" },
        { value: "!==", kind: "NotDoubleEqualToken" }
    ],
    Logical: [
        { value: "&&", kind: "LogicalAndToken" },
        { value: "||", kind: "LogicalOrToken" }
    ],
    Unary: [
        { value: "+", kind: "PlusToken" },
        { value: "-", kind: "MinusToken" },
        { value: "!", kind: "Unknown" },
        { value: "~", kind: "Unknown" }
    ],
    Shift: [
        { value: "<<", kind: "Unknown" },
        { value: ">>", kind: "Unknown" },
        { value: ">>>", kind: "Unknown" }
    ],
    Range: [
        { value: "...", kind: "Unknown" },
        { value: "..<", kind: "DoubleDotLtToken" }
    ]
}

export const ExpressionSuggestionsByKind: { [key: string]: SuggestionItem[] } = {
    StringLiteral: [],
    NumericLiteral: [],
    Relational: [
        { value: c.ARITHMETIC },
        { value: c.CONDITIONAL },
        { value: c.TYPE_CHECK },
        { value: c.RELATIONAL },
        { value: c.NUMERIC_LITERAL }
    ],
    Arithmetic: [
        { value: c.NUMERIC_LITERAL },
        { value: c.ARITHMETIC },
        { value: c.CONDITIONAL },
        { value: c.STRING_LITERAL }
    ],
    Logical: [
        { value: c.RELATIONAL },
        { value: c.LOGICAL },
        { value: c.CONDITIONAL },
        { value: c.STRING_LITERAL }
    ],
    Conditional: [
        { value: c.STRING_LITERAL },
        { value: c.NUMERIC_LITERAL },
        { value: c.RELATIONAL },
        { value: c.TYPE_CHECK },
        { value: c.CONDITIONAL }
    ],
    Equality: [
        { value: c.ARITHMETIC },
        { value: c.CONDITIONAL },
        { value: c.STRING_LITERAL },
        { value: c.NUMERIC_LITERAL },
        { value: c.STRING_TEMPLATE }
    ],
    DefaultBoolean: [
        { value: c.RELATIONAL },
        { value: c.EQUALITY },
        { value: c.LOGICAL },
        { value: c.STRING_LITERAL },
        { value: c.TYPE_CHECK },
        { value: c.CONDITIONAL },
        { value: c.UNARY }
    ],
    DefaultInteger: [
        { value: c.ARITHMETIC },
        { value: c.NUMERIC_LITERAL },
        { value: c.CONDITIONAL },
        { value: c.UNARY }
    ],
    DefaultString: [
        { value: c.STRING_LITERAL },
        { value: c.CONDITIONAL },
        { value: c.STRING_TEMPLATE },
        { value: c.ARITHMETIC }
    ],
    TypeCheck: [
        { value: c.STRING_LITERAL },
        { value: c.NUMERIC_LITERAL },
        { value: c.CONDITIONAL }
    ],
    Unary: [
        { value: c.NUMERIC_LITERAL },
        { value: c.RELATIONAL },
        { value: c.EQUALITY },
        { value: c.ARITHMETIC }
    ],
    StringTemplate: [
        { value: c.STRING_TEMPLATE },
        { value: c.ARITHMETIC },
        { value: c.CONDITIONAL }
    ]
}

export const DataTypeByExpressionKind: { [key: string]: string[] } = {
    StringLiteral: ["string"],
    NumericLiteral: ["int", "float", "decimal"],
    Arithmetic: ["string", "int", "float", "decimal"],
    BracedExpression: ["string", "int", "float", "decimal"]
}
