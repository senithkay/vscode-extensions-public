import createEngine, { DefaultDiagramState, DiagramEngine, DiagramModel } from '@projectstorm/react-diagrams';
import * as React from 'react';
import "reflect-metadata";
import {container} from "tsyringe";

import { DataMapperNodeModel } from './Node/commons/DataMapperNode';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DataMapperCanvasWidget } from './Canvas/DataMapperCanvasWidget';
import { DefaultState as LinkState } from './LinkState/DefaultState';
import { useDMStore } from '../../store/store';
import { DataMapperLinkModel } from './Link/model/DataMapperLink';
import { DataMapperDIContext } from '../../utils/DataMapperDIContext/DataMapperDIContext';
import * as Nodes from "./Node";
import * as Ports from "./Port";
import * as Links from "./Link";
import * as Labels from "./Label";


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
	const _LAF = Labels;
	// END TODO

	const diContext = container.resolve(DataMapperDIContext);
	const engine = createEngine();

	diContext.nodeFactories.forEach((nf)=> 
		engine.getNodeFactories().registerFactory(nf));
	diContext.portFactories.forEach((pf) =>
		engine.getPortFactories().registerFactory(pf));
	diContext.linkFactories.forEach((lf) =>
		engine.getLinkFactories().registerFactory(lf));
	diContext.labelFactories.forEach((lbf) =>
		engine.getLabelFactories().registerFactory(lbf));

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
		async function genModel() {
			const model = new DiagramModel();
			model.addAll(...nodes);
			for (let i = 0; i < nodes.length; i++) {
				const node = nodes[i];
				node.setModel(model);
				await node.initPorts();
				await node.initLinks();
			}
			engine.setModel(model);
			setModel(model);
        }
        genModel();
	}, [nodes]);

	return <>
		{engine && engine.getModel() &&
			<DataMapperCanvasWidget>
				<CanvasWidget engine={engine} />
			</DataMapperCanvasWidget>
		}
	</>;


};

export default React.memo(DataMapperDiagram);
