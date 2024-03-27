/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import {
    DefaultLinkModel,
    DiagramEngine,
    DiagramModel,
    DefaultNodeModel,
} from "@projectstorm/react-diagrams";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import {
    generateEngine,
    hasDiagramZoomAndPosition,
    loadDiagramZoomAndPosition,
    registerListeners,
} from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { traverseFlow } from "../utils/ast";
import { NodeFactoryVisitor } from "../visitors/NodeFactoryVisitor";
import { OverlayLayerModel } from "./OverlayLayer";
import { DiagramContextProvider, DiagramContextState } from "./DiagramContext";
import { Flow } from "../utils/types";

export interface DiagramProps {
    model: Flow;
}

export function Diagram(props: DiagramProps) {
    const { model } = props;
    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);

    useEffect(() => {
        if (diagramEngine) {
            getDiagramData();
            drawDiagram();
        }
    }, [model]);

    const getDiagramData = () => {
        // run node visitor
        const nodeVisitor = new NodeFactoryVisitor();
        traverseFlow(model, nodeVisitor);

        // const nodes = nodeVisitor.getNodes();
        // const links = nodeVisitor.getLinks();

        return {};
    };

    const drawDiagram = () => {
        const newDiagramModel = new DiagramModel();
        newDiagramModel.addLayer(new OverlayLayerModel());
        // add nodes and links to the diagram

        // sample model
        const node1 = new DefaultNodeModel({
            name: "Node 1",
            color: "rgb(0,192,255)",
        });
        node1.setPosition(100, 100);
        const port1 = node1.addOutPort("Out");

        const node2 = new DefaultNodeModel("Node 2", "rgb(192,255,0)");
        const port2 = node2.addInPort("In");
        node2.setPosition(400, 100);

        const link1 = port1.link<DefaultLinkModel>(port2);
        link1.getOptions().testName = "Test";
        link1.addLabel("Hello World!");

        newDiagramModel.addAll(node1, node2, link1);

        diagramEngine.setModel(newDiagramModel);
        setDiagramModel(newDiagramModel);
        registerListeners(diagramEngine);

        setTimeout(() => {
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
                diagramEngine.zoomToFitNodes({
                    nodes: [firstNode],
                    maxZoom: 1,
                });
            }
            diagramEngine.repaintCanvas();
            // update the diagram model state
            setDiagramModel(newDiagramModel);
        }, 1000);
    };

    const context: DiagramContextState = {
        flow: model,
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
