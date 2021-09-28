import {BinaryExpression, BracedExpression, STNode} from "@ballerina/syntax-tree";

import * as c from "../constants";
import {Expression} from '../models/definitions';

export interface SuggestionItem {
    value: string,
    kind?: string
}

export function deleteExpression(model: Expression) { // Need to handle accordingly with ST
    delete model.expressionType;
}

export function addOperator(model: STNode, operator: SuggestionItem) {
    const expression: any = model;
    if ("typeDescriptor" in expression) {
        expression.typeDescriptor = operator.value;
    } else {
        expression.operator.value = operator.value;
        expression.operator.kind = operator.kind;
    }
}

export function addExpression(model: any, kind: string, value?: any) {
    delete model.literalToken;
    if (kind === c.ARITHMETIC) {
        Object.assign(model, createArithmetic());
    } else if (kind === c.RELATIONAL) {
        Object.assign(model, createRelational());
    } else if (kind === c.EQUALITY) {
        Object.assign(model, createEquality());
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

// export const ExpressionSuggestionsByKind : {[key: string]: string[]} = {
//     literal : ["comparison", "logical", "arithmetic"],
//     comparison : ["arithmetic", "conditional", "type-checks"],
//     relational : ["arithmetic", "conditional", "type-checks"],
//     ArithmeticC : ["literal","ArithmeticC", "conditional"],
//     logical : ["conditional"],
//     conditional : ["literal"]
// }

// export const ExpressionSuggestionsByKind: { [key: string]: string[] } = {
//     Literal: [],
//     Relational: [c.ARITHMETIC, c.CONDITIONAL, c.TYPE_CHECK, c.RELATIONAL, c.LITERAL],
//     Arithmetic: [c.LITERAL, c.ARITHMETIC, c.CONDITIONAL],
//     Logical: [c.RELATIONAL, c.LOGICAL, c.CONDITIONAL, c.LITERAL],
//     Conditional: [c.LITERAL, c.RELATIONAL, c.TYPE_CHECK, c.CONDITIONAL],
//     Equality: [c.ARITHMETIC, c.CONDITIONAL, c.LITERAL, c.STRING_TEMPLATE,],
//     DefaultBoolean: [c.RELATIONAL, c.EQUALITY, c.LOGICAL, c.LITERAL, c.TYPE_CHECK, c.CONDITIONAL, c.UNARY],
//     TypeCheck: [c.LITERAL, c.CONDITIONAL   ],
//     Unary: [c.LITERAL, c.RELATIONAL, c.EQUALITY, c.ARITHMETIC],
//     StringTemplate: [c.STRING_TEMPLATE, c.ARITHMETIC, c.CONDITIONAL]
// }

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

export const OperatorsForExpressionKind: { [key: string]: SuggestionItem[] } = {
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

export const ExpressionSuggestionsByKind: { [key: string]: SuggestionItem[] } = {
    Literal: [],
    Relational: [
        {value: c.ARITHMETIC},
        {value: c.CONDITIONAL},
        {value: c.TYPE_CHECK},
        {value: c.RELATIONAL},
        {value: c.LITERAL}
    ],
    Arithmetic: [
        {value: c.LITERAL},
        {value: c.ARITHMETIC},
        {value: c.CONDITIONAL}
    ],
    Logical: [
        {value: c.RELATIONAL},
        {value: c.LOGICAL},
        {value: c.CONDITIONAL},
        {value: c.LITERAL}
    ],
    Conditional: [
        {value: c.LITERAL},
        {value: c.RELATIONAL},
        {value: c.TYPE_CHECK},
        {value: c.CONDITIONAL}
    ],
    Equality: [
        {value: c.ARITHMETIC},
        {value: c.CONDITIONAL},
        {value: c.LITERAL},
        {value: c.STRING_TEMPLATE}
    ],
    DefaultBoolean: [
        {value: c.RELATIONAL},
        {value: c.EQUALITY},
        {value: c.LOGICAL},
        {value: c.LITERAL},
        {value: c.TYPE_CHECK},
        {value: c.CONDITIONAL},
        {value: c.UNARY}
    ],
    TypeCheck: [
        {value: c.LITERAL},
        {value: c.CONDITIONAL}
    ],
    Unary: [
        {value: c.LITERAL},
        {value: c.RELATIONAL},
        {value: c.EQUALITY},
        {value: c.ARITHMETIC}
    ],
    StringTemplate: [
        {value: c.STRING_TEMPLATE},
        {value: c.ARITHMETIC},
        {value: c.CONDITIONAL}
    ]
}
