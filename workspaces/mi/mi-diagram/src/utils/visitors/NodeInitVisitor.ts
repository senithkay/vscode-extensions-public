/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    Log,
    Visitor,
} from '@wso2-enterprise/mi-syntax-tree/lib';
import { LogMediatorNodeModel } from '../../components/nodes/mediators/log/LogMediatorModel';
import { NodeModel } from '@projectstorm/react-diagrams-core';
import { mapNode } from './ModelMapper';

export class NodeInitVisitor implements Visitor {
    private nodes: NodeModel[] = [];

    beginVisitLog(node: Log) {
        this.nodes.push(new LogMediatorNodeModel(mapNode(node as any)));
    }

    getNodes(): NodeModel[] {
        return this.nodes;
    }
}

