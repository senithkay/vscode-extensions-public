import createEngine, { DefaultDiagramState, DefaultLinkModel, DefaultNodeModel, DiagramEngine, DiagramModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import * as React from 'react';

import { DataMapperNodeModel } from './Node/model/DataMapperNode';
import { DataMapperNodeFactory } from './Node/model/DataMapperNodeFactory';
import { DataMapperPortFactory } from './Port/model/DataMapperPortFactory';
import { DataMapperPortModel } from './Port/model/DataMapperPortModel';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from './Canvas/DemoCanvasWidget';
import { DefaultState as LinkState } from './LinkState/DefaultState';
import { TypeDefinition } from '@wso2-enterprise/syntax-tree';

interface DataMapperDiagramProps {
	returnType: TypeDefinition;
	paramTypes: Map<string, TypeDefinition>;
}

function initDiagramEngine() {
	const engine = createEngine();

	engine
		.getPortFactories()
		.registerFactory(new DataMapperPortFactory('datamapper', (config) => new DataMapperPortModel(config.id, config.type)));
	engine.getNodeFactories().registerFactory(new DataMapperNodeFactory());

	const state = engine.getStateMachine().getCurrentState();
	if (state instanceof DefaultDiagramState) {
		state.dragNewLink.config.allowLooseLinks = false;
	}

	engine.getStateMachine().pushState(new LinkState());
	return engine;
}

function DataMapperDiagram(props: DataMapperDiagramProps): React.ReactElement {

	const { paramTypes, returnType } = props;
	
	const [engine, setEngine] = React.useState<DiagramEngine>(initDiagramEngine());
	const [model, setModel] = React.useState(new DiagramModel());

	React.useEffect(() => {
		const model = new DiagramModel();

		const paramNodes: DataMapperNodeModel[] = [];
		let lastParamY = 0;
		paramTypes.forEach((typeDef, paramName) => {
			const paramNode = new DataMapperNodeModel(paramName, typeDef, true, false);
			paramNode.setPosition(100, lastParamY + 100);
			lastParamY += 300;// Fix this line with proper calculated height of current node
			paramNodes.push(paramNode);
		});
		
		const returnNode = new DataMapperNodeModel(returnType.typeName.value, returnType, false, true);
		returnNode.setPosition(800, 100);

		model.addAll(...paramNodes, returnNode);
		engine.setModel(model);
		setModel(model);
	}, [paramTypes, returnType]);

	return <>
		{engine && engine.getModel() &&
			<DemoCanvasWidget>
				<CanvasWidget engine={engine} />
			</DemoCanvasWidget>
		}
	</>;


};

export default React.memo(DataMapperDiagram);
