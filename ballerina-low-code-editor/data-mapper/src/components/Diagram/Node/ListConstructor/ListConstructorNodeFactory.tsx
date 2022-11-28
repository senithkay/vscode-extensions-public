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
import { LIST_CONSTRUCTOR_TARGET_PORT_PREFIX } from '../../utils/constants';
import { ArrayTypeOutputWidget } from "../commons/DataManipulationWidget/ArrayTypeOutputWidget";
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';

import {
	ListConstructorNode,
	LIST_CONSTRUCTOR_NODE_TYPE
} from './ListConstructorNode';

@injectable()
@singleton()
export class ListConstructorNodeFactory extends AbstractReactFactory<ListConstructorNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(LIST_CONSTRUCTOR_NODE_TYPE);
	}

	generateReactWidget(event: { model: ListConstructorNode; }): JSX.Element {
		let valueLabel;
		if (STKindChecker.isSelectClause(event.model.value)){
			valueLabel = event.model.typeIdentifier.value || event.model.typeIdentifier.source;
		}
		return (
			<ArrayTypeOutputWidget
				id={`${LIST_CONSTRUCTOR_TARGET_PORT_PREFIX}${event.model.rootName ? `.${event.model.rootName}` : ''}`}
				engine={this.engine}
				field={event.model.recordField}
				getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
				context={event.model.context}
				typeName={event.model.typeName}
				valueLabel={valueLabel}
				deleteField={(node: STNode) => event.model.deleteField(node)}
			/>
		);
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}
container.register("NodeFactory", { useClass: ListConstructorNodeFactory });
