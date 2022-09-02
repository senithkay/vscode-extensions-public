
import * as React from 'react';
import "reflect-metadata";

import { QueryExprAsSFVNode, QUERY_EXPR_NODE_TYPE } from './QueryExprAsSFVNode';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

import { injectable, container, singleton } from "tsyringe";
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';
import { QueryExprAsSFVNodeWidget } from './QueryExprAsSFVNodeWidget';

@injectable()
@singleton()
export class QueryExprAsSFVNodeFactory extends AbstractReactFactory<QueryExprAsSFVNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(QUERY_EXPR_NODE_TYPE);
	}

	generateReactWidget(event: { model: QueryExprAsSFVNode; }): JSX.Element {
		return <QueryExprAsSFVNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}

container.register("NodeFactory",  {useClass: QueryExprAsSFVNodeFactory});
