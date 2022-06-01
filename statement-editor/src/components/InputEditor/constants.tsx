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

export const completionEditorTypeKinds : number[] = [
    // Type
    11,
    // Union
    25,
    // Record
    22,
    // Module
    9,
    // Class
    8
]

export const FILE_SCHEME = "file://";
export const EXPR_SCHEME = "expr://";

export const INPUT_EDITOR_PLACEHOLDERS = new Map<string, string>([
    ['EXPRESSION', '<add-expression>'],
    ['STATEMENT', '<add-statement>'],
    ['TYPE_DESCRIPTOR', '<add-type>'],
    ['BINDING_PATTERN', '<add-field-name>'],
    ['CONF_NAME', '<add-config-name>']
]);
