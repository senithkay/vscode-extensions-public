/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PortModelAlignment } from '@projectstorm/react-diagrams';
import { SharedNodeModel } from '../../shared-node/shared-node';
import { CellPortModel } from '../CellPort/CellPortModel';
import { getEmptyNodeName } from '../CellNode/cell-util';
import { CellBounds } from '../CellNode/CellModel';
import { CIRCLE_SIZE, EMPTY_NODE } from '../../../resources';

export class EmptyModel extends SharedNodeModel {
    readonly bound: CellBounds;
    readonly width: number;

    constructor(name: string, bound: CellBounds, width?:number, suffix?: string) {
        const nodeName = getEmptyNodeName(name, bound, suffix);
        
        super(EMPTY_NODE, nodeName);
        this.bound = bound;
        this.width = width || CIRCLE_SIZE;
        this.setLocked(true);

        this.addPort(new CellPortModel(nodeName , PortModelAlignment.TOP));
        this.addPort(new CellPortModel(nodeName, PortModelAlignment.BOTTOM));
        this.addPort(new CellPortModel(nodeName, PortModelAlignment.LEFT));
        this.addPort(new CellPortModel(nodeName, PortModelAlignment.RIGHT));       
    }
}
