
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { RecordFieldPortModel, SpecificFieldPortModel } from '../../Port';
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';
import { RecordTypeTreeWidget } from "../commons/RecordTypeTreeWidget/RecordTypeTreeWidget";

import { RequiredParamNode, REQ_PARAM_NODE_TYPE } from './RequiredParamNode';

@injectable()
@singleton()
export class RequiredParamNodeFactory extends AbstractReactFactory<RequiredParamNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(REQ_PARAM_NODE_TYPE);
	}

	generateReactWidget(event: { model: RequiredParamNode; }): JSX.Element {
		return (
			<RecordTypeTreeWidget
				engine={this.engine}
				id={event.model.value.paramName.value}
				typeDesc={event.model.typeDef}
				getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel | SpecificFieldPortModel}
			/>
		);
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}

container.register("NodeFactory", { useClass: RequiredParamNodeFactory });
