/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PortModelAlignment } from '@projectstorm/react-diagrams';
import { Point } from '@projectstorm/geometry';
import { SharedLinkModel } from '../../shared-link/shared-link';
import { EMPTY_NODE } from '../../../resources';
import { CellBounds } from '../CellNode/CellModel';
import { getEmptyNodeName } from '../CellNode/cell-util';

interface LinkOrigins {
    nodeId: string;
    attributeId: string;
}

export class CellLinkModel extends SharedLinkModel {
    sourceNode: LinkOrigins;
    targetNode: LinkOrigins;

    constructor(id: string) {
        super(id, 'cellLink');
    }

    setSourceNode(nodeId: string, attributeId = '') {
        this.sourceNode = { nodeId, attributeId };
    }

    setTargetNode(nodeId: string, attributeId = '') {
        this.targetNode = { nodeId, attributeId };
    }

    getArrowHeadPoints = (): string => {
        let points: string;
        const targetPort: Point = this.getTargetPort().getPosition();

        if (this.getTargetPort().getOptions().alignment === PortModelAlignment.TOP
            && getEmptyNodeName(EMPTY_NODE, CellBounds.NorthBound) === this.sourceNode.nodeId) {
                points = `${targetPort.x} ${targetPort.y}, ${targetPort.x + 10} ${targetPort.y - 15},
					${targetPort.x - 10} ${targetPort.y - 15}`;
        }
        if (this.getTargetPort().getOptions().alignment === PortModelAlignment.LEFT
            && getEmptyNodeName(EMPTY_NODE, CellBounds.WestBound) === this.sourceNode.nodeId) {
                points = `${targetPort.x} ${targetPort.y}, ${targetPort.x - 14} ${targetPort.y + 10},
                    ${targetPort.x - 14} ${targetPort.y - 10}`;
        }
        return points;
    }

    getStraightPath = (): string => {
        let path: string;
        if (this.getSourcePort() && this.getTargetPort()) {
            const sourcePoint: Point = this.getSourcePort().getPosition().clone();
            const targetPoint: Point = this.getTargetPort().getPosition().clone();
            path = `M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`;
        }
        return path;
    }
}
