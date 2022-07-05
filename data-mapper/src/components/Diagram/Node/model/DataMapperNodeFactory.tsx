import { DataMapperNodeWidget } from './../view/DataMapperNodeWidget';
import { DataMapperNodeModel } from './DataMapperNode';
import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { ExpressionFunctionBodyNode } from '../ExpressionFunctionBody';
import { RequiredParamNode } from '../RequiredParam';

export class DataMapperNodeFactory extends AbstractReactFactory<DataMapperNodeModel, DiagramEngine> {
	constructor(type: string = 'datamapper-node') {
		super(type);
	}

	generateReactWidget(event: { model: RequiredParamNode|ExpressionFunctionBodyNode; }): JSX.Element {
		return <DataMapperNodeWidget engine={this.engine} size={200} node={event.model} />;
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}
