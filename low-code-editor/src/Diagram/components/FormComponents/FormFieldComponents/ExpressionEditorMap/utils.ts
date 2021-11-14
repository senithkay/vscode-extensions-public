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

export function appendToMap(key: string, value: string, editorValue: string) {
    const trimmedEditorValue = editorValue.replace(" ", "");
    if (!editorValue || trimmedEditorValue === "" || trimmedEditorValue === "{}") {
        return `{${key}: ${value}}`
    } else if (trimmedEditorValue.startsWith("{") && trimmedEditorValue.endsWith("}")) {
        for (let i = editorValue.length - 1; i >= 0; i--) {
            if (editorValue[i] === "}") {
                const tempMap = editorValue.substring(0, i);
                return `${tempMap}, ${key}: ${value}}`;
            }
        }
    } else {
        return `{${key}: ${value}}`
    }
}

export function newMap(editorValue: string) : boolean {
    const trimmedEditorValue = editorValue.replace(" ", "");
    if (!editorValue || trimmedEditorValue === "" || (trimmedEditorValue.startsWith("{") && trimmedEditorValue.endsWith("}"))) {
        return true
    }
    return false
}
