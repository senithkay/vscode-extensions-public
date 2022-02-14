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
import {
    ActionStatement, AssignmentStatement, CallStatement, CompoundAssignmentStatement, DoStatement,
    ForeachStatement, ForkStatement,
    IfElseStatement,
    LocalVarDecl, LockStatement, MatchStatement,
    PanicStatement, ReturnStatement, RollbackStatement, TransactionStatement,
    WhileStatement
} from "@wso2-enterprise/syntax-tree";

export const VARIABLE = "Variable"
export const ARITHMETIC = "Arithmetic"
export const CONDITIONAL = "Conditional"
export const RELATIONAL = "Relational"
export const EQUALITY = "Equality"
export const LOGICAL = "Logical"
export const RANGE = "Range"
export const STRING_TEMPLATE = "StringTemplate"
export const DEFAULT_BOOL = "DefaultBoolean"
export const DEFAULT_INTEGER = "DefaultInteger"
export const DEFAULT_STRING = "DefaultString"
export const DEFAULT_RETURN = "DefaultReturn"
export const UNARY = "Unary"
export const STRING_LITERAL = "StringLiteral"
export const NUMERIC_LITERAL = "NumericLiteral"
export const BOOLEAN_LITERAL = "BooleanLiteral"
export const SIMPLE_NAME_REFERENCE = "SimpleNameReference"
export const QUALIFIED_NAME_REFERENCE = "QualifiedNameReference"
export const TRUE_KEYWORD = "true";
export const OTHER_STATEMENT = "OtherStatement"
export const STRING_TYPE_DESC = "StringTypeDesc"
export const DECIMAL_TYPE_DESC = "DecimalTypeDesc"
export const FLOAT_TYPE_DESC = "FloatTypeDesc"
export const INT_TYPE_DESC = "IntTypeDesc"
export const JSON_TYPE_DESC = "JsonTypeDesc"
export const VAR_TYPE_DESC = "VarTypeDesc"
export const TYPE_TEST = "TypeTestExpression"
export const TYPE_DESCRIPTOR = "TypeDescriptor"
export const DEFAULT_EXPRESSIONS = "DefaultExpressions"
export const BOOLEAN_TYPE_DESC = "BooleanTypeDesc"
export const OTHER_EXPRESSION = "OtherExpression"
export const MAPPING_CONSTRUCTOR = "MappingConstructor"

export const INIT_EXPR_LIST_CONSTRUCTOR = "EXPRESSION]"
export const APPEND_EXPR_LIST_CONSTRUCTOR = ", EXPRESSION]"

// Statement types supported in function-body-block
export type StatementNodes = ActionStatement
    | AssignmentStatement
    | CallStatement
    | CompoundAssignmentStatement
    | DoStatement
    | ForeachStatement
    | ForkStatement
    | IfElseStatement
    | LocalVarDecl
    | LockStatement
    | MatchStatement
    | PanicStatement
    | ReturnStatement
    | RollbackStatement
    | TransactionStatement
    | WhileStatement;

export type OtherStatementNodeTypes = ActionStatement
    | AssignmentStatement
    | CallStatement
    | CompoundAssignmentStatement
    | DoStatement
    | ForkStatement
    | LockStatement
    | MatchStatement
    | PanicStatement
    | ReturnStatement
    | RollbackStatement
    | TransactionStatement;
