
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { MappingConstructor } from '@wso2-enterprise/syntax-tree';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { RecordFieldPortModel } from '../../Port';
import { getEnrichedRecordType } from "../../utils/dm-utils";
import { DataManipulationWidget } from "../commons/DataManipulationWidget/DataManipulationWidget";
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';

import { ExpressionFunctionBodyNode, EXPR_FN_BODY_NODE_TYPE } from './ExpressionFunctionBodyNode';

@injectable()
@singleton()
export class ExpressionFunctionBodyFactory extends AbstractReactFactory<ExpressionFunctionBodyNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(EXPR_FN_BODY_NODE_TYPE);
	}

	generateReactWidget(event: { model: ExpressionFunctionBodyNode; }): JSX.Element {
		return (
			<DataManipulationWidget
				engine={this.engine}
				id="exprFunctionBody"
				typeWithValue={getEnrichedRecordType(event.model.typeDef, event.model.value.expression)}
				value={event.model.value.expression as MappingConstructor}
				getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
			/>
		);
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}
container.register("NodeFactory", { useClass: ExpressionFunctionBodyFactory });
