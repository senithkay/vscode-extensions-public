/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import {
    NodeModel,
    NodeModelGenerics,
    PortModelAlignment,
} from '@projectstorm/react-diagrams';
import { GATEWAY_NODE_TYPE, GatewayType } from '../types';
import { GatewayPortModel } from '../GatewayPort/GatewayPortModel';

export interface GatewayNodeModelGenerics {
    PORT: GatewayPortModel;
}

export class GatewayNodeModel extends NodeModel<NodeModelGenerics & GatewayNodeModelGenerics> {
    constructor(public type: GatewayType, public label: string) {
        super({
            type: GATEWAY_NODE_TYPE,
            id: type,
            locked: true,
        });
        let inPortAlignment = PortModelAlignment.BOTTOM;
        let outPortAlignment = PortModelAlignment.TOP;
        if (type === 'SOUTH') {
            inPortAlignment = PortModelAlignment.TOP;
            outPortAlignment = PortModelAlignment.BOTTOM;
        } else if (type === 'EAST') {
            inPortAlignment = PortModelAlignment.LEFT;
            outPortAlignment = PortModelAlignment.RIGHT;
        } else if (type === 'WEST') {
            inPortAlignment = PortModelAlignment.RIGHT;
            outPortAlignment = PortModelAlignment.LEFT;
        }
        this.addPort(new GatewayPortModel('in', inPortAlignment, type));
        this.addPort(new GatewayPortModel('out', outPortAlignment, type));
    }
}
