/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { ExtServiceNodeWidget } from './ExtServiceNodeWidget';
import { ExtServiceNodeModel } from './ExtServiceNodeModel';

export class ExtServiceNodeFactory extends AbstractReactFactory<ExtServiceNodeModel, DiagramEngine> {
	constructor() {
		super('extServiceNode');
	}

	generateReactWidget(event: { model: ExtServiceNodeModel }): JSX.Element {
		return <ExtServiceNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event: { initialConfig: any }) {
		return new ExtServiceNodeModel(event.initialConfig.id, event.initialConfig.label);
	}
}
