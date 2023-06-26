/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { AbstractModelFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { container, injectable, singleton } from 'tsyringe';

import { FORM_FIELD_PORT } from "./RecordFieldPortModel";

@injectable()
@singleton()
export class RecordFieldPortFactory extends AbstractModelFactory<PortModel, DiagramEngine> {

	constructor() {
		super(FORM_FIELD_PORT);
	}

	generateModel(): PortModel {
		return undefined;
	}
}
container.register("PortFactory", {useClass: RecordFieldPortFactory});
