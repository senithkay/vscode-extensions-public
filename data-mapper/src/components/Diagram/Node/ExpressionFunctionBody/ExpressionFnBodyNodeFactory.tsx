
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { RecordFieldPortModel } from '../../Port';
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';
import { RecordTypeTreeWidget } from "../commons/RecordTypeTreeWidget/RecordTypeTreeWidget";

import { ExpressionFunctionBodyNode, EXPR_FN_BODY_NODE_TYPE } from './ExpressionFunctionBodyNode';

@injectable()
@singleton()
export class ExpressionFunctionBodyFactory extends AbstractReactFactory<ExpressionFunctionBodyNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(EXPR_FN_BODY_NODE_TYPE);
	}

	generateReactWidget(event: { model: ExpressionFunctionBodyNode; }): JSX.Element {
		return (
			<RecordTypeTreeWidget
				engine={this.engine}
				id="exprFunctionBody"
				typeDesc={event.model.typeDef}
				getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
			/>
		);
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}
container.register("NodeFactory", { useClass: ExpressionFunctionBodyFactory });
