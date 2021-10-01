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
export interface Expression {
    type: ("string" | "int" | "float" | "decimal" | "boolean")[],
    kind: string,
    expressionType?:
    | Equality
    | Relational
    | TypeCheck
    | Conditional
    | Literal
    | Logical
    | Arithmetic
    | Variable
    | Unary
    | StringTemplate
    | DefaultBoolean
    | Expression
}

export interface Literal {
    value: any
}

export interface Variable {
    name: string
}

// tslint:disable-next-line:no-empty-interface
export interface DefaultBoolean { }

export interface Comparison {
    lhsExp: Expression,
    operator: ">" | ">=" | "<" | "<=" | "==" | "!=" | "===" | "!==" | "operator"
    rhsExp: Expression
}

export interface Relational extends Comparison {
    lhsExp: Expression
    operator: ">" | ">=" | "<" | "<=" | "operator"
    rhsExp: Expression
}

export interface Equality extends Comparison {
    lhsExp: Expression
    operator: "==" | "!=" | "===" | "!==" | "operator"
    rhsExp: Expression
}

export interface Arithmetic {
    lhsOperand: Expression
    operator: "*" | "/" | "%" | "+" | "-" | "operator"
    rhsOperand: Expression
}

export interface Logical {
    lhsComponent: Expression
    operator: "&&" | "||" | "operator"
    rhsComponent: Expression
}

export interface StringTemplate {
    start: "string `"
    exp: Expression
    end: "`"
}

export interface TypeCheck { // if (x is error)
    value: Expression
    keyWord: "is"
    typeDescriptor: "string" | "int" | "float" | "decimal" | "boolean" | "error"
}

export interface Conditional {   // (1 == 1) ? x : y
    condition: Expression
    keyWord1: "?"
    trueExpr: Expression
    keyWord2: ":"
    falseExpr: Expression
}

export interface Unary {
    operator: "+" | "-" | "~" | "!" | "operator"
    operand: Expression
}

export interface VariableUserInputs {
    selectedType: string
    otherType?: string
    varName?: string
    variableExpression?: string
}
