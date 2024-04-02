/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as React from 'react';

import { DefaultLinkFactory } from '@projectstorm/react-diagrams';

import { RightAngleLinkModel } from './RightAngleLinkModel';
import { RightAngleLinkWidget } from './RightAngleLinkWidget';

export class RightAngleLinkFactory extends DefaultLinkFactory<RightAngleLinkModel> {
	static NAME = 'rightAngle';

	constructor() {
		super(RightAngleLinkFactory.NAME);
	}

	generateModel(): RightAngleLinkModel {
		return new RightAngleLinkModel();
	}

	generateReactWidget(event: { model: RightAngleLinkModel }): JSX.Element {
		return <RightAngleLinkWidget diagramEngine={this.engine} link={event.model} factory={this} />;
	}
}
