import { DataMapperNodeWidget } from './../view/DataMapperNodeWidget';
import { DataMapperNodeModel } from './DataMapperNode';
import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

export class DataMapperNodeFactory extends AbstractReactFactory<DataMapperNodeModel, DiagramEngine> {
	constructor(type: string = 'datamapper-node') {
		super(type);
	}

	generateReactWidget(event: { model: DataMapperNodeModel; }): JSX.Element {
		return <DataMapperNodeWidget engine={this.engine} size={200} node={event.model} />;
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}
