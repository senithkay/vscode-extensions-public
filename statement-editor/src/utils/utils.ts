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
        return "key : EXPRESSION";
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
    else if (kind === c.TABLE_CONSTRUCTOR) {
        return "{ EXPRESSION : EXPRESSION }"
    }
    else if (kind === c.OBJECT_CONSTRUCTOR) {
        return "EXPRESSION"
    }
}
