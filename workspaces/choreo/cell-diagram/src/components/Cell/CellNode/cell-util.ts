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


export function getCellPortId(cellName: string, bound: CellBounds, align?: PortModelAlignment, ...args: string[]): string {
    let rest = '';
    if (args.length > 0) {
        rest = `-${args.join('-')}`;
    }
    return `${align ? `${align}-` : ''}${cellName}-${bound}${rest !== '' ? `${rest}` : ''}`;
}

export function getCellPortName(cellName: string, bound: CellBounds, ...args: string[]): string {
    let rest = '';
    if (args.length > 0) {
        rest = `-${args.join('-')}`;
    }
    return `${cellName}-${bound}${rest !== '' ? `${rest}` : ''}`;
}
