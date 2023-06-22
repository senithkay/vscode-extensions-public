/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { EntryNodeWidget } from './EntryNodeWidget';
import { EntryNodeModel } from './EntryNodeModel';

interface GenerateReactWidgetProps {
	model: EntryNodeModel
}

export class EntryNodeFactory extends AbstractReactFactory<EntryNodeModel, DiagramEngine> {
	constructor() {
		super('entryPointNode');
	}

	generateReactWidget(event: GenerateReactWidgetProps): JSX.Element {
		return <EntryNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event: { initialConfig: any }) {
		return new EntryNodeModel(event.initialConfig.packageName, event.initialConfig.level,
			event.initialConfig.location, event.initialConfig.version);
	}
}
