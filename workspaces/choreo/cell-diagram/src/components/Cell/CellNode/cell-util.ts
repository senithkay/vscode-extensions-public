/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NAME_JOIN_CHAR } from "../../../resources/constants";
import { CellBounds } from "./CellModel";
import { PortModelAlignment } from "@projectstorm/react-diagrams";

export function getCellPortId(name: string, bound: CellBounds, align?: PortModelAlignment, ...args: string[]): string {
    const portName = getCellPortIdWithoutAlignment(name, bound, ...args);
    if (align) {
        return `${align}-${portName}`;
    }
    return portName;
}

// this will return the port name without the alignment
export function getCellPortIdWithoutAlignment(name: string, bound: CellBounds, ...args: string[]): string {
    let rest = "";
    if (args.length > 0) {
        rest = `${NAME_JOIN_CHAR}${args.join(NAME_JOIN_CHAR)}`;
    }
    return `${name}${NAME_JOIN_CHAR}${bound}${rest !== "" ? `${rest}` : ""}`;
}

// destruct the port name to get the name, bound, alignment and args
export function getCellPortMetadata(cellPortId: string): { name: string, bound: CellBounds, align?: PortModelAlignment, args: string[] } {
    const parts = cellPortId.split(NAME_JOIN_CHAR);
    const nameAndAlign = parts[0].split('-');
    let name: string;
    let align: PortModelAlignment;
    if (nameAndAlign.length == 1) {
        name = nameAndAlign[0];
    }else{
        name = nameAndAlign[1];
        align = nameAndAlign[0] as PortModelAlignment;
    }
    const bound = parts[1] as CellBounds;
    let args: string[] = [];
    if (parts.length > 2) {
        args = parts.slice(2);
    }
    return { name, bound, align, args };
}

export function getNodePortId(name: string, align?: PortModelAlignment): string {
    return `${align ? `${align}-` : ""}${name}`;
}

export function getEmptyNodeName(name: string, bound: CellBounds, ...args: string[]): string {
    let rest = "";
    args?.forEach((arg) => {
        if (arg) {
            rest += `-${arg}`;
        }
    });
    return `${name}-${bound}${rest !== "" ? `${rest}` : ""}`;
}
