
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda no-console
import * as React from 'react';

import { createStyles, makeStyles, Theme } from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';
import { SelectionBoxLayerFactory } from "@projectstorm/react-canvas-core";
import { DagreEngine, DefaultDiagramState, DefaultLabelFactory, DefaultLinkFactory, DefaultNodeFactory, DefaultPortFactory, DiagramEngine, DiagramModel, NodeLayerFactory, PathFindingLinkFactory } from '@projectstorm/react-diagrams';
import "reflect-metadata";
import { container } from "tsyringe";

import FitToScreenIcon from "../../assets/icons/fitToScreen";
import { DataMapperDIContext } from '../../utils/DataMapperDIContext/DataMapperDIContext';

import { DataMapperCanvasContainerWidget } from './Canvas/DataMapperCanvasContainerWidget';
import { DataMapperCanvasWidget } from './Canvas/DataMapperCanvasWidget';
import * as Labels from "./Label";
import * as Links from "./Link";
import { DataMapperLinkModel } from './Link/model/DataMapperLink';
import { DefaultState as LinkState } from './LinkState/DefaultState';
import * as Nodes from "./Node";
import { DataMapperNodeModel } from './Node/commons/DataMapperNode';
import { FromClauseNode } from './Node/FromClause';
import { LetClauseNode } from './Node/LetClause';
import { LetExpressionNode } from "./Node/LetExpression";
import { LinkConnectorNode } from './Node/LinkConnector';
import { ListConstructorNode } from './Node/ListConstructor';
import { MappingConstructorNode } from './Node/MappingConstructor';
import { ModuleVariableNode } from "./Node/ModuleVariable";
import { PrimitiveTypeNode } from './Node/PrimitiveType';
import { QueryExpressionNode } from './Node/QueryExpression';
import { RequiredParamNode } from './Node/RequiredParam';
import { OverlayLayerFactory } from './OverlayLayer/OverlayLayerFactory';
import { OverlayLayerModel } from './OverlayLayer/OverlayLayerModel';
import { OverriddenLinkLayerFactory } from './OverriddenLinkLayer/LinkLayerFactory';
import * as Ports from "./Port";
import { OFFSETS } from './utils/constants';


const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		buttonWrap: {
			position: 'absolute',
			bottom: 10,
			right: 20
		},
		iconWrap: {
			marginBottom: 10,
			background: theme.palette.common.white,
			height: 32,
			width: 32,
			borderRadius: 32,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			cursor: 'pointer',
			boxShadow: '0 1px 1px 0 #cbcfda;',
			transitionDuration: '0.2s',
			'&:hover': { opacity: 0.5 },
		},
		icon: { color: '#8d91a3' }
	}),
);

interface DataMapperDiagramProps {
	nodes?: DataMapperNodeModel[];
	links?: DataMapperLinkModel[];
	hideCanvas?: boolean;
}

const defaultModelOptions = { zoom: 90 }

function initDiagramEngine() {
	// START TODO: clear this up
	// this is a hack to load all modules for DI to work properly
	const _NF = Nodes;
	const _PF = Ports;
	const _LF = Links;
	const _LAF = Labels;
	// END TODO

	const diContext = container.resolve(DataMapperDIContext);

	const engine = new DiagramEngine({
		registerDefaultPanAndZoomCanvasAction: true,
		registerDefaultZoomCanvasAction: false
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

	diContext.nodeFactories.forEach((nf) =>
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
	const classes = useStyles();

	const { nodes, hideCanvas } = props;

	const [engine, setEngine] = React.useState<DiagramEngine>(initDiagramEngine());
	const [model, setModel] = React.useState(new DiagramModel(defaultModelOptions));

	const dagreEngine = new DagreEngine({
		graph: {
			rankdir: 'LR',
			ranksep: 600,
			align: 'UL',
			nodesep: 300,
			ranker: 'longest-path',
			marginx: 30,
			marginy: 50,
			fit: true
		},
	});

	React.useEffect(() => {
		async function genModel() {
			const zoomLevel = model.getZoomLevel();
			const offSetX = model.getOffsetX();
			const offSetY = model.getOffsetY();

			const newModel = new DiagramModel();
			newModel.setZoomLevel(zoomLevel);
			newModel.setOffset(offSetX, offSetY);
			newModel.addAll(...nodes);
			for (const node of nodes) {
				try {
					node.setModel(newModel);
					await node.initPorts();
					node.initLinks();
					engine.repaintCanvas();
				} catch (e) {
					console.error(e)
				}
			}
			newModel.setLocked(true);
			engine.setModel(newModel);
			if (newModel.getLinks().length > 0) {
				dagreEngine.redistribute(newModel);
				await engine.repaintCanvas(true);
			}
			let requiredParamFields = 0;
			let numberOfRequiredParamNodes = 0;
			let additionalSpace = 0;
			nodes.forEach((node) => {
				if (node instanceof MappingConstructorNode
					|| node instanceof ListConstructorNode
					|| node instanceof PrimitiveTypeNode)
				{
					if (Object.values(node.getPorts()).some(port => Object.keys(port.links).length)){
						node.setPosition(OFFSETS.TARGET_NODE.X, 0);
					} else {
						// Bring mapping constructor node close to input node, if it doesn't have any links
						node.setPosition(OFFSETS.TARGET_NODE_WITHOUT_MAPPING.X, 0);
					}
				}
				if (node instanceof LinkConnectorNode || node instanceof QueryExpressionNode) {
					node.updatePosition();
				}
				if (node instanceof RequiredParamNode
					|| node instanceof LetClauseNode
					|| node instanceof LetExpressionNode
					|| node instanceof ModuleVariableNode)
				{
					node.setPosition(OFFSETS.SOURCE_NODE.X, additionalSpace + (requiredParamFields * 40) + OFFSETS.SOURCE_NODE.Y * (numberOfRequiredParamNodes + 1));
					requiredParamFields = requiredParamFields
						+ (node instanceof LetExpressionNode || node instanceof ModuleVariableNode
							? node.numberOfFields + 1
							: node.numberOfFields
						);
					numberOfRequiredParamNodes = numberOfRequiredParamNodes + 1;
				}
				if (node instanceof FromClauseNode) {
					node.setPosition(OFFSETS.SOURCE_NODE.X, additionalSpace + (requiredParamFields * 40) + OFFSETS.SOURCE_NODE.Y * (numberOfRequiredParamNodes + 1) + node.initialYPosition);
					requiredParamFields = requiredParamFields + node.numberOfFields;
					numberOfRequiredParamNodes = numberOfRequiredParamNodes + 1;
					additionalSpace += node.initialYPosition
				}
			});
			newModel.addLayer(new OverlayLayerModel());
			setModel(newModel);
		}
		void genModel();
	}, [nodes]);

	const resetZoomAndOffset = () => {
		const currentModel = engine.getModel();
		currentModel.setZoomLevel(defaultModelOptions.zoom);
		currentModel.setOffset(0, 0);
		engine.setModel(currentModel);
	}

	return (
		<>
			{engine && engine.getModel() && (
				<>
					<DataMapperCanvasContainerWidget hideCanvas={hideCanvas}>
						<DataMapperCanvasWidget engine={engine} />
					</DataMapperCanvasContainerWidget>
					<div className={classes.buttonWrap}>
						<div className={classes.iconWrap} onClick={resetZoomAndOffset}>
							<CachedIcon className={classes.icon} />
						</div>
						<div className={classes.iconWrap} onClick={() => void engine.zoomToFitNodes({ margin: 20 })}>
							<FitToScreenIcon />
						</div>
					</div>
				</>
			)}
		</>
	);


}

export default React.memo(DataMapperDiagram);
