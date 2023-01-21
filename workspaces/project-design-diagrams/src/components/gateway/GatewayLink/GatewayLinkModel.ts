/**
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { DefaultLinkModel, DiagramEngine, PortModelAlignment } from '@projectstorm/react-diagrams';
import { BezierCurve, Point } from '@projectstorm/geometry';
import { debounce } from 'lodash';
import { getOpposingPort } from "../../common/shared-link/utils";
import { Level } from "../../../resources";
import { GATEWAY_LINK_TYPE } from "../types";

export class GatewayLinkModel extends DefaultLinkModel {
	diagramEngine: DiagramEngine | undefined;
	readonly level: Level;
	isLinkVisible: boolean = true;

	constructor(level: Level) {
		super({
			type: GATEWAY_LINK_TYPE
		});
		this.level = level;
	}

	initLinks = (diagramEngine: DiagramEngine) => {
		this.diagramEngine = diagramEngine;
		this.getSourcePort().registerListener({
			positionChanged: () => this.onPositionChange()
		});

		this.getTargetPort().registerListener({
			positionChanged: () => this.onPositionChange()
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
			lineCurve.setSource(this.getSourcePort().getPosition());
			lineCurve.setTarget(this.getTargetPort().getPosition());
			let sourcePoint: Point = this.getSourcePort().getPosition().clone();
			let targetPoint: Point = this.getTargetPort().getPosition().clone();
			lineCurve.setSourceControl(sourcePoint);
			lineCurve.setTargetControl(targetPoint);
			lineCurve.getSourceControl().translate(...this.calculateControlOffset(this.getSourcePort()));
			lineCurve.getTargetControl().translate(...this.calculateControlOffset(this.getTargetPort()));
		}

		if (this.isLinkVisible) {
			return lineCurve.getSVGCurve();
		} else {
			return "";
		}
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

	getAngleFromRadians = (value: number): number => {
		return value * 180 / Math.PI;
	}

	getRadiansFormAngle = (value: number): number => {
		return value * Math.PI / 180;
	}

	getArrowHeadPoints = (): string => {
		let points: string = "";
		const widthOfTriangle = 12;
		const targetPort: Point = this.getTargetPort().getPosition();
		const sourcePort: Point = this.getSourcePort().getPosition();
		const directLineSlope =  this.getAngleFromRadians(Math.atan((sourcePort.y - targetPort.y)/(sourcePort.x - targetPort.x)));

		let newSlope;
		if (this.getTargetPort().getOptions().alignment === PortModelAlignment.RIGHT) {
			points = `${targetPort.x + 2} ${targetPort.y}, ${targetPort.x + 12} ${targetPort.y + 8},
				${targetPort.x + 12} ${targetPort.y - 8}`;
		} else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.LEFT) {
			let baseTopX;
			let baseTopY;
			let baseBottomX;
			let baseBottomY;
			if (directLineSlope <= 0) {
				newSlope = -directLineSlope;
				if (newSlope < 15) {
					newSlope = (newSlope * 0.1);
				} else if (newSlope < 30) {
					newSlope = (newSlope * 0.3);
				} else if (newSlope < 45) {
					newSlope = (newSlope * 0.5);
				} else if (newSlope < 60) {
					newSlope = (newSlope * 0.3);
				} else if (newSlope < 80) {
					newSlope = (newSlope * 0.6);
				} else if (newSlope <= 90) {
					newSlope = (newSlope * 0.7);
				}
				baseTopX = targetPort.x - (widthOfTriangle * Math.cos(this.getRadiansFormAngle(newSlope - 30)));
				baseTopY = targetPort.y + (widthOfTriangle * Math.sin(this.getRadiansFormAngle(newSlope - 30)));
				baseBottomX = targetPort.x - (widthOfTriangle * Math.cos(this.getRadiansFormAngle(30 + newSlope)));
				baseBottomY = targetPort.y + (widthOfTriangle * Math.sin(this.getRadiansFormAngle(30 + newSlope)));
			} else {
				newSlope = directLineSlope;
				if (newSlope < 15) {
					newSlope = (newSlope * 0.1);
				} else if (newSlope < 30) {
					newSlope = (newSlope * 0.3);
				} else if (newSlope < 45) {
					newSlope = (newSlope * 0.5);
				} else if (newSlope < 60) {
					newSlope = (newSlope * 0.3);
				} else if (newSlope < 80) {
					newSlope = (newSlope * 0.6);
				} else if (newSlope <= 90) {
					newSlope = (newSlope * 0.7);
				}
				baseTopX = targetPort.x - (widthOfTriangle * Math.sin(this.getRadiansFormAngle( 60 - newSlope)));
				baseTopY = targetPort.y - (widthOfTriangle * Math.cos(this.getRadiansFormAngle(60 - newSlope)));
				baseBottomX = targetPort.x - (widthOfTriangle * Math.cos(this.getRadiansFormAngle(newSlope - 30)));
				baseBottomY = targetPort.y - (widthOfTriangle * Math.sin(this.getRadiansFormAngle(newSlope - 30)));
			}
			points = `${targetPort.x} ${targetPort.y}, ${baseTopX} ${baseTopY}, ${baseBottomX} ${baseBottomY}`;
		} else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.BOTTOM) {
			points = `${targetPort.x} ${targetPort.y + 2}, ${targetPort.x + 12} ${targetPort.y + 14},
				${targetPort.x - 12} ${targetPort.y + 14}`;
		} else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.TOP) {
			let baseTopX;
			let baseTopY;
			let baseBottomX;
			let baseBottomY;
			if (directLineSlope <= 0) {
				newSlope = -directLineSlope;
				if (newSlope > 0 && newSlope < 1) {
					newSlope = (newSlope) + (newSlope * 400);
				} else if (newSlope < 15) {
					newSlope = (newSlope * 5);
				} else if (newSlope < 30) {
					newSlope = (newSlope * 2.8);
				} else if (newSlope < 45) {
					newSlope = (newSlope * 1.8);
				} else if (newSlope < 60) {
					newSlope = (newSlope * 1.4);
				} else if (newSlope < 80) {
					newSlope = (newSlope * 1.2);
				}
				baseTopX = targetPort.x + (widthOfTriangle * Math.sin(this.getRadiansFormAngle(60 - newSlope)));
				baseTopY = targetPort.y - (widthOfTriangle * Math.cos(this.getRadiansFormAngle(60 - newSlope)));
				baseBottomX = targetPort.x + (widthOfTriangle * Math.cos(this.getRadiansFormAngle(newSlope - 30)));
				baseBottomY = targetPort.y - (widthOfTriangle * Math.sin(this.getRadiansFormAngle(newSlope - 30)));
			} else {
				newSlope = directLineSlope;
				if (newSlope > 0 && newSlope < 1) {
					newSlope = (newSlope) + (newSlope * 400);
				} else if (newSlope < 15) {
					newSlope = (newSlope * 5);
				} else if (newSlope < 30) {
					newSlope = (newSlope * 2.8);
				} else if (newSlope < 45) {
					newSlope = (newSlope * 1.8);
				} else if (newSlope < 60) {
					newSlope = (newSlope * 1.4);
					console.log("4");
				} else if (newSlope < 80) {
					newSlope = (newSlope * 1.2);
					console.log("5");
				}
				baseTopX = targetPort.x - (widthOfTriangle * Math.sin(this.getRadiansFormAngle(60 - newSlope)));
				baseTopY = targetPort.y - (widthOfTriangle * Math.cos(this.getRadiansFormAngle(60 - newSlope)));
				baseBottomX = targetPort.x - (widthOfTriangle * Math.cos(this.getRadiansFormAngle(newSlope - 30)));
				baseBottomY = targetPort.y - (widthOfTriangle * Math.sin(this.getRadiansFormAngle(newSlope - 30)));
			}
			points = `${targetPort.x} ${targetPort.y}, ${baseTopX} ${baseTopY}, ${baseBottomX} ${baseBottomY}`;
		}
		return points;
	}

	setLinkVisibility = (isVisible: boolean) => {
		this.isLinkVisible = isVisible;
	}

	getLinkVisibility = () => {
		return this.isLinkVisible;
	}
}
