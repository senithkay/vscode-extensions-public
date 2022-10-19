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

import { SVGProps } from 'react';
import { DefaultLinkModel, DiagramEngine, PortModelAlignment } from '@projectstorm/react-diagrams';
import { BezierCurve, Point } from '@projectstorm/geometry';
import { debounce } from 'lodash';
import { ServicePortModel } from '../../service-interaction';
import { EntityPortModel } from '../../entity-relationship';

type PortPosition = 'left' | 'right';

export class SharedLinkModel extends DefaultLinkModel {
	diagramEngine: DiagramEngine;

	constructor(type: string) {
		super({
			type: type
		});
	}

	initLinks = (diagramEngine: DiagramEngine) => {
		this.diagramEngine = diagramEngine;
		this.getSourcePort().registerListener({
			positionChanged: () => this.onPositionChange()
		})
	
		this.getTargetPort().registerListener({
			positionChanged: () => this.onPositionChange()
		})
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
			} else {
				targetPoint.x = targetPoint.x + markerSpace;
			}

			if (this.getSourcePort().getOptions().alignment === PortModelAlignment.LEFT) {
				sourcePoint.x = sourcePoint.x - markerSpace;
			} else {
				sourcePoint.x = sourcePoint.x + markerSpace;
			}
			lineCurve.setSourceControl(sourcePoint);
			lineCurve.setTargetControl(targetPoint);
			lineCurve.getSourceControl().translate(...this.calculateControlOffset(this.getSourcePort()));
			lineCurve.getTargetControl().translate(...this.calculateControlOffset(this.getTargetPort()));
		}

		return lineCurve.getSVGCurve();
	}

	getArrowHeadPoints = (): string => {
		let points: string;
		let targetPortPos: Point = this.getTargetPort().getPosition();

		if (this.getTargetPort().getOptions().alignment === PortModelAlignment.RIGHT) {
			points = `${targetPortPos.x + 2} ${targetPortPos.y},
				${targetPortPos.x + 12} ${targetPortPos.y + 8}, ${targetPortPos.x + 12} ${targetPortPos.y - 8}`;
		} else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.LEFT) {
			points = `${targetPortPos.x - 2} ${targetPortPos.y},
				${targetPortPos.x - 12} ${targetPortPos.y + 8}, ${targetPortPos.x - 12} ${targetPortPos.y - 8}`;
		} else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.BOTTOM) {
			points = `${targetPortPos.x} ${targetPortPos.y + 2},
				${targetPortPos.x + 12} ${targetPortPos.y + 14}, ${targetPortPos.x - 12} ${targetPortPos.y + 14}`;
		}

		return points;
	}

	getCardinalityProps = (port: ServicePortModel | EntityPortModel): SVGProps<SVGTextElement> => {
		let portPos: Point = port.getPosition();

		if (port.getOptions().alignment === PortModelAlignment.LEFT) {
			return { x: portPos.x - 20, y: portPos.y - 5, fontSize: 11 }
		} else {
			return { x: portPos.x + 12, y: portPos.y - 5, fontSize: 11 }
		}
	}

	onPositionChange = debounce(() => {
		if (this.getSourcePort() && this.getTargetPort()) {
			const { sourceLeft, sourceRight, targetLeft, targetRight } = this.getPortPositions();

			if (sourceLeft <= targetLeft) {
				if (sourceRight <= targetLeft) {
					this.checkPorts('right', 'left');
				} else if (targetRight <= sourceRight) {
					this.checkPorts('right', 'right');
				} else {
					this.checkPorts('left', 'left');
				}
			} else {
				if (targetRight <= sourceLeft) {
					this.checkPorts('left', 'right');
				} else {
					this.checkPorts('left', 'left');
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
	}

	checkPorts = (source: PortPosition, target: PortPosition) => {
		if (this.getSourcePort().getID().startsWith(source === 'left' ? 'right' : 'left')) {
			this.setSourcePort(this.getSourcePort().getNode().getPortFromID
				(this.getSourcePort().getID().replace(source === 'left' ? 'right' : 'left', source)));
			this.diagramEngine.repaintCanvas();
		}

		if (this.getTargetPort().getID().startsWith(target === 'left' ? 'right' : 'left')) {
			this.setTargetPort(this.getTargetPort().getNode().getPortFromID
				(this.getTargetPort().getID().replace(target === 'left' ? 'right' : 'left', target)));
			this.diagramEngine.repaintCanvas();
		}
	}

	selectLinkedNodes = () => {
		this.getSourcePort().getNode().fireEvent({entity: this}, 'SELECT');
		this.getTargetPort().getNode().fireEvent({entity: this}, 'SELECT');
	}

	resetLinkedNodes = () => {
		this.getSourcePort().getNode().fireEvent({}, 'UNSELECT')
		this.getTargetPort().getNode().fireEvent({}, 'UNSELECT')
	}
}
