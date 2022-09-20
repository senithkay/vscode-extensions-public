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
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { MappingConstructor, STKindChecker } from '@wso2-enterprise/syntax-tree';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { RecordFieldPortModel } from '../../Port';
import { EditableMappingConstructorWidget } from "../commons/DataManipulationWidget/EditableMappingConstructorWidget";
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';

import {
	MappingConstructorNode,
	MAPPING_CONSTRUCTOR_NODE_TYPE,
	MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX
} from './MappingConstructorNode';

@injectable()
@singleton()
export class ExpressionFunctionBodyFactory extends AbstractReactFactory<MappingConstructorNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(MAPPING_CONSTRUCTOR_NODE_TYPE);
	}

	generateReactWidget(event: { model: MappingConstructorNode; }): JSX.Element {
		let valueLabel;
		if (STKindChecker.isSelectClause(event.model.value)){
			valueLabel = event.model.typeIdentifier.value || event.model.typeIdentifier.source;
		}
		return (
			<EditableMappingConstructorWidget
				engine={this.engine}
				id={MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX}
				editableRecordFields={event.model.recordFields}
				typeName={event.model.typeName}
				value={event.model.value.expression as MappingConstructor}
				getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
				context={event.model.context}
				valueLabel={valueLabel}
			/>
		);
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}
container.register("NodeFactory", { useClass: ExpressionFunctionBodyFactory });
