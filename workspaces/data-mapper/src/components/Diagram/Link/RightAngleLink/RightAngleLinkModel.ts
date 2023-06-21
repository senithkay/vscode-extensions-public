/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DeserializeEvent } from '@projectstorm/react-canvas-core';
import { DefaultLinkModel, DefaultLinkModelOptions } from '@projectstorm/react-diagrams';
import { PointModel } from '@projectstorm/react-diagrams-core';

import { RightAngleLinkFactory } from './RightAngleLinkFactory';

export class RightAngleLinkModel extends DefaultLinkModel {
	lastHoverIndexOfPath: number;
	private _lastPathXdirection: boolean;
	private _firstPathXdirection: boolean;
	constructor(options: DefaultLinkModelOptions = {}) {
		super({
			type: RightAngleLinkFactory.NAME,
			...options
		});
		this.lastHoverIndexOfPath = 0;
		this._lastPathXdirection = false;
		this._firstPathXdirection = false;
	}

	setFirstAndLastPathsDirection() {
		const points = this.getPoints();
		for (let i = 1; i < points.length; i += points.length - 2) {
			const dx = Math.abs(points[i].getX() - points[i - 1].getX());
			const dy = Math.abs(points[i].getY() - points[i - 1].getY());
			if (i - 1 === 0) {
				this._firstPathXdirection = dx > dy;
			} else {
				this._lastPathXdirection = dx > dy;
			}
		}
	}

	addPoint<P extends PointModel>(pointModel: P, index = 1): P {
		super.addPoint(pointModel, index);
		this.setFirstAndLastPathsDirection();
		return pointModel;
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.setFirstAndLastPathsDirection();
	}

	setManuallyFirstAndLastPathsDirection(first: boolean, last: boolean) {
		this._firstPathXdirection = first;
		this._lastPathXdirection = last;
	}

	getLastPathXdirection(): boolean {
		return this._lastPathXdirection;
	}
	getFirstPathXdirection(): boolean {
		return this._firstPathXdirection;
	}

	setWidth(width: number) {
		this.options.width = width;
		this.fireEvent({ width }, 'widthChanged');
	}

	setColor(color: string) {
		this.options.color = color;
		this.fireEvent({ color }, 'colorChanged');
	}
}
