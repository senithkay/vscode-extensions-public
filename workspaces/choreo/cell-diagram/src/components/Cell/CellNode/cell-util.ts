/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { CellBounds } from "./CellModel";
import { PortModelAlignment } from '@projectstorm/react-diagrams';


export function getCellPortId(name: string, bound: CellBounds, align?: PortModelAlignment, ...args: string[]): string {
    let rest = '';
    if (args.length > 0) {
        rest = `-${args.join('-')}`;
    }
    return `${align ? `${align}-` : ''}${name}-${bound}${rest !== '' ? `${rest}` : ''}`;
}

export function getCellPortName(name: string, bound: CellBounds, ...args: string[]): string {
    let rest = '';
    args?.forEach((arg) => {
        if (arg) {
            rest += `-${arg}`;
        }
    });
    return `${name}-${bound}${rest !== '' ? `${rest}` : ''}`;
}

export function getNodePortId(name: string, align?: PortModelAlignment): string {
    return `${align ? `${align}-` : ''}${name}`;
}

export function getEmptyNodeName(name: string, bound: CellBounds, ...args: string[]): string {
    let rest = '';
    args?.forEach((arg) => {
        if (arg) {
            rest += `-${arg}`;
        }
    });
    return `${name}-${bound}${rest !== '' ? `${rest}` : ''}`;
}
