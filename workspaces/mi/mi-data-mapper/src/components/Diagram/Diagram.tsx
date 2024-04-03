/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useEffect, useState } from 'react';

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

import { ErrorNodeKind } from "../DataMapper/Error/DataMapperError";
import { DataMapperCanvasContainerWidget } from './Canvas/DataMapperCanvasContainerWidget';
import { DataMapperCanvasWidget } from './Canvas/DataMapperCanvasWidget';
import { DataMapperLinkModel } from './Link/model/DataMapperLink';
import { DefaultState as LinkState } from './LinkState/DefaultState';
import { DataMapperNodeModel } from './Node/commons/DataMapperNode';
import { LinkConnectorNode, LinkConnectorNodeFactory } from './Node/LinkConnector';
import { OverlayLayerFactory } from './OverlayLayer/OverlayLayerFactory';
import { OverriddenLinkLayerFactory } from './OverriddenLinkLayer/LinkLayerFactory';
import { useDiagramModel, useRepositionedNodes } from '../Hooks';
import { debounce } from 'lodash';
import { defaultModelOptions } from './utils/constants';
import { calculateZoomLevel } from './utils/diagram-utils';
import { IONodesScrollCanvasAction } from './Actions/IONodesScrollCanvasAction';
import { IntermediatePortFactory, RecordFieldPortFactory } from './Port';
import { ExpressionLabelFactory } from './Label';
import { DataMapperLinkFactory } from './Link';
import { RightAngleLinkFactory } from './Link/RightAngleLink/RightAngleLinkFactory';
import * as Nodes from "./Node";
import { Icon } from '@wso2-enterprise/ui-toolkit';

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
	engine.getNodeFactories().registerFactory(new Nodes.ExpressionFunctionBodyFactory());
	engine.getNodeFactories().registerFactory(new LinkConnectorNodeFactory());

	engine.getPortFactories().registerFactory(new RecordFieldPortFactory());
	engine.getPortFactories().registerFactory(new IntermediatePortFactory());

	engine.getLabelFactories().registerFactory(new ExpressionLabelFactory());

	engine.getLinkFactories().registerFactory(new DataMapperLinkFactory());
	engine.getLinkFactories().registerFactory(new RightAngleLinkFactory());

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
	const [, forceUpdate] = useState({});

	const zoomLevel = calculateZoomLevel(screenWidth);

	const repositionedNodes = useRepositionedNodes(nodes, zoomLevel, diagramModel);
	const { updatedModel, isFetching } = useDiagramModel(repositionedNodes, diagramModel, onError, zoomLevel);

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
				if (node instanceof LinkConnectorNode) {
					node.initLinks();
					const targetPortPosition = node.targetPort?.getPosition();
					if (targetPortPosition) {
						node.setPosition(targetPortPosition.x - 150, targetPortPosition.y - 4.5);
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

	const handleResize = debounce((e: any) => {
		setScreenWidth(window.innerWidth);
	}, 100);

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
