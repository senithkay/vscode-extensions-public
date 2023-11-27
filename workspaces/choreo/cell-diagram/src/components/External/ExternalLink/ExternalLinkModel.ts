/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PortModelAlignment } from "@projectstorm/react-diagrams";
import { BezierCurve, Point } from "@projectstorm/geometry";
import { SharedLinkModel } from "../../shared-link/shared-link";

interface LinkOrigins {
    nodeId: string;
}

export class ExternalLinkModel extends SharedLinkModel {
    sourceNode: LinkOrigins;
    targetNode: LinkOrigins;

    constructor(id: string) {
        super(id, "externalLink");
    }

    setSourceNode(nodeId: string) {
        this.sourceNode = { nodeId };
    }

    setTargetNode(nodeId: string) {
        this.targetNode = { nodeId };
    }

    getArrowHeadPoints = (): string => {
        let points: string;
        const targetPort: Point = this.getTargetPort().getPosition();

        if (this.getTargetPort().getOptions().alignment === PortModelAlignment.RIGHT) {
            points = `${targetPort.x + 6} ${targetPort.y}, ${targetPort.x + 16} ${targetPort.y + 10},
                ${targetPort.x + 16} ${targetPort.y - 10}`;
        } else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.LEFT) {
            points = `${targetPort.x} ${targetPort.y}, ${targetPort.x - 14} ${targetPort.y + 10},
                ${targetPort.x - 14} ${targetPort.y - 10}`;
        } else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.BOTTOM) {
            points = `${targetPort.x} ${targetPort.y + 2}, ${targetPort.x + 10} ${targetPort.y + 14},
				${targetPort.x - 10} ${targetPort.y + 14}`;
        } else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.TOP) {
            points = `${targetPort.x} ${targetPort.y}, ${targetPort.x + 10} ${targetPort.y - 15},
					${targetPort.x - 10} ${targetPort.y - 15}`;
        }
        return points;
    };

    getCurvePath = (): string => {
        const lineCurve = new BezierCurve();

        if (this.getSourcePort() && this.getTargetPort()) {
            const markerSpace: number = 60;

            lineCurve.setSource(this.getSourcePort().getPosition());
            lineCurve.setTarget(this.getTargetPort().getPosition());

            // With a leeway space for the marker
            const sourcePoint: Point = this.getSourcePort().getPosition().clone();
            const targetPoint: Point = this.getTargetPort().getPosition().clone();

            if (this.getTargetPort().getOptions().alignment === PortModelAlignment.LEFT) {
                targetPoint.x = targetPoint.x - markerSpace;
            } else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.RIGHT) {
                targetPoint.x = targetPoint.x + markerSpace;
            } else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.BOTTOM) {
                targetPoint.y = targetPoint.y + markerSpace;
            } else {
                targetPoint.y = targetPoint.y - markerSpace;
            }

            lineCurve.setSourceControl(sourcePoint);
            lineCurve.setTargetControl(targetPoint);
            lineCurve.getSourceControl().translate(...this.calculateControlOffset(this.getSourcePort()));
            lineCurve.getTargetControl().translate(...this.calculateControlOffset(this.getTargetPort()));
        }

        return lineCurve.getSVGCurve();
    };
}
