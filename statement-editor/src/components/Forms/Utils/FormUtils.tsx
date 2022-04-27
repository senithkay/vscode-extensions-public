/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { createFunctionSignature, getSource } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

export function recalculateItemIds(items: any[]) {
    items.forEach((item, index) => {
        item.id = index;
    });
}

export function getInitialSource(type: string, targetPosition: NodePosition): string {
    switch (type) {
        case "Function": {
            return getSource(createFunctionSignature("", "name", "", "",
                targetPosition));
        }
    }
    return;
}
