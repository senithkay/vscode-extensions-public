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
import * as c from "../constants";
import { SuggestionItem } from "../models/definitions";

export function generateExpressionTemplate (kind: string, value?: any) {
    if (kind === c.ARITHMETIC) {
        return "(EXPRESSION + EXPRESSION)";
    } else if (kind === c.RELATIONAL) {
        return "(EXPRESSION > EXPRESSION)";
    } else if (kind === c.EQUALITY) {
        return "(EXPRESSION === EXPRESSION)";
    } else if (kind === c.LOGICAL) {
        return "(EXPRESSION && EXPRESSION)";
    } else if (kind === c.CONDITIONAL) {
        return "(EXPRESSION ? EXPRESSION : EXPRESSION)";
    } else if (kind === c.RANGE) {
        return "(EXPRESSION ... EXPRESSION)";
    } else if (kind === c.MAPPING_CONSTRUCTOR) {
        return "EXPRESSION : EXPRESSION";
    } else if (kind === c.TYPE_TEST) {
        return "(EXPRESSION is TYPE_DESCRIPTOR)";
    } else if (kind === c.STRING_LITERAL) {
        return "\" \"";
    } else if (kind === c.NUMERIC_LITERAL) {
        return "0";
    } else if (kind === c.BOOLEAN_LITERAL) {
        return "true";
    } else if (kind === c.SIMPLE_NAME_REFERENCE) {
        return value;
    } else if (kind === c.BOOLEAN_TYPE_DESC) {
        return "boolean";
    } else if (kind === c.STRING_TYPE_DESC) {
        return "string";
    } else if (kind === c.DECIMAL_TYPE_DESC) {
        return "decimal";
    } else if (kind === c.FLOAT_TYPE_DESC) {
        return "float";
    } else if (kind === c.INT_TYPE_DESC) {
        return "int";
    } else if (kind === c.JSON_TYPE_DESC) {
        return "json";
    }
}

export const ExpressionKindByOperator: { [key: string]: string } = {
    AsteriskToken: c.ARITHMETIC,
    BitwiseAndToken: c.ARITHMETIC,
    BitwiseXorToken: c.ARITHMETIC,
    DoubleDotLtToken: c.RANGE,
    DoubleEqualToken: c.EQUALITY,
    EllipsisToken: c.RANGE,
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
    TrippleEqualToken: c.EQUALITY,
    MinusToken: c.ARITHMETIC
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
        { value: "...", kind: "EllipsisToken" },
        { value: "..<", kind: "DoubleDotLtToken" }
    ]
}

export const ExpressionSuggestionsByKind: { [key: string]: SuggestionItem[] } = {
    BooleanLiteral: [
        { value: c.RELATIONAL },
        { value: c.EQUALITY },
        { value: c.LOGICAL },
        { value: c.TYPE_TEST },
        { value: c.CONDITIONAL },
        // { value: c.UNARY }
    ],
    StringLiteral: [
        { value: c.STRING_LITERAL },
        { value: c.CONDITIONAL },
        { value: c.STRING_TEMPLATE },
        { value: c.ARITHMETIC }
    ],
    NumericLiteral: [],
    Relational: [
        { value: c.ARITHMETIC },
        { value: c.CONDITIONAL },
        { value: c.TYPE_TEST },
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
        { value: c.TYPE_TEST },
        { value: c.CONDITIONAL }
    ],
    Equality: [
        { value: c.ARITHMETIC },
        { value: c.CONDITIONAL },
        { value: c.STRING_LITERAL },
        { value: c.NUMERIC_LITERAL },
        // { value: c.STRING_TEMPLATE }
    ],
    DefaultBoolean: [
        { value: c.RELATIONAL },
        { value: c.EQUALITY },
        { value: c.LOGICAL },
        { value: c.BOOLEAN_LITERAL },
        { value: c.TYPE_TEST },
        { value: c.CONDITIONAL },
        // { value: c.UNARY }
    ],
    DefaultInteger: [
        { value: c.ARITHMETIC },
        { value: c.NUMERIC_LITERAL },
        { value: c.CONDITIONAL },
        // { value: c.UNARY }
    ],
    DefaultString: [
        { value: c.STRING_LITERAL },
        { value: c.CONDITIONAL },
        // { value: c.STRING_TEMPLATE },
        { value: c.ARITHMETIC }
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
    ],
    DefaultReturn: [
        { value: c.STRING_LITERAL },
        { value: c.NUMERIC_LITERAL },
        { value: c.BOOLEAN_LITERAL },
        { value: c.ARITHMETIC },
        { value: c.RELATIONAL },
        { value: c.EQUALITY },
        { value: c.TYPE_TEST },
        { value: c.LOGICAL },
        { value: c.CONDITIONAL },
        { value: c.RANGE }
    ],
    DefaultExpressions: [
        { value: c.ARITHMETIC },
        { value: c.RELATIONAL },
        { value: c.EQUALITY },
        { value: c.LOGICAL },
        { value: c.STRING_LITERAL },
        { value: c.NUMERIC_LITERAL },
        { value: c.BOOLEAN_LITERAL },
        { value: c.TYPE_TEST },
        { value: c.CONDITIONAL },
        { value: c.RANGE }
    ],
    Range: [
        { value: c.ARITHMETIC },
        { value: c.RELATIONAL },
        { value: c.EQUALITY },
        { value: c.LOGICAL },
        { value: c.STRING_LITERAL },
        { value: c.NUMERIC_LITERAL },
        { value: c.BOOLEAN_LITERAL },
        { value: c.CONDITIONAL },
        { value: c.RANGE }
    ]
}

export const DataTypeByExpressionKind: { [key: string]: string[] } = {
    StringLiteral: ["string"],
    NumericLiteral: ["int", "float", "decimal"],
    Arithmetic: ["string", "int", "float", "decimal"],
    BracedExpression: ["string", "int", "float", "decimal"]
}
