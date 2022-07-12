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
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { AddIOTypeNodeWidget } from "../commons/AddIOTypeNodeWidget";
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';

import { AddInputTypeNode, ADD_INPUT_TYPE_NODE_TYPE } from './AddInputTypeNode';

@injectable()
@singleton()
export class AddInputTypeNodeFactory extends AbstractReactFactory<AddInputTypeNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(ADD_INPUT_TYPE_NODE_TYPE);
	}

	generateReactWidget(event: { model: AddInputTypeNode; }): JSX.Element {
		return (
			<AddIOTypeNodeWidget
				engine={this.engine}
				node={event.model}
				title={"Input"}
				context={event.model.context}
			/>
		);
	}


	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}

container.register("NodeFactory", { useClass: AddInputTypeNodeFactory });
