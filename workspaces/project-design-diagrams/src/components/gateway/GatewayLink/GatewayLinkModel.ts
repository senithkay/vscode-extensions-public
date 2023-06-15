/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { DefaultLinkModel, DiagramEngine, PortModelAlignment } from '@projectstorm/react-diagrams';
import { BezierCurve, Point } from '@projectstorm/geometry';
import { debounce } from 'lodash';
import { getOpposingPort } from "../../common/shared-link/utils";
import { Level } from "../../../resources";
import { GATEWAY_LINK_TYPE } from "../types";
import { getAngleFromRadians, getNorthArrowHeadPoints, getWestArrowHeadPoints } from "../../../utils/utils";

export class GatewayLinkModel extends DefaultLinkModel {
	diagramEngine: DiagramEngine | undefined;
	readonly level: Level;
	linkVisibility: boolean = true;

	constructor(level: Level) {
		super({
			type: GATEWAY_LINK_TYPE
		});
		this.level = level;
	}

	initLinks = (diagramEngine: DiagramEngine) => {
		this.diagramEngine = diagramEngine;
		if (this.getSourcePort() && this.getTargetPort()) {
			this.getSourcePort().registerListener({
				positionChanged: () => this.onPositionChange()
			});

			this.getTargetPort().registerListener({
				positionChanged: () => this.onPositionChange()
			});
		}
	}

	selectLinkedNodes = () => {
		this.getSourcePort().getNode().fireEvent({ entity: this }, 'SELECT');
		this.getTargetPort().getNode().fireEvent({ entity: this }, 'SELECT');
	}

	resetLinkedNodes = () => {
		this.getSourcePort().getNode().fireEvent({}, 'UNSELECT')
		this.getTargetPort().getNode().fireEvent({}, 'UNSELECT')
	}

	getCurvePath = (): string => {
		const lineCurve = new BezierCurve();

		if (this.getSourcePort() && this.getTargetPort()) {
			lineCurve.setSource(this.getSourcePort().getPosition());
			lineCurve.setTarget(this.getTargetPort().getPosition());
			let sourcePoint: Point = this.getSourcePort().getPosition().clone();
			let targetPoint: Point = this.getTargetPort().getPosition().clone();
			lineCurve.setSourceControl(sourcePoint);
			lineCurve.setTargetControl(targetPoint);
			lineCurve.getSourceControl().translate(...this.calculateControlOffset(this.getSourcePort()));
			lineCurve.getTargetControl().translate(...this.calculateControlOffset(this.getTargetPort()));
		}
		return lineCurve.getSVGCurve();
	}

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
	});

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
	}

	checkPorts = (source: PortModelAlignment, target: PortModelAlignment) => {
		if (!this.getSourcePort().getID().startsWith(source)) {
			this.setSourcePort(this.getSourcePort().getNode().getPortFromID(getOpposingPort(this.getSourcePort().getID(), source)));
			this.diagramEngine?.repaintCanvas();
		}

		if (!this.getTargetPort().getID().startsWith(target)) {
			this.setTargetPort(this.getTargetPort().getNode().getPortFromID(getOpposingPort(this.getTargetPort().getID(), target)));
			this.diagramEngine?.repaintCanvas();
		}
	}

	getArrowHeadPoints = (): string => {
		let points: string = "";
		if (this.getSourcePort() && this.getTargetPort()) {
			const widthOfTriangle = 12;
			const targetPort: Point = this.getTargetPort().getPosition();
			const sourcePort: Point = this.getSourcePort().getPosition();
			const directLineSlope =  getAngleFromRadians(Math.atan(
				(sourcePort.y - targetPort.y)/(sourcePort.x - targetPort.x)));

			if (this.getTargetPort().getOptions().alignment === PortModelAlignment.RIGHT) {
				points = `${targetPort.x + 2} ${targetPort.y}, ${targetPort.x + 12} ${targetPort.y + 8},
				${targetPort.x + 12} ${targetPort.y - 8}`;
			} else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.LEFT) {
				points = getWestArrowHeadPoints(targetPort, directLineSlope, widthOfTriangle);
			} else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.BOTTOM) {
				points = `${targetPort.x} ${targetPort.y + 2}, ${targetPort.x + 12} ${targetPort.y + 14},
				${targetPort.x - 12} ${targetPort.y + 14}`;
			} else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.TOP) {
				points = getNorthArrowHeadPoints(targetPort, directLineSlope, widthOfTriangle);
			}
		}
		return points;
	}

	setIsLinkVisible = (isVisible: boolean) => {
		this.linkVisibility = isVisible;
	}

	getLinkVisibility = () => {
		return this.linkVisibility;
	}
}
