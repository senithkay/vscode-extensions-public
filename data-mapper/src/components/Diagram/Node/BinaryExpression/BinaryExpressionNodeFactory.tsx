
import * as React from 'react';
import "reflect-metadata";

import { BinaryExpressionNode, BINARY_EXPR_NODE_TYPE } from './BinaryExpressionNode';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

import { injectable, container, singleton } from "tsyringe";
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';
import { BinaryExpressionNodeWidget } from './BinaryExpressionNodeWidget';

@injectable()
@singleton()
export class BinaryExpressionNodeFactory extends AbstractReactFactory<BinaryExpressionNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(BINARY_EXPR_NODE_TYPE);
	}

	generateReactWidget(event: { model: BinaryExpressionNode; }): JSX.Element {
		return <BinaryExpressionNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}

container.register("NodeFactory",  {useClass: BinaryExpressionNodeFactory});
