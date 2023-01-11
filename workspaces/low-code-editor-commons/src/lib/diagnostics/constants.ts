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
export const DOUBLE_QUOTE_ERR_CODE = "BCE0411";
export const UNDEFINED_SYMBOL_ERR_CODE = "BCE2010";

// BCE0411 = Missing quotes, BCE2010 = Undefined symbol, BCE0012 = Missing plus token, BCE0400 = missing identifier, BCE2066 =  incompatible types
export const SUGGEST_DOUBLE_QUOTES_DIAGNOSTICS = ["BCE0411", "BCE2010", "BCE0012", "BCE0400", "BCE2066"];

// BCE2066 =  incompatible types
export const INCOMPATIBLE_TYPE_ERR_CODE = "BCE2066";
export const INCOMPATIBLE_TYPE_MAP_ERR_CODE = "BCE2508";

export const SUGGEST_TO_STRING_TYPE = ["string", "record", "union", "int", "float", "boolean", "json", "xml", "var", "error", "any", "anydata", "decimal"];

/** Messages to be ignored when displaying diagnostics in expression editor */
export const IGNORED_DIAGNOSTIC_MESSAGES: string[] = [`invalid token ';'`];
