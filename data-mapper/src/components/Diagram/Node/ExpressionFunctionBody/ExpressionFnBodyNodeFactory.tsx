
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { MappingConstructor } from '@wso2-enterprise/syntax-tree';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { RecordFieldPortModel } from '../../Port';
import { getEnrichedRecordType } from "../../utils/dm-utils";
import { EditableMappingConstructorWidget } from "../commons/DataManipulationWidget/EditableMappingConstructorWidget";
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
			<EditableMappingConstructorWidget
				engine={this.engine}
				id="exprFunctionBody"
				editableRecordFields={event.model.enrichedTypeDef.childrenTypes}
				value={event.model.value.expression as MappingConstructor}
				getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
				context={event.model.context}
			/>
		);
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}
container.register("NodeFactory", { useClass: ExpressionFunctionBodyFactory });
