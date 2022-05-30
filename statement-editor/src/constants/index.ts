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

import {
    BINDING_PATTERN_PLACEHOLDER,
    EXPR_PLACEHOLDER,
    STMT_PLACEHOLDER,
    TYPE_DESC_PLACEHOLDER
} from "../utils/expressions";

export const VARIABLE = "Variable";
export const ARITHMETIC = "Arithmetic";
export const CONDITIONAL = "Conditional";
export const RELATIONAL = "Relational";
export const EQUALITY = "Equality";
export const LOGICAL = "Logical";
export const RANGE = "Range";
export const STRING_TEMPLATE = "StringTemplate";
export const DEFAULT_BOOL = "DefaultBoolean";
export const DEFAULT_INTEGER = "DefaultInteger";
export const DEFAULT_STRING = "DefaultString";
export const DEFAULT_RETURN = "DefaultReturn";
export const UNARY = "Unary";
export const STRING_LITERAL = "StringLiteral";
export const NUMERIC_LITERAL = "NumericLiteral";
export const BOOLEAN_LITERAL = "BooleanLiteral";
export const SIMPLE_NAME_REFERENCE = "SimpleNameReference";
export const QUALIFIED_NAME_REFERENCE = "QualifiedNameReference";
export const OTHER_STATEMENT = "OtherStatement";
export const STRING_TYPE_DESC = "StringTypeDesc";
export const DECIMAL_TYPE_DESC = "DecimalTypeDesc";
export const FLOAT_TYPE_DESC = "FloatTypeDesc";
export const INT_TYPE_DESC = "IntTypeDesc";
export const JSON_TYPE_DESC = "JsonTypeDesc";
export const VAR_TYPE_DESC = "VarTypeDesc";
export const TYPE_TEST = "TypeTestExpression";
export const TYPE_DESCRIPTOR = "TypeDescriptor";
export const BOOLEAN_TYPE_DESC = "BooleanTypeDesc";
export const OTHER_EXPRESSION = "OtherExpression";
export const CUSTOM_CONFIG_TYPE = "Custom";
export const ALL_LIBS_IDENTIFIER = "All";
export const LANG_LIBS_IDENTIFIER = "Language";
export const STD_LIBS_IDENTIFIER = "Standard";
export const TABLE_CONSTRUCTOR = "TableConstructor";
export const OBJECT_CONSTRUCTOR = "ObjectConstructor";
export const WHITESPACE_MINUTIAE = "WHITESPACE_MINUTIAE";
export const END_OF_LINE_MINUTIAE = "END_OF_LINE_MINUTIAE";
export const CONFIGURABLE_TYPE_STRING = "string";
export const CONFIGURABLE_TYPE_BOOLEAN = "boolean";
export const ADD_CONFIGURABLE_LABEL = "Add Configurable";

export const TYPE_DESC_CONSTRUCTOR = "TYPE_DESCRIPTOR";
export const EXPR_CONSTRUCTOR = "EXPRESSION";
export const TYPED_BINDING_CONSTRUCTOR = "TYPE_DESCRIPTOR BINDING_PATTERN";
export const MAPPING_CONSTRUCTOR = "key : EXPRESSION";
export const CONFIGURABLE_NAME_CONSTRUCTOR = "CONF_NAME";

export const CONFIGURABLE_VALUE_REQUIRED_TOKEN = "?";

export const METHOD_COMPLETION_KIND = 2;
export const FUNCTION_COMPLETION_KIND = 3;
const FIELD_COMPLETION_KIND = 5;
const VARIABLE_COMPLETION_KIND = 6;
export const PROPERTY_COMPLETION_KIND = 10;
const TYPE_COMPLETION_KIND = 11;
const VALUE_COMPLETION_KIND = 12;
const ENUM_MEMBER_COMPLETION_KIND = 20;
const STRUCT_COMPLETION_KIND = 22;
const OPERATOR_COMPLETION_KIND = 24;

export const PLACEHOLDER_DIAGNOSTICS: string[] = [
    EXPR_PLACEHOLDER, STMT_PLACEHOLDER, TYPE_DESC_PLACEHOLDER, BINDING_PATTERN_PLACEHOLDER
];

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

export enum ArrayType {
    MAPPING_CONSTRUCTOR
}

export enum SymbolParameterType {
    REQUIRED = "REQUIRED",
    DEFAULTABLE = "DEFAULTABLE",
    INCLUDED_RECORD = "INCLUDED_RECORD",
    REST = "REST"
}

export const acceptedCompletionKindForTypes : number[] = [
    TYPE_COMPLETION_KIND,
    STRUCT_COMPLETION_KIND
];

export const acceptedCompletionKindForExpressions : number[] = [
    METHOD_COMPLETION_KIND,
    FUNCTION_COMPLETION_KIND,
    FIELD_COMPLETION_KIND,
    VARIABLE_COMPLETION_KIND,
    PROPERTY_COMPLETION_KIND,
    VALUE_COMPLETION_KIND,
    ENUM_MEMBER_COMPLETION_KIND,
    OPERATOR_COMPLETION_KIND
];
