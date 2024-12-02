/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect, useRef } from "react";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { cloneDeep } from "lodash";
import { Switch } from "@wso2-enterprise/ui-toolkit";

import {
    clearDiagramZoomAndPosition,
    generateEngine,
    hasDiagramZoomAndPosition,
    loadDiagramZoomAndPosition,
    registerListeners,
    resetDiagramZoomAndPosition,
} from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { Flow, NodeModel, FlowNode, Branch, NodeKind, LineRange, NodePosition, FlowNodeStyle } from "../utils/types";
import { traverseFlow } from "../utils/ast";
import { NodeFactoryVisitor } from "../visitors/NodeFactoryVisitor";
import { NodeLinkModel } from "./NodeLink";
import { OverlayLayerModel } from "./OverlayLayer";
import { DiagramContextProvider, DiagramContextState } from "./DiagramContext";
import { SizingVisitor } from "../visitors/SizingVisitor";
import { PositionVisitor } from "../visitors/PositionVisitor";
import { InitVisitor } from "../visitors/InitVisitor";
import { LinkTargetVisitor } from "../visitors/LinkTargetVisitor";
import { NODE_WIDTH, NodeTypes } from "../resources/constants";
import Controls from "./Controls";
import { CurrentBreakpointsResponse as BreakpointInfo } from "@wso2-enterprise/ballerina-core";

export interface DiagramProps {
    model: Flow;
    onAddNode: (parent: FlowNode | Branch, target: LineRange) => void;
    onDeleteNode: (node: FlowNode) => void;
    onAddComment: (comment: string, target: LineRange) => void;
    onNodeSelect: (node: FlowNode) => void;
    addBreakpoint: (node: FlowNode) => void;
    removeBreakpoint: (node: FlowNode) => void;
    onConnectionSelect: (connectionName: string) => void;
    goToSource: (node: FlowNode) => void;
    openView?: (filePath: string, position: NodePosition) => void;
    // ai suggestions callbacks
    suggestions?: {
        fetching: boolean;
        onAccept(): void;
        onDiscard(): void;
    };
    projectPath?: string;
    breakpointInfo?: BreakpointInfo;
}

export function Diagram(props: DiagramProps) {
    const {
        model,
        onAddNode,
        onDeleteNode,
        onAddComment,
        onNodeSelect,
        onConnectionSelect,
        goToSource,
        openView,
        suggestions,
        projectPath,
        addBreakpoint,
        removeBreakpoint,
        breakpointInfo
    } = props;

    const [showErrorFlow, setShowErrorFlow] = useState(false);
    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);
    const [showComponentPanel, setShowComponentPanel] = useState(false);
    const hasErrorFlow = useRef(false);

    useEffect(() => {
        if (diagramEngine) {
            const { nodes, links } = getDiagramData();
            drawDiagram(nodes, links);
        }
    }, [model, showErrorFlow]);

    useEffect(() => {
        return () => {
            console.log(">>> clear diagram position and zoom");
            clearDiagramZoomAndPosition();
        };
    }, []);

    const getDiagramData = () => {
        // TODO: move to a separate function
        // get only do block
        let flowModel = cloneDeep(model);
        console.log(">>> rearranged diagram model", { new: flowModel, original: model });
        const globalErrorHandleBlock = model.nodes.find((node) => node.codedata.node === "ERROR_HANDLER");
        if (globalErrorHandleBlock) {
            hasErrorFlow.current = true;
            const branchKind: NodeKind = showErrorFlow ? "ON_FAILURE" : "BODY";
            const subFlow = globalErrorHandleBlock.branches.find((branch) => branch.codedata.node === branchKind);
            if (subFlow) {
                // replace error handler block with success flow
                flowModel.nodes = [model.nodes.at(0), ...subFlow.children];
            }
        } else {
            hasErrorFlow.current = false;
        }

        const initVisitor = new InitVisitor(flowModel);
        traverseFlow(flowModel, initVisitor);
        const sizingVisitor = new SizingVisitor();
        traverseFlow(flowModel, sizingVisitor);
        const positionVisitor = new PositionVisitor();
        traverseFlow(flowModel, positionVisitor);
        // create diagram nodes and links
        const nodeVisitor = new NodeFactoryVisitor(breakpointInfo);
        traverseFlow(flowModel, nodeVisitor);

        const nodes = nodeVisitor.getNodes();
        const links = nodeVisitor.getLinks();

        const addTargetVisitor = new LinkTargetVisitor(
            model,
            nodes,
            hasErrorFlow.current ? (showErrorFlow ? "On Failure" : "Body") : undefined
        );
        traverseFlow(flowModel, addTargetVisitor);

        return { nodes, links };
    };

    const drawDiagram = (nodes: NodeModel[], links: NodeLinkModel[]) => {
        const newDiagramModel = new DiagramModel();
        newDiagramModel.addLayer(new OverlayLayerModel());
        // add nodes and links to the diagram

        // get code block nodes from nodes
        const codeBlockNodes = nodes.filter((node) => node.getType() === NodeTypes.CODE_BLOCK_NODE);
        // get all other nodes
        const otherNodes = nodes.filter((node) => node.getType() !== NodeTypes.CODE_BLOCK_NODE);

        newDiagramModel.addAll(...codeBlockNodes);
        newDiagramModel.addAll(...otherNodes, ...links);

        diagramEngine.setModel(newDiagramModel);
        setDiagramModel(newDiagramModel);
        registerListeners(diagramEngine);

        diagramEngine.setModel(newDiagramModel);
        // remove loader overlay layer
        const overlayLayer = diagramEngine
            .getModel()
            .getLayers()
            .find((layer) => layer instanceof OverlayLayerModel);
        if (overlayLayer) {
            diagramEngine.getModel().removeLayer(overlayLayer);
        }

        if (nodes.length < 3 || !hasDiagramZoomAndPosition(model.fileName)) {
            resetDiagramZoomAndPosition(model.fileName);
        }
        loadDiagramZoomAndPosition(diagramEngine);

        diagramEngine.repaintCanvas();
        // update the diagram model state
        setDiagramModel(newDiagramModel);
    };

    const handleCloseComponentPanel = () => {
        setShowComponentPanel(false);
    };

    const handleShowComponentPanel = () => {
        setShowComponentPanel(true);
    };

    const toggleDiagramFlow = () => {
        setShowErrorFlow(!showErrorFlow);
    };

    const context: DiagramContextState = {
        flow: model,
        componentPanel: {
            visible: showComponentPanel,
            show: handleShowComponentPanel,
            hide: handleCloseComponentPanel,
        },
        showErrorFlow: showErrorFlow,
        onAddNode: onAddNode,
        onDeleteNode: onDeleteNode,
        onAddComment: onAddComment,
        onNodeSelect: onNodeSelect,
        addBreakpoint: addBreakpoint,
        removeBreakpoint: removeBreakpoint,
        onConnectionSelect: onConnectionSelect,
        goToSource: goToSource,
        openView: openView,
        suggestions: suggestions,
        projectPath: projectPath,
    };

    return (
        <>
            {hasErrorFlow.current && (
                <Switch
                    leftLabel="Flow"
                    rightLabel="On Error"
                    checked={showErrorFlow}
                    checkedColor="var(--vscode-button-background)"
                    enableTransition={true}
                    onChange={toggleDiagramFlow}
                    sx={{
                        margin: "auto",
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        zIndex: "2",
                        border: "unset",
                    }}
                    disabled={false}
                />
            )}
            <Controls engine={diagramEngine} />
            {diagramEngine && diagramModel && (
                <DiagramContextProvider value={context}>
                    <DiagramCanvas>
                        <CanvasWidget engine={diagramEngine} />
                    </DiagramCanvas>
                </DiagramContextProvider>
            )}
        </>
    );
}
