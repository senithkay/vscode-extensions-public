/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useEffect, useRef, useState } from 'react';

import { SelectionBoxLayerFactory } from "@projectstorm/react-canvas-core";
import {
	DefaultDiagramState,
	DefaultLabelFactory,
	DefaultLinkFactory,
	DefaultNodeFactory,
	DefaultPortFactory,
	DiagramEngine,
	DiagramModel,
	NodeLayerFactory,
	PathFindingLinkFactory
} from "@projectstorm/react-diagrams";

import { ErrorNodeKind } from "../DataMapper/Error/DataMapperError";
import { DataMapperCanvasContainerWidget } from './Canvas/DataMapperCanvasContainerWidget';
import { DataMapperCanvasWidget } from './Canvas/DataMapperCanvasWidget';
import { DefaultState as LinkState } from './LinkState/DefaultState';
import { DataMapperNodeModel } from './Node/commons/DataMapperNode';
import { LinkConnectorNode } from './Node/LinkConnector';
import { ArrayFnConnectorNode } from './Node/ArrayFnConnector';
import { OverlayLayerFactory } from './OverlayLayer/OverlayLayerFactory';
import { OverriddenLinkLayerFactory } from './OverriddenLinkLayer/LinkLayerFactory';
import { useDiagramModel, useRepositionedNodes, useSearchScrollReset } from '../Hooks';
import { throttle } from 'lodash';
import { defaultModelOptions } from './utils/constants';
import { calculateZoomLevel } from './utils/diagram-utils';
import { IONodesScrollCanvasAction } from './Actions/IONodesScrollCanvasAction';
import { useDMArrayFilterStore, useDMExpressionBarStore, useDMSearchStore } from '../../store/store';
import { isOutputNode } from './Actions/utils';
import { InputOutputPortModel } from './Port';
import * as Nodes from "./Node";
import * as Ports from "./Port";
import * as Labels from "./Label";
import * as Links from "./Link";

interface DataMapperDiagramProps {
	nodes?: DataMapperNodeModel[];
	hideCanvas?: boolean;
	onError?: (kind: ErrorNodeKind) => void;
}

function initDiagramEngine() {
	const engine = new DiagramEngine({
		registerDefaultPanAndZoomCanvasAction: false,
		registerDefaultZoomCanvasAction: false,
	});

	// register model factories
	engine.getLayerFactories().registerFactory(new NodeLayerFactory());
	engine.getLayerFactories().registerFactory(new OverriddenLinkLayerFactory());
	engine.getLayerFactories().registerFactory(new SelectionBoxLayerFactory());

	engine.getLabelFactories().registerFactory(new DefaultLabelFactory());
	engine.getNodeFactories().registerFactory(new DefaultNodeFactory());
	engine.getLinkFactories().registerFactory(new DefaultLinkFactory());
	engine.getLinkFactories().registerFactory(new PathFindingLinkFactory());
	engine.getPortFactories().registerFactory(new DefaultPortFactory());

	// register the default interaction behaviours
	engine.getStateMachine().pushState(new DefaultDiagramState());
	engine.getLayerFactories().registerFactory(new OverlayLayerFactory());

	engine.getNodeFactories().registerFactory(new Nodes.InputNodeFactory());
	engine.getNodeFactories().registerFactory(new Nodes.FocusedInputNodeFactory());
	engine.getNodeFactories().registerFactory(new Nodes.ArrayOutputNodeFactory());
	engine.getNodeFactories().registerFactory(new Nodes.ObjectOutputNodeFactory());
	engine.getNodeFactories().registerFactory(new Nodes.PrimitiveOutputNodeFactory());
	engine.getNodeFactories().registerFactory(new Nodes.UnionOutputNodeFactory());
	engine.getNodeFactories().registerFactory(new Nodes.LinkConnectorNodeFactory());
	engine.getNodeFactories().registerFactory(new Nodes.ArrayFnConnectorNodeFactory());
	engine.getNodeFactories().registerFactory(new Nodes.ArrayFilterNodeFactory());
	engine.getNodeFactories().registerFactory(new Nodes.DataImportNodeFactory());
	engine.getNodeFactories().registerFactory(new Nodes.SubMappingNodeFactory());
	engine.getNodeFactories().registerFactory(new Nodes.UnsupportedIONodeFactory());

	engine.getPortFactories().registerFactory(new Ports.InputOutputPortFactory());
	engine.getPortFactories().registerFactory(new Ports.IntermediatePortFactory());

	engine.getLabelFactories().registerFactory(new Labels.ExpressionLabelFactory());

	engine.getLinkFactories().registerFactory(new Links.DataMapperLinkFactory());
	engine.getLinkFactories().registerFactory(new Links.ArrowLinkFactory());

	engine.getActionEventBus().registerAction(new IONodesScrollCanvasAction());

	const state = engine.getStateMachine().getCurrentState();
	if (state instanceof DefaultDiagramState) {
		state.dragNewLink.config.allowLooseLinks = false;
	}

	engine.getStateMachine().pushState(new LinkState());
	return engine;
}

function DataMapperDiagram(props: DataMapperDiagramProps): React.ReactElement {
	const { nodes, hideCanvas, onError } = props;

	const [engine, setEngine] = useState<DiagramEngine>(initDiagramEngine());
	const [diagramModel, setDiagramModel] = useState(new DiagramModel(defaultModelOptions));
	const [screenWidth, setScreenWidth] = useState(window.innerWidth);
	const getScreenWidthRef = useRef(() => screenWidth);
	const devicePixelRatioRef = useRef(window.devicePixelRatio);
	
	const [filtersCollapsedChanged, setFiltersCollapsedChanged] = useState(false);
	const [, forceUpdate] = useState({});

	const filtersCollapsed = useDMArrayFilterStore(state => state.isCollapsed);
	const { inputSearch, outputSearch } = useDMSearchStore.getState();

	useEffect(() => {
		setFiltersCollapsedChanged(prev => !prev); // Toggle the state to trigger repositioning
	}, [filtersCollapsed]);

	useEffect(() => {
		engine.getStateMachine().pushState(new LinkState(true));
	}, [inputSearch, outputSearch]);

	const zoomLevel = calculateZoomLevel(screenWidth);

	const repositionedNodes = useRepositionedNodes(nodes, zoomLevel, diagramModel, filtersCollapsedChanged);
	const { updatedModel, isFetching } = useDiagramModel(repositionedNodes, diagramModel, onError, zoomLevel, screenWidth);
	useSearchScrollReset(diagramModel);

	engine.setModel(diagramModel);

	useEffect(() => {
		getScreenWidthRef.current = () => screenWidth;
	}, [screenWidth]);

	const handleResize = throttle(() => {
		const newScreenWidth = window.innerWidth;
		const newDevicePixelRatio = window.devicePixelRatio;

		if (newDevicePixelRatio === devicePixelRatioRef.current && newScreenWidth !== getScreenWidthRef.current()) {
			setScreenWidth(newScreenWidth);
		}
		devicePixelRatioRef.current = newDevicePixelRatio;
	}, 100);

	useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

	useEffect(() => {
        if (!isFetching) {
            setDiagramModel(updatedModel);
        }
    }, [isFetching, updatedModel]);

	useEffect(() => {
		if (!isFetching && engine.getModel()) {
			const modelNodes = engine.getModel().getNodes();
			const nodesToUpdate = modelNodes.filter(node => 
				node instanceof LinkConnectorNode || node instanceof ArrayFnConnectorNode
			);

			nodesToUpdate.forEach((node: LinkConnectorNode | ArrayFnConnectorNode) => {
				node.initLinks();
				const targetPortPosition = node.targetPort?.getPosition();
				if (targetPortPosition) {
					node.setPosition(targetPortPosition.x - 180, targetPortPosition.y - 6.5);
				}
			});
	
			if (nodesToUpdate.length > 0) {
				forceUpdate({});
			}

			// Update the expression bar focused output port if any
			const focusedPort = useDMExpressionBarStore.getState().focusedPort;
			const outputPorts = (modelNodes.find(node => isOutputNode(node)) as DataMapperNodeModel)?.getPorts();
			const outputPortEntries = outputPorts ? Object.entries(outputPorts) : [];
			outputPortEntries.forEach((entry) => {
				const port = entry[1] as InputOutputPortModel;
				if (port.getName() === focusedPort?.getName() && port.getID() !== focusedPort?.getID()) {
					useDMExpressionBarStore.getState().setFocusedPort(port);
				}
			});
		}
	}, [diagramModel, isFetching, screenWidth]);

	return (
		<>
			{engine && engine.getModel() && (
				<DataMapperCanvasContainerWidget hideCanvas={hideCanvas}>
					<DataMapperCanvasWidget engine={engine} />
				</DataMapperCanvasContainerWidget>
			)}
		</>
	);
}

export default React.memo(DataMapperDiagram);
