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
import React, { useEffect, useState } from 'react';

import { css } from '@emotion/css';
import CachedIcon from '@material-ui/icons/Cached';
import { SelectionBoxLayerFactory } from "@projectstorm/react-canvas-core";
import {
	DefaultDiagramState,
	DefaultLabelFactory,
	DefaultLinkFactory,
	DefaultNodeFactory,
	DefaultPortFactory,
	DiagramEngine,
	NodeLayerFactory,
	PathFindingLinkFactory
} from "@projectstorm/react-diagrams";
import "reflect-metadata";
import { container } from "tsyringe";

import FitToScreenIcon from "../../assets/icons/fitToScreen";
import { DataMapperDIContext } from '../../utils/DataMapperDIContext/DataMapperDIContext';
import { ErrorNodeKind } from "../DataMapper/Error/DataMapperError";

import { DataMapperCanvasContainerWidget } from './Canvas/DataMapperCanvasContainerWidget';
import { DataMapperCanvasWidget } from './Canvas/DataMapperCanvasWidget';
import * as Labels from "./Label";
import * as Links from "./Link";
import { DataMapperLinkModel } from './Link/model/DataMapperLink';
import { DefaultState as LinkState } from './LinkState/DefaultState';
import * as Nodes from "./Node";
import { DataMapperNodeModel } from './Node/commons/DataMapperNode';
import { EnumTypeNode } from './Node/EnumType';
import { ExpandedMappingHeaderNode } from './Node/ExpandedMappingHeader';
import { FromClauseNode } from './Node/FromClause';
import { JoinClauseNode } from './Node/JoinClause';
import { LetClauseNode } from './Node/LetClause';
import { LetExpressionNode } from "./Node/LetExpression";
import { LinkConnectorNode } from './Node/LinkConnector';
import { ListConstructorNode } from './Node/ListConstructor';
import { MappingConstructorNode } from './Node/MappingConstructor';
import { ModuleVariableNode } from "./Node/ModuleVariable";
import { PrimitiveTypeNode } from './Node/PrimitiveType';
import { QueryExpressionNode } from './Node/QueryExpression';
import { RequiredParamNode } from './Node/RequiredParam';
import { UnionTypeNode } from "./Node/UnionType";
import { UnsupportedExprNodeKind, UnsupportedIONode } from "./Node/UnsupportedIO";
import { OverlayLayerFactory } from './OverlayLayer/OverlayLayerFactory';
import { OverriddenLinkLayerFactory } from './OverriddenLinkLayer/LinkLayerFactory';
import * as Ports from "./Port";
import { OFFSETS } from './utils/constants';
import { useDiagramModel } from '../Hooks';
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
	const { nodes, hideCanvas, onError } = props;
	const [engine, setEngine] = useState<DiagramEngine>(initDiagramEngine());
	const {diagramModel, isFetching, isError} = useDiagramModel(nodes, engine, onError);
	const [model, setModel] = useState(diagramModel);

    useEffect(() => {
        if (!isFetching) {
            setModel(diagramModel);
        }
    }, [isFetching, diagramModel]);

	useEffect(() => {
		if (model) {
			let requiredParamFields = 0;
			let numberOfRequiredParamNodes = 0;
			let additionalSpace = 0;
			setTimeout(async () => {
				nodes.forEach((node) => {
					if (node instanceof MappingConstructorNode
						|| node instanceof ListConstructorNode
						|| node instanceof PrimitiveTypeNode
						|| node instanceof UnionTypeNode
						|| (node instanceof UnsupportedIONode && node.kind === UnsupportedExprNodeKind.Output)) {
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
						|| node instanceof JoinClauseNode
						|| node instanceof LetExpressionNode
						|| node instanceof ModuleVariableNode
						|| node instanceof EnumTypeNode)
					{
						node.setPosition(OFFSETS.SOURCE_NODE.X, additionalSpace + (requiredParamFields * 40) + OFFSETS.SOURCE_NODE.Y * (numberOfRequiredParamNodes + 1));
						const isLetExprNode = node instanceof LetExpressionNode;
						const hasLetVarDecls = isLetExprNode && !!node.letVarDecls.length;
						requiredParamFields = requiredParamFields
							+ (isLetExprNode && !hasLetVarDecls ? 0 : node.numberOfFields);
						numberOfRequiredParamNodes = numberOfRequiredParamNodes + 1;
						additionalSpace += isLetExprNode && !hasLetVarDecls ? 10 : 0;
					}
					if (node instanceof FromClauseNode) {
						requiredParamFields = requiredParamFields + node.numberOfFields;
						numberOfRequiredParamNodes = numberOfRequiredParamNodes + 1;
					}
					if (node instanceof ExpandedMappingHeaderNode) {
						additionalSpace += node.height + OFFSETS.QUERY_MAPPING_HEADER_NODE.MARGIN_BOTTOM;
						node.setPosition(OFFSETS.QUERY_MAPPING_HEADER_NODE.X, OFFSETS.QUERY_MAPPING_HEADER_NODE.Y);
					}
				});
				engine.repaintCanvas();
			}, 30);
		}
	}, [model, isFetching]);

	const resetZoomAndOffset = () => {
		const currentModel = engine.getModel();
		currentModel.setZoomLevel(defaultModelOptions.zoom);
		currentModel.setOffset(0, 0);
		engine.setModel(currentModel);
	}

	return (
		<>
			{engine && engine.getModel() && model && (
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
							onClick={() => void engine.zoomToFitNodes({ margin: 20 })}
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
