import * as React from 'react';
import "reflect-metadata";

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

import { injectable, container, singleton } from "tsyringe";
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';
import { LinkConnectorNode, LINK_CONNECTOR_NODE_TYPE } from './LinkConnectorNode';
import { LinkConnectorNodeWidget } from './LinkConnectorNodeWidget';

@injectable()
@singleton()
export class LinkConnectorNodeFactory extends AbstractReactFactory<LinkConnectorNode, DiagramEngine> implements IDataMapperNodeFactory {
	constructor() {
		super(LINK_CONNECTOR_NODE_TYPE);
	}

	generateReactWidget(event: { model: LinkConnectorNode; }): JSX.Element {
		return <LinkConnectorNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}

container.register("NodeFactory",  {useClass: LinkConnectorNodeFactory});
