import { Arithmetic, Conditional, Equality, Expression, Literal, Logical, Relational, TypeCheck, Unary, Variable, StringTemplate } from '../models/definitions';
import * as c from "../constants";

export function deleteExpression(model: Expression) {
    delete model.expressionType;
}

export function addOperator(model: Expression, kind: any) {
    let expression: any = model.expressionType
    if ("typeDescriptor" in expression) {
        expression.typeDescriptor = kind
    } else {
        expression.operator = kind
    }
}

export function addExpression(model: Expression, kind: string, value?: any) {
    model['kind'] = kind;
    var expressionTemplate: TypeCheck
        | Conditional
        | Literal
        | Arithmetic
        | Variable
        | Relational
        | Equality
        | Logical
        | StringTemplate
        | Unary
        | Expression;

    if (kind === c.LITERAL) {
        expressionTemplate = createLiteral(value);
    } else if (kind === c.RELATIONAL) {
        expressionTemplate = createRelational(value);
    } else if (kind === c.EQUALITY) {
        expressionTemplate = createEquality(value);
    } else if (kind === c.CONDITIONAL) {
        expressionTemplate = createConditional();
    } else if (kind === c.ARITHMETIC) {
        expressionTemplate = createArithmetic(value);
    } else if (kind === c.LOGICAL) {
        expressionTemplate = createLogical(value);
    } else if (kind === c.VARIABLE) {
        expressionTemplate = createVariable(value);
    } else if (kind === c.UNARY) {
        expressionTemplate = createUnary(value);
    } else if (kind === c.STRING_TEMPLATE) {
        expressionTemplate = createStringTemplate();
    } else {
        expressionTemplate = createTypeCheck(value);
    }

    model['expressionType'] = expressionTemplate;
}


function createLiteral(value: any): Literal {
    return { value: value };
}

function createVariable(name: string): Variable {
    return { name: name };
}

function createRelational(operator: ">" | ">=" | "<" | "<=" | "operator"): Relational {
    return {
        lhsExp: { type: ["int", "float", "decimal"], kind: c.DEFAULT_BOOL, },
        operator: operator,
        rhsExp: { type: ["int", "float", "decimal"], kind: c.DEFAULT_BOOL, }
    };
}

function createEquality(operator: "==" | "!=" | "===" | "!==" | "operator"): Equality {
    return {
        lhsExp: { type: ["int", "float", "decimal"], kind: c.DEFAULT_BOOL, },
        operator: operator,
        rhsExp: { type: ["int", "float", "decimal"], kind: c.DEFAULT_BOOL, }
    };
}

function createArithmetic(operator: "*" | "/" | "%" | "+" | "-" | "operator"): Arithmetic {
    return {
        lhsOperand: { type: ["int", "float", "decimal"], kind: c.DEFAULT_BOOL, },
        operator: operator,
        rhsOperand: { type: ["int", "float", "decimal"], kind: c.DEFAULT_BOOL, }
    };

}

function createConditional(): Conditional {
    return {
        condition: { type: ["int", "float", "decimal"], kind: c.DEFAULT_BOOL, },
        keyWord1: '?',
        trueExpr: { type: ["int", "float", "decimal"], kind: c.DEFAULT_BOOL, },
        keyWord2: ':',
        falseExpr: { type: ["int", "float", "decimal"], kind: c.DEFAULT_BOOL, }
    }
}

function createLogical(operator: "&&" | "||" | "operator"): Logical {
    return {
        lhsComponent: { type: ["int", "float", "decimal"], kind: c.DEFAULT_BOOL, },
        operator: operator,
        rhsComponent: { type: ["int", "float", "decimal"], kind: c.DEFAULT_BOOL, }
    };
}

function createStringTemplate(): StringTemplate {
    return {
        start: "string `",
        exp: { type: ["string"], kind: c.DEFAULT_BOOL},
        end: "`"
    }
}

function createTypeCheck(type: "string" | "int" | "float" | "boolean"): TypeCheck {
    return {
        value: { type: ["int", "float", "decimal"], kind: c.DEFAULT_BOOL, },
        keyWord: "is",
        typeDescriptor: type
    }
}

function createUnary(operator: "+" | "-" | "~" | "!" | "operator"): Unary {
    return {
        operator: operator,
        operand: { type: ["int", "float", "decimal", "boolean"], kind: c.DEFAULT_BOOL, }
    }
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
    LiteralC: [],
    // comparison : [c.ARITHMETIC, c.CONDITIONAL, "type-checks"],
    RelationalC: [c.ARITHMETIC, c.CONDITIONAL, c.TYPE_CHECK, c.RELATIONAL, c.LITERAL],
    ArithmeticC: [c.LITERAL, c.ARITHMETIC, c.CONDITIONAL],
    LogicalC: [c.RELATIONAL, c.LOGICAL, c.CONDITIONAL, c.LITERAL],
    ConditionalC: [c.LITERAL, c.RELATIONAL, c.TYPE_CHECK, c.CONDITIONAL],
    EqualityC: [c.ARITHMETIC, c.CONDITIONAL, c.LITERAL, c.STRING_TEMPLATE,],
    DefaultBooleanC: [c.RELATIONAL, c.EQUALITY, c.LOGICAL, c.LITERAL, c.TYPE_CHECK, c.CONDITIONAL, c.UNARY],
    TypeCheckC: [c.LITERAL, c.CONDITIONAL   ],
    UnaryC: [c.LITERAL, c.RELATIONAL, c.EQUALITY, c.ARITHMETIC],
    StringTemplateC: [c.STRING_TEMPLATE, c.ARITHMETIC, c.CONDITIONAL]
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

export const OperatorsForExpressionKind: { [key: string]: string[] } = {
    ArithmeticC: ["+ ", "- ", "* ", "/ ", "% "],
    RelationalC: ["> ", ">= ", "< ", "<= "],
    EqualityC: ["== ", "!= ", "=== ", "!== "],
    LogicalC: ["&& ", "|| "],
    UnaryC: ["+ ", "- ", "! ", "~ "],
    // comparison: [">","<",">=","<=","==","!=","===","!=="],
    ShiftC: ["<< ", ">> ", ">>> "],
    RangeC: ["... ", "..< "]
}
