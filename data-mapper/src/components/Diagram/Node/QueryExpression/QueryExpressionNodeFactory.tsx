
import * as React from 'react';
import "reflect-metadata";

import { QueryExpressionNode, QUERY_EXPR_NODE_TYPE } from './QueryExpressionNode';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

import { injectable, container, singleton } from "tsyringe";
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';
import { QueryExpressionNodeWidget } from './QueryExpressionNodeWidget';

@injectable()
@singleton()
export class QueryExpressionNodeFactory extends AbstractReactFactory<QueryExpressionNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(QUERY_EXPR_NODE_TYPE);
	}

	generateReactWidget(event: { model: QueryExpressionNode; }): JSX.Element {
		return <QueryExpressionNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}

container.register("NodeFactory",  {useClass: QueryExpressionNodeFactory});
