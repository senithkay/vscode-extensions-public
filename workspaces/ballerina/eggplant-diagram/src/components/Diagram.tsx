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
import {
    generateEngine,
    hasDiagramZoomAndPosition,
    loadDiagramZoomAndPosition,
    registerListeners,
} from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { Flow, NodeModel, Node } from "../utils/types";
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
    onAddNode?: (parent: Node) => void;
    onNodeChange?: (node: Node) => void;
}

export function Diagram(props: DiagramProps) {
    const { model, onAddNode, onNodeChange } = props;
    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);
    const [showComponentPanel, setShowComponentPanel] = useState(false);

    useEffect(() => {
        if (diagramEngine) {
            const { nodes, links } = getDiagramData();
            drawDiagram(nodes, links);
        }
    }, [model]);

    const getDiagramData = () => {

        // TODO: move to a separate function
        // get only do block
        let flowModel = model;
        const globalErrorHandleBlock = model.nodes.find((node)=> node.kind === "ERROR_HANDLER");
        if (globalErrorHandleBlock) {
            const successFlow = globalErrorHandleBlock.branches.find((branch) => branch.label === "Body");
            if (successFlow) {
                // replace error handler block with success flow
                flowModel.nodes = [model.nodes.at(0), ...successFlow.children];
            }
        }

        const initVisitor = new InitVisitor(flowModel);
        traverseFlow(flowModel, initVisitor);
        const sizingVisitor = new SizingVisitor();
        traverseFlow(flowModel, sizingVisitor);
        const positionVisitor = new PositionVisitor();
        traverseFlow(flowModel, positionVisitor);
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

        setTimeout(() => {
            // const dagreEngine = genDagreEngine();
            // dagreEngine.redistribute(newDiagramModel);
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
        }, 500);
    };

    const handleCloseComponentPanel = () => {
        setShowComponentPanel(false);
    };

    const handleShowComponentPanel = () => {
        setShowComponentPanel(true);
    };

    const context: DiagramContextState = {
        flow: model,
        componentPanel: {
            visible: showComponentPanel,
            show: handleShowComponentPanel,
            hide: handleCloseComponentPanel,
        },
        onAddNode: onAddNode,
        onNodeUpdate: onNodeChange,
    };

    return (
        <>
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
