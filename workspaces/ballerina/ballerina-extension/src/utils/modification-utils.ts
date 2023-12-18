/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { STModification } from "@wso2-enterprise/ballerina-core";
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
            };
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
