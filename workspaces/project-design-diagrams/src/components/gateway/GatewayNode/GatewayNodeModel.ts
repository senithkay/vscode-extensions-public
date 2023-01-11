/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
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
