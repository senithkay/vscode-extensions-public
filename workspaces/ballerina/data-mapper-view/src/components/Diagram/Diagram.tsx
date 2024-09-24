/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useCallback, useEffect, useState } from 'react';

import { css } from '@emotion/css';
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
import "reflect-metadata";
import { container } from "tsyringe";

import { DataMapperDIContext } from '../../utils/DataMapperDIContext/DataMapperDIContext';
import { ErrorNodeKind } from "../DataMapper/Error/RenderingError";

import { DataMapperCanvasContainerWidget } from './Canvas/DataMapperCanvasContainerWidget';
import { DataMapperCanvasWidget } from './Canvas/DataMapperCanvasWidget';
import * as Labels from "./Label";
import * as Links from "./Link";
import { DataMapperLinkModel } from './Link/model/DataMapperLink';
import { DefaultState as LinkState } from './LinkState/DefaultState';
import * as Nodes from "./Node";
import { DataMapperNodeModel } from './Node/commons/DataMapperNode';
import { LinkConnectorNode } from './Node/LinkConnector';
import { QueryExpressionNode } from './Node/QueryExpression';
import { OverlayLayerFactory } from './OverlayLayer/OverlayLayerFactory';
import { OverriddenLinkLayerFactory } from './OverriddenLinkLayer/LinkLayerFactory';
import * as Ports from "./Port";
import { useDiagramModel, useRepositionedNodes } from '../Hooks';
import { Icon } from '@wso2-enterprise/ui-toolkit';
import { throttle } from 'lodash';
import { defaultModelOptions } from './utils/constants';
import { calculateZoomLevel } from './utils/dm-utils';
import { IONodesScrollCanvasAction } from './Actions/IONodesScrollCanvasAction';

const classes = {
	buttonWrap: css({
		position: 'absolute',
		bottom: 50,
		right: 20
	}),
	iconWrap: css({
		marginBottom: 10,
		background: "var(--vscode-input-background)",
		height: 32,
		width: 32,
		borderRadius: 32,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'pointer',
		transitionDuration: '0.2s',
		'&:hover': { opacity: 0.5 },
	}),
};

interface DataMapperDiagramProps {
	nodes?: DataMapperNodeModel[];
	links?: DataMapperLinkModel[];
	hideCanvas?: boolean;
	onError?: (kind: ErrorNodeKind) => void;
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

	engine.getActionEventBus().registerAction(new IONodesScrollCanvasAction());

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
	const { nodes, hideCanvas, onError } = props;

	const [engine, setEngine] = useState<DiagramEngine>(initDiagramEngine());
	const [diagramModel, setDiagramModel] = useState(new DiagramModel(defaultModelOptions));
	const [screenWidth, setScreenWidth] = useState(window.innerWidth);
	const [, forceUpdate] = useState({});

	const zoomLevel = calculateZoomLevel(screenWidth);

	const repositionedNodes = useRepositionedNodes(nodes, zoomLevel, diagramModel);
	const { updatedModel, isFetching } = useDiagramModel(repositionedNodes, diagramModel, onError, zoomLevel, screenWidth);

	engine.setModel(diagramModel);

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
			engine.getModel().getNodes().forEach((node) => {
				if (node instanceof LinkConnectorNode || node instanceof QueryExpressionNode) {
					node.initLinks();
					const targetPortPosition = node.targetPort?.getPosition();
					if (targetPortPosition) {
						node.setPosition(targetPortPosition.x-150, targetPortPosition.y - 4.5);
						forceUpdate({} as any);
					}
				}
			});
		}
	}, [diagramModel, isFetching, screenWidth]);

	const resetZoomAndOffset = () => {
		const currentModel = engine.getModel();
		currentModel.setZoomLevel(defaultModelOptions.zoom);
		currentModel.setOffset(0, 0);
		engine.setModel(currentModel);
	};

	const handleResize = useCallback(
		throttle(() => {
		  setScreenWidth((prevWidth) => {
			const newScreenWidth = window.innerWidth;
			if (newScreenWidth !== prevWidth) {
			  return newScreenWidth;
			}
			return prevWidth;
		  });
		}, 100), []
	);

	return (
		<>
			{engine && engine.getModel() && (
				<>
					<DataMapperCanvasContainerWidget hideCanvas={hideCanvas}>
						<DataMapperCanvasWidget engine={engine} />
					</DataMapperCanvasContainerWidget>
					<div className={classes.buttonWrap}>
						<div
							className={classes.iconWrap}
							onClick={resetZoomAndOffset}
							data-testid={"reset-zoom"}
						>
							<Icon
								name="cached-round"
								sx={{ height: "fit-content", width: "fit-content" }}
								iconSx={{ fontSize: "18px", color: "var(--vscode-input-placeholderForeground)" }}
							/>
						</div>
						<div
							className={classes.iconWrap}
							onClick={() => void engine.zoomToFitNodes({ margin: 0 })}
							data-testid={"fit-to-screen"}
						>
							
							<Icon
								name="fit-to-screen"
								sx={{ height: "fit-content", width: "fit-content" }}
								iconSx={{ fontSize: "14px", color: "var(--vscode-input-placeholderForeground)" }}
							/>
						</div>
					</div>
				</>
			)}
		</>
	);


}

export default React.memo(DataMapperDiagram);
