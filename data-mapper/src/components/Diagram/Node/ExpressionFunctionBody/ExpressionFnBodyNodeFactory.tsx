
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { DataMapperPortModel } from '../../Port';
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';
import { RecordTypeTreeWidgetNew } from "../commons/RecordTypeTreeWidget/RecordTypeTreeWidgetNew";

import { ExpressionFunctionBodyNode, EXPR_FN_BODY_NODE_TYPE } from './ExpressionFunctionBodyNode';

@injectable()
@singleton()
export class ExpressionFunctionBodyFactory extends AbstractReactFactory<ExpressionFunctionBodyNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(EXPR_FN_BODY_NODE_TYPE);
	}

	generateReactWidget(event: { model: ExpressionFunctionBodyNode; }): JSX.Element {
		return (
			<RecordTypeTreeWidgetNew
				engine={this.engine}
				id="exprFunctionBody"
				typeDesc={event.model.typeDefNew}
				getPort={(portId: string) => event.model.getPort(portId) as DataMapperPortModel}
			/>
		);
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}
container.register("NodeFactory", { useClass: ExpressionFunctionBodyFactory });
