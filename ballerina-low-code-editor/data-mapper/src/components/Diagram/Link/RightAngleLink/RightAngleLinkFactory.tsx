/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import * as React from 'react';
import { RightAngleLinkWidget } from './RightAngleLinkWidget';
import { RightAngleLinkModel } from './RightAngleLinkModel';
import { container, injectable, singleton } from "tsyringe";
import { DefaultLinkFactory } from '@projectstorm/react-diagrams';


@injectable()
@singleton()
export class RightAngleLinkFactory extends DefaultLinkFactory<RightAngleLinkModel> {
	static NAME = 'rightAngle';

	constructor() {
		super(RightAngleLinkFactory.NAME);
	}

	generateModel(): RightAngleLinkModel {
		return new RightAngleLinkModel();
	}

	generateReactWidget(event: any): JSX.Element {
		return <RightAngleLinkWidget diagramEngine={this.engine} link={event.model} factory={this} />;
	}
}
container.register("LinkFactory", { useClass: RightAngleLinkFactory });
