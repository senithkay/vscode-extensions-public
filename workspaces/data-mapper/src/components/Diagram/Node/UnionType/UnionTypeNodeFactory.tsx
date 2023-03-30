/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { STKindChecker } from '@wso2-enterprise/syntax-tree';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { RecordFieldPortModel } from "../../Port";
import {
	FUNCTION_BODY_QUERY,
	UNION_TYPE_TARGET_PORT_PREFIX
} from '../../utils/constants';
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';

import {
	UnionTypeNode,
	UNION_TYPE_NODE_TYPE
} from './UnionTypeNode';
import { UnionTypeTreeWidget } from "./UnionTypeTreeWidget";

@injectable()
@singleton()
export class UnionTypeNodeFactory extends AbstractReactFactory<UnionTypeNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(UNION_TYPE_NODE_TYPE);
	}

	generateReactWidget(event: { model: UnionTypeNode; }): JSX.Element {
		let valueLabel: string;
		if (STKindChecker.isSelectClause(event.model.value)
			&& event.model.context.selection.selectedST.fieldPath !== FUNCTION_BODY_QUERY)
		{
			valueLabel = event.model.typeIdentifier.value as string || event.model.typeIdentifier.source;
		}
		return (
			<>
				{!event.model.resolvedType && (
					<UnionTypeTreeWidget
						id={`${UNION_TYPE_TARGET_PORT_PREFIX}${event.model.rootName ? `.${event.model.rootName}` : ''}`}
						engine={this.engine}
						context={event.model.context}
						typeName={event.model.typeName}
						getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
					/>
				)}
			</>
		);
	}

	generateModel(): UnionTypeNode {
		return undefined;
	}
}
container.register("NodeFactory", { useClass: UnionTypeNodeFactory });
