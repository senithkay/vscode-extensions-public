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
import { genDagreEngine, generateEngine } from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { NodeFactoryVisitor } from "../visitors/NodeFactoryVisitor";
import { BaseNodeModel } from "./nodes/BaseNode/BaseNodeModel";
import { Flow } from "../utils/types";
import { traverseFlow } from "../utils/ast";
import { NodeLinkModel } from "./NodeLink/NodeLinkModel";
import { OverlayLayerModel } from "./OverlayLoader/OverlayLayerModel";

export interface DiagramProps {
    model: Flow;
}

export function Diagram(props: DiagramProps) {
    const { model } = props;

    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);

    useEffect(() => {
        if (diagramEngine) {
            const { nodes, links } = getDiagramData();
            drawDiagram(nodes, links);
        }
    }, []);

    const getDiagramData = () => {
        // run node visitor
        const nodeVisitor = new NodeFactoryVisitor();
        traverseFlow(model, nodeVisitor);

        const nodes = nodeVisitor.getNodes();
        const links = nodeVisitor.getLinks();
        return { nodes, links };
    };

    const drawDiagram = (nodes: BaseNodeModel[], links: NodeLinkModel[]) => {
        const newDiagramModel = new DiagramModel();
        newDiagramModel.addLayer(new OverlayLayerModel());
        // add nodes and links to the diagram
        newDiagramModel.addAll(...nodes, ...links);

        diagramEngine.setModel(newDiagramModel);
        setDiagramModel(newDiagramModel);

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
            // change canvas position to first node
            const firstNode = newDiagramModel.getNodes().at(0);
            diagramEngine.zoomToFitNodes({nodes: [firstNode], maxZoom: 1});
            diagramEngine.repaintCanvas();
            // update the diagram model state
            setDiagramModel(newDiagramModel);
        }, 1000);
    };

    return (
        <>
            {diagramEngine && diagramModel && (
                <DiagramCanvas>
                    <CanvasWidget engine={diagramEngine} />
                </DiagramCanvas>
            )}
        </>
    );
}
