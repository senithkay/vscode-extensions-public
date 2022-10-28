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
import { STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { RecordFieldPortModel } from '../../Port';
import { PRIMITIVE_TYPE_TARGET_PORT_PREFIX } from "../../utils/constants";
import { PrimitiveTypeOutputWidget } from "../commons/DataManipulationWidget/PrimitiveTypeOutputWidget";
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';

import {
	PrimitiveTypeNode,
	PRIMITIVE_TYPE_NODE_TYPE
} from './PrimitiveTypeNode';

@injectable()
@singleton()
export class PrimitiveTypeNodeFactory extends AbstractReactFactory<PrimitiveTypeNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(PRIMITIVE_TYPE_NODE_TYPE);
	}

	generateReactWidget(event: { model: PrimitiveTypeNode; }): JSX.Element {
		let valueLabel;
		let isParentSelectClause;
		if (STKindChecker.isSelectClause(event.model.value)){
			valueLabel = event.model.typeIdentifier.value || event.model.typeIdentifier.source;
			isParentSelectClause = true;
		}
		return (
			<PrimitiveTypeOutputWidget
				id={PRIMITIVE_TYPE_TARGET_PORT_PREFIX}
				engine={this.engine}
				field={event.model.recordField}
				getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
				context={event.model.context}
				typeName={event.model.typeName}
				valueLabel={valueLabel}
				deleteField={(node: STNode) => event.model.deleteField(node)}
				isParentSelectClause={isParentSelectClause}
			/>
		);
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}
container.register("NodeFactory", { useClass: PrimitiveTypeNodeFactory });
