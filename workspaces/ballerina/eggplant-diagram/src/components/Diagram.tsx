/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect } from "react";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { cloneDeep } from "lodash";
import { Switch } from "@wso2-enterprise/ui-toolkit";
import {
    generateEngine,
    hasDiagramZoomAndPosition,
    loadDiagramZoomAndPosition,
    registerListeners,
} from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { Flow, NodeModel, FlowNode, Branch, NodeKind, LineRange } from "../utils/types";
import { traverseFlow } from "../utils/ast";
import { NodeFactoryVisitor } from "../visitors/NodeFactoryVisitor";
import { NodeLinkModel } from "./NodeLink";
import { OverlayLayerModel } from "./OverlayLayer";
import { DiagramContextProvider, DiagramContextState } from "./DiagramContext";
import { SizingVisitor } from "../visitors/SizingVisitor";
import { PositionVisitor } from "../visitors/PositionVisitor";
import { InitVisitor } from "../visitors/InitVisitor";

export interface DiagramProps {
    model: Flow;
    onAddNode?: (parent: FlowNode | Branch, target: LineRange) => void;
    onNodeChange?: (node: FlowNode) => void;
}

export function Diagram(props: DiagramProps) {
    const { model, onAddNode, onNodeChange } = props;
    const [showErrorFlow, setShowErrorFlow] = useState(false);
    const [hasErrorFlow, setHasErrorFlow] = useState(false);
    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);
    const [showComponentPanel, setShowComponentPanel] = useState(false);

    useEffect(() => {
        if (diagramEngine) {
            console.log(">>> diagram engine created");
            const { nodes, links } = getDiagramData();
            drawDiagram(nodes, links);
        }
    }, [model, showErrorFlow]);

    const getDiagramData = () => {
        // TODO: move to a separate function
        // get only do block
        let flowModel = cloneDeep(model);
        console.log(">>> flow model", { flowModel, model });
        const globalErrorHandleBlock = model.nodes.find((node) => node.codedata.node === "ERROR_HANDLER");
        if (globalErrorHandleBlock) {
            setHasErrorFlow(true);
            const branchKind: NodeKind = showErrorFlow ? "ON_FAILURE" : "BODY";
            const subFlow = globalErrorHandleBlock.branches.find((branch) => branch.codedata.node === branchKind);
            if (subFlow) {
                // replace error handler block with success flow
                flowModel.nodes = [model.nodes.at(0), ...subFlow.children];
            }
        } else {
            setHasErrorFlow(false);
        }

        const initVisitor = new InitVisitor(flowModel);
        traverseFlow(flowModel, initVisitor);
        const sizingVisitor = new SizingVisitor();
        traverseFlow(flowModel, sizingVisitor);
        const positionVisitor = new PositionVisitor();
        traverseFlow(flowModel, positionVisitor);
        console.log(">>> flow model", flowModel);
        // create diagram nodes and links
        const nodeVisitor = new NodeFactoryVisitor();
        traverseFlow(flowModel, nodeVisitor);

        const nodes = nodeVisitor.getNodes();
        const links = nodeVisitor.getLinks();

        return { nodes, links };
    };

    const drawDiagram = (nodes: NodeModel[], links: NodeLinkModel[]) => {
        const newDiagramModel = new DiagramModel();
        newDiagramModel.addLayer(new OverlayLayerModel());
        // add nodes and links to the diagram
        newDiagramModel.addAll(...nodes, ...links);

        diagramEngine.setModel(newDiagramModel);
        setDiagramModel(newDiagramModel);
        registerListeners(diagramEngine);

        // setTimeout(() => {
        diagramEngine.setModel(newDiagramModel);
        // remove loader overlay layer
        const overlayLayer = diagramEngine
            .getModel()
            .getLayers()
            .find((layer) => layer instanceof OverlayLayerModel);
        if (overlayLayer) {
            diagramEngine.getModel().removeLayer(overlayLayer);
        }

        const hasPreviousPosition = hasDiagramZoomAndPosition();
        if (hasPreviousPosition) {
            // reset canvas position to previous position
            loadDiagramZoomAndPosition(diagramEngine);
        } else {
            // change canvas position to first node
            const firstNode = newDiagramModel.getNodes().at(0);
            diagramEngine.zoomToFitNodes({ nodes: [firstNode], maxZoom: 1 });
        }
        diagramEngine.repaintCanvas();
        // update the diagram model state
        setDiagramModel(newDiagramModel);
        // }, 100);
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
        onNodeUpdate: onNodeChange,
    };

    return (
        <>
            {hasErrorFlow && (
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
                        top: "52px",
                        right: "20px",
                        zIndex: "2",
                        border: "unset",
                    }}
                    disabled={false}
                />
            )}
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
