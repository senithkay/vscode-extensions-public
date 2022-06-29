import createEngine, { DefaultDiagramState, DefaultLinkModel, DefaultNodeModel, DiagramEngine, DiagramModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import * as React from 'react';
import "reflect-metadata";
import {container} from "tsyringe";

import { DataMapperNodeModel, IDataMapperNodeFactory } from './Node/model/DataMapperNode';
import { DataMapperNodeFactory } from './Node/model/DataMapperNodeFactory';
import { DataMapperPortFactory } from './Port/model/DataMapperPortFactory';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from './Canvas/DemoCanvasWidget';
import { DefaultState as LinkState } from './LinkState/DefaultState';
import { useDMStore } from '../../store/store';
import { DataMapperLinkFactory } from './Link/model/DataMapperLinkFactory';
import { DataMapperLinkModel } from './Link/model/DataMapperLink';
import { DataMapperDIContext } from '../../utils/DataMapperDIContext/DataMapperDIContext';
import * as Nodes from "./Node";
import * as Ports from "./Port";
import * as Links from "./Link";


interface DataMapperDiagramProps {
	nodes?: DataMapperNodeModel[];
	links?: DataMapperLinkModel[];
}

function initDiagramEngine() {
	// START TODO: clear this up
	// this is a hack to load all modules for DI to work properly
	const _NF = Nodes;
	const _PF = Ports;
	const _LF = Links;
	// END TODO

	const diContext = container.resolve(DataMapperDIContext);
	const engine = createEngine();

	diContext.nodeFactories.forEach((nf)=> 
		engine.getNodeFactories().registerFactory(nf));
	engine.getPortFactories().registerFactory(new DataMapperPortFactory());
	engine.getLinkFactories().registerFactory(new DataMapperLinkFactory());

	const state = engine.getStateMachine().getCurrentState();
	if (state instanceof DefaultDiagramState) {
		state.dragNewLink.config.allowLooseLinks = false;
	}

	engine.getStateMachine().pushState(new LinkState());
	return engine;
}

function DataMapperDiagram(props: DataMapperDiagramProps): React.ReactElement {

	const { nodes } = props;
	
	const [engine, setEngine] = React.useState<DiagramEngine>(initDiagramEngine());
	const [model, setModel] = React.useState(new DiagramModel());

	const fnST = useDMStore((state) => state.functionST);

	React.useEffect(() => {
		const model = new DiagramModel();
		model.addAll(...nodes);
		nodes.forEach((node) => {
			node.setModel(model);
			node.initPorts();
			node.initLinks();
		});
		engine.setModel(model);
		setModel(model);
	}, [nodes]);

	return <>
		{engine && engine.getModel() &&
			<DemoCanvasWidget>
				<CanvasWidget engine={engine} />
			</DemoCanvasWidget>
		}
	</>;


};

export default React.memo(DataMapperDiagram);
