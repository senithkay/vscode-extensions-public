/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DefaultLinkModel, DiagramEngine, NodeModel, PortModelAlignment } from "@projectstorm/react-diagrams";
import { BezierCurve, Point } from "@projectstorm/geometry";
import { debounce, forIn } from "lodash";
import { getOpposingPort } from "./utils";
import { EMPTY_NODE } from "../../resources";
import { EmptyModel } from "../Cell/EmptyNode/EmptyModel";
import { CellBounds } from "../Cell/CellNode/CellModel";
import { getCellPortMetadata } from "../Cell/CellNode/cell-util";
import { getEmptyNodeName } from "../Cell/EmptyNode/empty-node-util";
import { Observations } from "../../types";

export class SharedLinkModel extends DefaultLinkModel {
    diagramEngine: DiagramEngine;
    observations: Observations[];

    constructor(id: string, type: string) {
        super({
            id: id,
            type: type,
        });
    }

    initLinks = (diagramEngine: DiagramEngine) => {
        this.diagramEngine = diagramEngine;
        this.getSourcePort().registerListener({
            positionChanged: () => this.onPositionChange(),
        });

        this.getTargetPort().registerListener({
            positionChanged: () => this.onPositionChange(),
        });
    };

    fireEventTroughLink = (event: string) => {
        const selectTargetPort = (targetNode: NodeModel, alignment: PortModelAlignment, bound: CellBounds) => {
            if (targetNode.getType() === EMPTY_NODE && (targetNode as EmptyModel).bound === bound) {
                const portMetadata = getCellPortMetadata(targetNode.getID());
                if (!portMetadata?.args) {
                    return;
                }
                const targetPort = targetNode.getPortFromID(alignment + "-" + getEmptyNodeName(bound, ...portMetadata.args));
                if (!targetPort) {
                    return;
                }
                forIn(targetPort.getLinks(), (link) => {
                    link.fireEvent({ component: this }, event);
                });
            }
        };

        // notify source node
        this.getSourcePort().getNode().fireEvent({ component: this }, event);
        //  notify target node
        const targetNode = this.getTargetPort().getNode();
        // notify immediate target node
        targetNode.fireEvent({ component: this }, event);
        // notify target connection nodes
        selectTargetPort(targetNode, PortModelAlignment.BOTTOM, CellBounds.SouthBound);
        // notify target inter org service nodes
        selectTargetPort(targetNode, PortModelAlignment.RIGHT, CellBounds.EastBound);
    };

    selectLinkedNodes = () => {
        this.fireEventTroughLink("SELECT");
    };

    resetLinkedNodes = () => {
        this.fireEventTroughLink("UNSELECT");
    };

    getCurvePath = (): string => {
        const lineCurve = new BezierCurve();

        if (this.getSourcePort() && this.getTargetPort()) {
            const markerSpace: number = this.getType() === "componentLink" ? 70 : 120;

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

            if (this.getSourcePort().getOptions().alignment === PortModelAlignment.LEFT) {
                sourcePoint.x = sourcePoint.x - markerSpace;
            } else if (this.getSourcePort().getOptions().alignment === PortModelAlignment.RIGHT) {
                sourcePoint.x = sourcePoint.x + markerSpace;
            } else if (this.getSourcePort().getOptions().alignment === PortModelAlignment.BOTTOM) {
                sourcePoint.y = sourcePoint.y + markerSpace;
            } else {
                sourcePoint.y = sourcePoint.y - markerSpace;
            }

            lineCurve.setSourceControl(sourcePoint);
            lineCurve.setTargetControl(targetPoint);
            lineCurve.getSourceControl().translate(...this.calculateControlOffset(this.getSourcePort()));
            lineCurve.getTargetControl().translate(...this.calculateControlOffset(this.getTargetPort()));
        }

        return lineCurve.getSVGCurve();
    };

    onPositionChange = debounce(() => {
        if (this.getSourcePort() && this.getTargetPort()) {
            const { sourceLeft, sourceRight, targetLeft, targetRight } = this.getPortPositions();

            if (sourceLeft <= targetLeft) {
                if (sourceRight <= targetLeft) {
                    this.checkPorts(PortModelAlignment.RIGHT, PortModelAlignment.LEFT);
                } else if (targetRight <= sourceRight) {
                    this.checkPorts(PortModelAlignment.RIGHT, PortModelAlignment.RIGHT);
                } else {
                    this.checkPorts(PortModelAlignment.LEFT, PortModelAlignment.LEFT);
                }
            } else {
                if (targetRight <= sourceLeft) {
                    this.checkPorts(PortModelAlignment.LEFT, PortModelAlignment.RIGHT);
                } else {
                    this.checkPorts(PortModelAlignment.LEFT, PortModelAlignment.LEFT);
                }
            }
        }
    }, 500);

    getPortPositions = () => {
        let sourceLeft: number;
        let sourceRight: number;
        let targetLeft: number;
        let targetRight: number;

        if (this.getSourcePort().getOptions().alignment === PortModelAlignment.LEFT) {
            sourceLeft = this.getSourcePort().getPosition().x;
            sourceRight = sourceLeft + this.getSourcePort().getNode().width;
        } else {
            sourceRight = this.getSourcePort().getPosition().x;
            sourceLeft = sourceRight - this.getSourcePort().getNode().width;
        }

        if (this.getTargetPort().getOptions().alignment === PortModelAlignment.LEFT) {
            targetLeft = this.getTargetPort().getPosition().x;
            targetRight = targetLeft + this.getTargetPort().getNode().width;
        } else {
            targetRight = this.getTargetPort().getPosition().x;
            targetLeft = targetRight - this.getTargetPort().getNode().width;
        }

        return { sourceLeft, sourceRight, targetLeft, targetRight };
    };

    checkPorts = (source: PortModelAlignment, target: PortModelAlignment) => {
        if (!this.getSourcePort().getID().startsWith(source)) {
            this.setSourcePort(this.getSourcePort().getNode().getPortFromID(getOpposingPort(this.getSourcePort().getID(), source)));
            this.diagramEngine.repaintCanvas();
        }

        if (!this.getTargetPort().getID().startsWith(target)) {
            this.setTargetPort(this.getTargetPort().getNode().getPortFromID(getOpposingPort(this.getTargetPort().getID(), target)));
            this.diagramEngine.repaintCanvas();
        }
    };

    getArrowHeadPoints = (): string => {
        let points: string;
        const targetPort: Point = this.getTargetPort().getPosition();

        if (this.getTargetPort().getOptions().alignment === PortModelAlignment.RIGHT) {
            points = `${targetPort.x + 2} ${targetPort.y}, ${targetPort.x + 12} ${targetPort.y + 6},
				${targetPort.x + 12} ${targetPort.y - 6}`;
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

    getTooltipPosition = () => {
        const sourcePortPosition = this.getSourcePort().getPosition();
        const targetPortPosition = this.getTargetPort().getPosition();
        const offset = 120;
        // Get midpoint of the link line
        return {
            x: (sourcePortPosition.x + targetPortPosition.x) / 2 - offset,
            y: (sourcePortPosition.y + targetPortPosition.y) / 2 - offset,
        };
    };

    setObservations = (observations: Observations[]) => {
        this.observations = observations;
    };
}
