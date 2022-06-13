import { DataMapperNodeWidget } from './DataMapperNodeWidget';
import { DataMapperNodeModel } from './DataMapperNode';
import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

export class DataMapperNodeFactory extends AbstractReactFactory<DataMapperNodeModel, DiagramEngine> {
	constructor() {
		super('datamapper');
	}

	generateReactWidget(event: { model: DataMapperNodeModel; }): JSX.Element {
		return <DataMapperNodeWidget engine={this.engine} size={200} node={event.model} />;
	}

	generateModel(event: { initialConfig: any }) {
		return new DataMapperNodeModel(event.initialConfig.model, event.initialConfig.supportOutput, event.initialConfig.supportInput);
	}
}
