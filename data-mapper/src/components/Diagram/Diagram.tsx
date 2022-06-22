import createEngine, { DefaultDiagramState, DefaultLinkModel, DefaultNodeModel, DiagramEngine, DiagramModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import * as React from 'react';

import { DataMapperNodeModel } from './Node/model/DataMapperNode';
import { DataMapperNodeFactory } from './Node/model/DataMapperNodeFactory';
import { DataMapperPortFactory } from './Port/model/DataMapperPortFactory';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from './Canvas/DemoCanvasWidget';
import { DefaultState as LinkState } from './LinkState/DefaultState';
import { useDMStore } from '../../store/store';
import { DataMapperLinkFactory } from './Link/model/DataMapperLinkFactory';
import { DataMapperLinkModel } from './Link/model/DataMapperLink';

interface DataMapperDiagramProps {
	nodes?: DataMapperNodeModel[];
	links?: DataMapperLinkModel[];
}

function initDiagramEngine() {
	const engine = createEngine();

	engine.getPortFactories().registerFactory(new DataMapperPortFactory());
	engine.getNodeFactories().registerFactory(new DataMapperNodeFactory());
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
