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
    createNodesLink,
    genDagreEngine,
    generateEngine,
    hasDiagramZoomAndPosition,
    loadDiagramZoomAndPosition,
    registerListeners,
} from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { Flow, NodeKind, NodeModel, TargetMetadata, Node as EggplantNode } from "../utils/types";
import { traverseFlow } from "../utils/ast";
import { NodeFactoryVisitor } from "../visitors/NodeFactoryVisitor";
import { NodeLinkModel } from "./NodeLink";
import { OverlayLayerModel } from "./OverlayLayer";
import { DiagramContextProvider, DiagramContextState } from "./DiagramContext";
import { EmptyNodeModel } from "./nodes/EmptyNode";
import { ComponentList, ComponentPanel } from "./ComponentPanel";

export interface DiagramProps {
    model: Flow;
    onAddNode?: (kind: NodeKind, target: TargetMetadata) => void;
    onNodeChange?: (node: EggplantNode) => void;
}

export function Diagram(props: DiagramProps) {
    const { model, onAddNode } = props;
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
        // run node visitor
        const nodeVisitor = new NodeFactoryVisitor();
        traverseFlow(model, nodeVisitor);

        const nodes = nodeVisitor.getNodes();
        const links = nodeVisitor.getLinks();

        // add plus link to last node
        const lastNode = nodeVisitor.getLastNodeModel();
        if (lastNode) {
            const lastEmptyNode = new EmptyNodeModel("last-empty-node", false);
            nodes.push(lastEmptyNode);
            const link = createNodesLink(lastNode, lastEmptyNode, { showArrow: true });
            if (link) {
                links.push(link);
            }
        }

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
            const dagreEngine = genDagreEngine();
            dagreEngine.redistribute(newDiagramModel);
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
        }, 1000);
    };

    const handleCloseComponentPanel = () => {
        setShowComponentPanel(false);
    };

    const handleShowComponentPanel = () => {
        setShowComponentPanel(true);
    };

    const handleAddNode = (kind: NodeKind, target: TargetMetadata) => {
        console.log("Add node", { kind, target });
        onAddNode && onAddNode(kind, target);
    };

    const context: DiagramContextState = {
        flow: model,
        componentPanel: {
            visible: showComponentPanel,
            show: handleShowComponentPanel,
            hide: handleCloseComponentPanel,
        },
        addNode: {},
    };

    return (
        <>
            {diagramEngine && diagramModel && (
                <DiagramContextProvider value={context}>
                    <DiagramCanvas>
                        <CanvasWidget engine={diagramEngine} />
                    </DiagramCanvas>
                    <ComponentPanel show={showComponentPanel} onClose={handleCloseComponentPanel}>
                        <ComponentList onAddNode={handleAddNode} />
                    </ComponentPanel>
                </DiagramContextProvider>
            )}
        </>
    );
}
