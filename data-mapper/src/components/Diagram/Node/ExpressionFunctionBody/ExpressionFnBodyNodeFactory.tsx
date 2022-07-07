
import * as React from 'react';
import "reflect-metadata";


import { ExpressionFunctionBodyNode, EXPR_FN_BODY_NODE_TYPE } from './ExpressionFunctionBodyNode';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

import { injectable, container, singleton } from "tsyringe";
import { IDataMapperNodeFactory } from '../model/DataMapperNode';
import { RecordTypeTreeWidget } from '../commons/RecordTypeTreeWidget/RecordTypeTreeWidget';
import { RecordTypeDesc } from '@wso2-enterprise/syntax-tree';
import { DataMapperPortModel } from '../../Port';

@injectable()
@singleton()
export class ExpressionFunctionBodyFactory extends AbstractReactFactory<ExpressionFunctionBodyNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(EXPR_FN_BODY_NODE_TYPE);
	}

	generateReactWidget(event: { model: ExpressionFunctionBodyNode; }): JSX.Element {
		return <RecordTypeTreeWidget
			engine={this.engine}
			id="exprFunctionBody"
			typeDesc={event.model.typeDef.typeDescriptor as RecordTypeDesc}
			getPort={(portId: string) => event.model.getPort(portId) as DataMapperPortModel}
		/>;
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}
container.register("NodeFactory", { useClass: ExpressionFunctionBodyFactory });