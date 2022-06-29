
import * as React from 'react';
import "reflect-metadata";

import { DataMapperNodeWidget } from './../view/DataMapperNodeWidget';

import { RequiredParamNode, REQ_PARAM_NODE_TYPE } from './RequiredParamNode';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

import { injectable, container, singleton } from "tsyringe";
import { IDataMapperNodeFactory } from '../model/DataMapperNode';

@injectable()
@singleton()
export class RequiredParamNodeFactory extends AbstractReactFactory<RequiredParamNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(REQ_PARAM_NODE_TYPE);
	}

	generateReactWidget(event: { model: RequiredParamNode; }): JSX.Element {
		return <DataMapperNodeWidget engine={this.engine} size={200} node={event.model} />;
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}

container.register("NodeFactory",  {useClass: RequiredParamNodeFactory});
