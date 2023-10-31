/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { EMPTY_NODE, NAME_JOIN_CHAR } from "../../../resources/constants";
import { CellBounds } from "../CellNode/CellModel";

export function getEmptyNodeName(bound: CellBounds, ...args: string[]): string {
    let rest = "";
    args?.forEach((arg) => {
        if (arg) {
            rest += `${NAME_JOIN_CHAR}${arg}`;
        }
    });
    return `${EMPTY_NODE}${NAME_JOIN_CHAR}${bound}${rest !== "" ? `${rest}` : ""}`;
}
