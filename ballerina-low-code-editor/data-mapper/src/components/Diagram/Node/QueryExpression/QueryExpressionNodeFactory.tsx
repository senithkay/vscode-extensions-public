
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { IDataMapperNodeFactory } from '../commons/DataMapperNode';

import { QueryExpressionNode, QUERY_EXPR_NODE_TYPE } from './QueryExpressionNode';
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

	generateModel(): QueryExpressionNode {
		return undefined;
	}
}

container.register("NodeFactory",  {useClass: QueryExpressionNodeFactory});
