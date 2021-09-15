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
