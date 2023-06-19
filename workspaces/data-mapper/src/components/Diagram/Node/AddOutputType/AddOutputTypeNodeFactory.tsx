/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { IDataMapperNodeFactory } from '../commons/DataMapperNode';

import { AddOutputTypeNode, ADD_OUTPUT_TYPE_NODE_TYPE } from './AddOutputTypeNode';

@injectable()
@singleton()
export class AddOutputTypeNodeFactory extends AbstractReactFactory<AddOutputTypeNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(ADD_OUTPUT_TYPE_NODE_TYPE);
	}

	generateReactWidget(): JSX.Element {
		return (
			<></>
		);
	}

	generateModel(): AddOutputTypeNode {
		return undefined;
	}
}

container.register("NodeFactory", { useClass: AddOutputTypeNodeFactory });
