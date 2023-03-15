/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-lambda
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { RecordFieldPortModel } from '../../Port';
import { FUNCTION_BODY_QUERY, MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX } from '../../utils/constants';
import { getExprBodyFromLetExpression } from "../../utils/dm-utils";
import { EditableMappingConstructorWidget } from "../commons/DataManipulationWidget/EditableMappingConstructorWidget";
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';

import {
	MappingConstructorNode,
	MAPPING_CONSTRUCTOR_NODE_TYPE
} from './MappingConstructorNode';

@injectable()
@singleton()
export class ExpressionFunctionBodyFactory extends AbstractReactFactory<MappingConstructorNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(MAPPING_CONSTRUCTOR_NODE_TYPE);
	}

	generateReactWidget(event: { model: MappingConstructorNode; }): JSX.Element {
		let valueLabel: string;
		if (STKindChecker.isSelectClause(event.model.value)
			&& event.model.context.selection.selectedST.fieldPath !== FUNCTION_BODY_QUERY)
		{
			valueLabel = event.model.typeIdentifier.value as string || event.model.typeIdentifier.source;
		}
		const mappingConstruct = STKindChecker.isLetExpression(event.model.value.expression)
			? getExprBodyFromLetExpression(event.model.value.expression)
			: event.model.value.expression;
		return (
			<EditableMappingConstructorWidget
				engine={this.engine}
				id={`${MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX}${event.model.rootName ? `.${event.model.rootName}` : ''}`}
				editableRecordFields={event.model.recordField && event.model.recordField.childrenTypes}
				typeName={event.model.typeName}
				type={event.model.typeDef}
				value={mappingConstruct}
				getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
				context={event.model.context}
				mappings={event.model.mappings}
				valueLabel={valueLabel}
				deleteField={(node: STNode) => event.model.deleteField(node)}
			/>
		);
	}

	generateModel(): MappingConstructorNode {
		return undefined;
	}
}
container.register("NodeFactory", { useClass: ExpressionFunctionBodyFactory });
