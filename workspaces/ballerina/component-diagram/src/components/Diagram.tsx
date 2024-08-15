/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect, useLayoutEffect } from "react";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import {
    autoDistribute,
    createNodesLink,
    generateEngine,
    hasDiagramZoomAndPosition,
    loadDiagramZoomAndPosition,
    registerListeners,
    resetDiagramZoomAndPosition,
} from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { Connection, EntryPoint, NodeModel, Project } from "../utils/types";
import { NodeLinkModel } from "./NodeLink";
import { OverlayLayerModel } from "./OverlayLayer";
import { DiagramContextProvider, DiagramContextState } from "./DiagramContext";
import { EntryNodeModel } from "./nodes/EntryNode";
import { ConnectionNodeModel } from "./nodes/ConnectionNode";

export interface DiagramProps {
    project: Project;
    onAddEntryPoint: () => void;
    onAddConnection: () => void;
    onEntryPointSelect: (entryPoint: EntryPoint) => void;
    onConnectionSelect: (connection: Connection) => void;
}

export function Diagram(props: DiagramProps) {
    const { project } = props;
    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);

    useEffect(() => {
        if (diagramEngine) {
            console.log(">>> diagram engine created");
            const { nodes, links } = getDiagramData();
            drawDiagram(nodes, links);
            autoDistribute(diagramEngine);
        }
    }, [project]);

    const getDiagramData = () => {
        // generate diagram nodes and links
        const nodes: NodeModel[] = [];
        const links: NodeLinkModel[] = [];

        // create entry nodes
        project.entryPoints.forEach((entryPoint) => {
            const node = new EntryNodeModel(entryPoint);
            nodes.push(node);
        });

        // create connection nodes
        project.connections.forEach((connection) => {
            const node = new ConnectionNodeModel(connection);
            nodes.push(node);
        });

        // create new connection node
        const node = new ConnectionNodeModel({ id: "new-connection", name: "New Connection" });
        nodes.push(node);

        // create links between entry and connection nodes
        // entry node will link to all connection nodes except the new connection node
        project.entryPoints.forEach((entryPoint) => {
            const entryNode = nodes.find((node) => node.getID() === entryPoint.id);
            if (entryNode) {
                nodes
                    .filter((node) => node instanceof ConnectionNodeModel && node.getID() !== "new-connection")
                    .forEach((connectionNode) => {
                        const link = createNodesLink(entryNode, connectionNode);
                        if (link) {
                            links.push(link);
                        }
                    });
            }
        });


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

        diagramEngine.setModel(newDiagramModel);
        // remove loader overlay layer
        const overlayLayer = diagramEngine
            .getModel()
            .getLayers()
            .find((layer) => layer instanceof OverlayLayerModel);
        if (overlayLayer) {
            diagramEngine.getModel().removeLayer(overlayLayer);
        }

        diagramEngine.repaintCanvas();
        // update the diagram model state
        setDiagramModel(newDiagramModel);
    };

    const context: DiagramContextState = {
        project: project,
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
