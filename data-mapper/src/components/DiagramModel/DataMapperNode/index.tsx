import createEngine, { DefaultLinkModel, DefaultNodeModel, DiagramModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import * as React from 'react';

import { DataMapperNodeModel } from './DataMapperNode';
import { DataMapperNodeFactory } from './DataMapperNodeFactory';
import { DataMapperPortFactory } from './SimplePortFactory';
import { DataMapperPortModel } from './DataMapperPortModel';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from '../Canvas/DemoCanvasWidget';
import { input as inputST, middle, output as outputST } from './data';

export function DataMapper(): React.ReactElement {
	var engine = createEngine();

	engine
		.getPortFactories()
		.registerFactory(new DataMapperPortFactory('datamapper', (config) => new DataMapperPortModel(config.id, config.type)));
	engine.getNodeFactories().registerFactory(new DataMapperNodeFactory());

	var model = new DiagramModel();


	var node1 = new DataMapperNodeModel(inputST, true, false);
	node1.setPosition(100, 100);

	var node2 = new DataMapperNodeModel(outputST, false, true);
	node2.setPosition(900, 100);

	var node3 = new DataMapperNodeModel(middle, true, true);
	node3.setPosition(500, 100);

	var assetsInPort = node2.getPort("Assets_in");
	var assetsOutPort = node1.getPort("Assets_out");
	var link = new DefaultLinkModel();
	link.setSourcePort(assetsInPort);
	link.setTargetPort(assetsOutPort);


	model.addAll(node1, node2, node3, link);

	engine.setModel(model);

	return (
		<DemoCanvasWidget>
			<CanvasWidget engine={engine} />
		</DemoCanvasWidget>
	);
};

export default React.memo(DataMapper);
