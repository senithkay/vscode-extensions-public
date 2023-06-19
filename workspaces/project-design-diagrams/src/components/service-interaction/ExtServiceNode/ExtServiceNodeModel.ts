/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeModel, NodeModelGenerics, PortModelAlignment } from '@projectstorm/react-diagrams';
import { ServicePortModel } from '../ServicePort/ServicePortModel';

export class ExtServiceNodeModel extends NodeModel<NodeModelGenerics> {
	readonly label: string;

	constructor(id: string, label: string) {
		super({
			type: 'extServiceNode',
			id: id
		});
		this.label = label;
		this.addPort(new ServicePortModel(id, PortModelAlignment.LEFT));
		this.addPort(new ServicePortModel(id, PortModelAlignment.RIGHT));
	}
}
