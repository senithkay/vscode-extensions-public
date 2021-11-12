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
import { NodePosition } from "@ballerina/syntax-tree";

import { STModification } from "../../../../../../../Definitions";

export function createStatement(property: string, targetPosition: NodePosition): STModification {
    const modification: STModification = {
        startLine: targetPosition.startLine,
        startColumn: 0,
        endLine: targetPosition.startLine,
        endColumn: 0,
        type: "INSERT",
        isImport: false,
        config: {
            "TYPE": "INSERT",
            "STATEMENT": property
        }
    };

    return modification;
}

export function updateStatement(property: string, targetPosition: NodePosition): STModification {
    const modification: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "INSERT",
        isImport: false,
        config: {
            "TYPE": "INSERT",
            "STATEMENT": property
        }
    };

    return modification;
}
