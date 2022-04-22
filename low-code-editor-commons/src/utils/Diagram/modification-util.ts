/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { compile } from "handlebars";

import { default as templates } from "../../templates/components";
import { STModification } from "../../types";

import { getInsertComponentSource } from "./template-utils";

export async function InsertorDelete(modifications: STModification[]): Promise<STModification[]> {
    const stModifications: STModification[] = [];
    /* tslint:disable prefer-for-of */
    for (let i = 0; i < modifications.length; i++) {
        const value: STModification = modifications[i];
        let stModification: STModification;
        if (value.type && value.type.toLowerCase() === "delete") {
            stModification = value;
        } else if (value.type && value.type.toLowerCase() === "import") {
            const source = await getInsertComponentSource(value.type, value.config);
            stModification = {
                startLine: value.startLine,
                startColumn: value.startColumn,
                endLine: value.endLine,
                endColumn: value.endColumn,
                type: "INSERT",
                isImport: true,
                config: {
                    "TYPE": value?.config?.TYPE,
                    "STATEMENT": source,
                }
            }
        } else if (value.type && value.type.toLowerCase() === 'insert') {
            stModification = value;
        } else {
            const source = await getInsertComponentSource(value.type, value.config);
            stModification = {
                startLine: value.startLine,
                startColumn: value.startColumn,
                endLine: value.endLine,
                endColumn: value.endColumn,
                type: "INSERT",
                config: {
                    "STATEMENT": source,
                }
            };
        }
        stModifications.push(stModification);
    }
    return stModifications;
}

export function mutateFunctionSignature(accessModifier: string, name: string, parameters: string, returnTypes: string,
                                        targetPosition: NodePosition): STModification {
    const functionStatement: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.endColumn ? targetPosition.endColumn : 0,
        endLine: targetPosition.startLine,
        endColumn: targetPosition.endColumn ? targetPosition.endColumn : 0,
        type: "FUNCTION_DEFINITION",
        config: {
            "ACCESS_MODIFIER": accessModifier,
            "NAME": name,
            "PARAMETERS": parameters,
            "RETURN_TYPE": returnTypes
        }
    };

    return functionStatement;
}

export function getComponentSource(insertTempName: string, config: { [key: string]: any }) {
    const hbTemplate = compile(templates[insertTempName]);
    return hbTemplate(config);
}

export function getSource(modification: STModification): string {
    const source = getComponentSource(modification.type, modification.config);
    return source;
}
