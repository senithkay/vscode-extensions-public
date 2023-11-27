/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DefaultLinkModel, DiagramEngine, PortModelAlignment } from '@projectstorm/react-diagrams';
import { BezierCurve, Point } from '@projectstorm/geometry';
import { BaseNodeModel } from '../base-node/base-node';
export class MediatorBaseLinkModel extends DefaultLinkModel {
	diagramEngine: DiagramEngine;

	constructor(id: string, type: string) {
		super({
			id: id,
			type: type
		});
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
			let markerSpace: number = this.getType() === 'entityLink' ? 125 : 70;

			lineCurve.setSource(this.getSourcePort().getPosition());
			lineCurve.setTarget(this.getTargetPort().getPosition());

			// With a leeway space for the marker
			let sourcePoint: Point = this.getSourcePort().getPosition().clone();
			let targetPoint: Point = this.getTargetPort().getPosition().clone();

			if (this.getTargetPort().getOptions().alignment === PortModelAlignment.LEFT) {
				targetPoint.x = targetPoint.x - markerSpace;
			} else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.RIGHT) {
				targetPoint.x = targetPoint.x + markerSpace;
			} else {
				targetPoint.y = targetPoint.y + 150;
			}

			if (this.getSourcePort().getOptions().alignment === PortModelAlignment.LEFT) {
				sourcePoint.x = sourcePoint.x - markerSpace;
			} else if (this.getSourcePort().getOptions().alignment === PortModelAlignment.RIGHT) {
				sourcePoint.x = sourcePoint.x + markerSpace;
			} else {
				sourcePoint.y = sourcePoint.y - 90;
			}

			lineCurve.setSourceControl(sourcePoint);
			lineCurve.setTargetControl(targetPoint);
			lineCurve.getSourceControl().translate(...this.calculateControlOffset(this.getSourcePort()));
			lineCurve.getTargetControl().translate(...this.calculateControlOffset(this.getTargetPort()));
		}

		return lineCurve.getSVGCurve();
	}

	getBoxPath() {
		const sourcePoint: Point = this.getSourcePort().getPosition().clone();
		const targetPoint: Point = this.getTargetPort().getPosition().clone();
		const sx = sourcePoint.x;
		const sy = sourcePoint.y;
		const tx = targetPoint.x;
		const ty = targetPoint.y;
		const curve = 40;
		const offset = 70;
		const dl = Math.max(sx + offset, tx + offset);
		return `M${sx},${sy} L${dl},${sy} Q${dl + curve},${sy} ${dl + curve},${sy + curve} L${dl + curve},${ty - curve} Q${dl + curve},${ty} ${dl},${ty} L${tx},${ty}`;
	}

	getPath() {
		const sourcePoint: Point = this.getSourcePort().getPosition().clone();
		const targetPoint: Point = this.getTargetPort().getPosition().clone();
		const sx = sourcePoint.x;
		const sy = sourcePoint.y;
		const tx = targetPoint.x;
		const ty = targetPoint.y;
		return `M${sx},${sy} L${tx},${ty}`;
	}

	getArrowHeadPoints = (): string => {
		let points: string;
		let targetPort: Point = this.getTargetPort().getPosition();

		const alignment = this.getTargetPort().getOptions().alignment;
		const isInOutSequence = (this.getSourcePort().getNode() as BaseNodeModel).isInOutSequenceNode();
		if (alignment === PortModelAlignment.RIGHT || (isInOutSequence && alignment === PortModelAlignment.LEFT)) {
			points = `${targetPort.x + 2} ${targetPort.y}, ${targetPort.x + 12} ${targetPort.y + 6},
				${targetPort.x + 12} ${targetPort.y - 6}`;
		} else if (alignment === PortModelAlignment.LEFT) {
			points = `${targetPort.x} ${targetPort.y}, ${targetPort.x - 10} ${targetPort.y + 6},
				${targetPort.x - 10} ${targetPort.y - 6}`;
		} else if (alignment === PortModelAlignment.BOTTOM) {
			points = `${targetPort.x} ${targetPort.y + 2}, ${targetPort.x + 10} ${targetPort.y + 14},
				${targetPort.x - 10} ${targetPort.y + 14}`;
		}
		return points;
	}
}
