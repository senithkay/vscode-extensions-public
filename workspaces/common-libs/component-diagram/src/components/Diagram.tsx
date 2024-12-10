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
    autoDistribute,
    createNodesLink,
    generateEngine,
    getModelId,
    getNodeId,
    loadDiagramZoomAndPosition,
    resetDiagramZoomAndPosition,
} from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { Connection, EntryPoint, NodeModel, Project } from "../utils/types";
import { NodeLinkModel } from "./NodeLink";
import { OverlayLayerModel } from "./OverlayLayer";
import { DiagramContextProvider, DiagramContextState } from "./DiagramContext";
import { EntryNodeModel } from "./nodes/EntryNode";
import { ConnectionNodeModel } from "./nodes/ConnectionNode";
import { ActorNodeModel } from "./nodes/ActorNode/ActorNodeModel";
import { ACTOR_SUFFIX, NEW_CONNECTION, NEW_ENTRY, NodeTypes } from "../resources/constants";
import Controls from "./Controls";

export interface DiagramProps {
    project: Project;
    onAddEntryPoint: () => void;
    onAddConnection: () => void;
    onEntryPointSelect: (entryPoint: EntryPoint) => void;
    onConnectionSelect: (connection: Connection) => void;
    onDeleteComponent: (component: EntryPoint | Connection) => void;
}

export function Diagram(props: DiagramProps) {
    const { project, onAddEntryPoint, onAddConnection, onEntryPointSelect, onConnectionSelect, onDeleteComponent } =
        props;
    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);

    useEffect(() => {
        if (diagramEngine) {
            const { nodes, links } = getDiagramData();
            drawDiagram(nodes, links);
            autoDistribute(diagramEngine);
        }
    }, [project]);

    useEffect(() => {
        const handleResize = () => {
            if (diagramEngine?.getCanvas()?.getBoundingClientRect) {
                diagramEngine.zoomToFitNodes({ margin: 40, maxZoom: 1 });
                diagramEngine.repaintCanvas();
            }
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [diagramEngine, diagramModel]);

    const getDiagramData = () => {
        // generate diagram nodes and links
        const nodes: NodeModel[] = [];
        const links: NodeLinkModel[] = [];

        // create entry nodes
        project.entryPoints.forEach((entryPoint) => {
            const node = new EntryNodeModel(entryPoint);
            nodes.push(node);
            // add actor node for each entry node
            const actorNode = new ActorNodeModel({ ...entryPoint, id: node.getID() + ACTOR_SUFFIX });
            nodes.push(actorNode);
            // create link between entry and actor nodes
            const link = createNodesLink(actorNode, node, { visible: true });
            if (link) {
                links.push(link);
            }
        });

        // if there are no entry nodes, create a new entry node
        // if (project.entryPoints.length === 0) {
        //     const node = new EntryNodeModel({ id: NEW_ENTRY, name: "New Entry Point", type: "service" });
        //     nodes.push(node);
        //     // add actor node for new entry node
        //     const actorNode = new ActorNodeModel({ ...node.node, id: NEW_ENTRY + ACTOR_SUFFIX });
        //     nodes.push(actorNode);
        //     // create link between entry and actor nodes
        //     const link = createNodesLink(actorNode, node);
        //     if (link) {
        //         links.push(link);
        //     }
        // }

        // create connection nodes
        project.connections.forEach((connection) => {
            const node = new ConnectionNodeModel(connection);
            nodes.push(node);
        });

        // create new connection node
        // const node = new ConnectionNodeModel({ id: NEW_CONNECTION, name: "New Connection" });
        // nodes.push(node);

        // create new component add button node
        // const node = new ButtonNodeModel({ id: NEW_COMPONENT, name: "New Component" });
        // nodes.push(node);

        // create links between entry and connection nodes
        project.entryPoints.forEach((entryPoint) => {
            const entryNode = nodes.find((node) => node.getID() === getNodeId(NodeTypes.ENTRY_NODE, entryPoint.id));
            if (entryNode) {
                nodes
                    .filter((node) => node instanceof ConnectionNodeModel && node.getID() !== NEW_CONNECTION)
                    .forEach((connectionNode) => {
                        const link = createNodesLink(entryNode, connectionNode, {
                            visible: entryPoint.connections?.includes(getModelId(connectionNode.getID())),
                        });
                        if (link) {
                            links.push(link);
                        }
                    });
            }
        });

        // create link between new entry and connection nodes
        const newEntryNode = nodes.find((node) => node.getID() === NEW_ENTRY);
        const newConnectionNode = nodes.find((node) => node.getID() === NEW_CONNECTION);
        if (newEntryNode && newConnectionNode) {
            const link = createNodesLink(newEntryNode, newConnectionNode);
            if (link) {
                links.push(link);
            }
        }

        // create link between new connection and first entry node
        const firstEntryNode = nodes.find((node) => node instanceof EntryNodeModel);
        if (newConnectionNode && firstEntryNode && project.connections.length === 0) {
            const link = createNodesLink(firstEntryNode, newConnectionNode);
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
        // registerListeners(diagramEngine);

        diagramEngine.setModel(newDiagramModel);

        // diagram paint with timeout
        setTimeout(() => {
            // remove loader overlay layer
            const overlayLayer = diagramEngine
                .getModel()
                .getLayers()
                .find((layer) => layer instanceof OverlayLayerModel);
            if (overlayLayer) {
                diagramEngine.getModel().removeLayer(overlayLayer);
            }
            if (diagramEngine?.getCanvas()?.getBoundingClientRect) {
                diagramEngine.zoomToFitNodes({ margin: 40, maxZoom: 1 });
            }
        }, 200);
    };

    const context: DiagramContextState = {
        project,
        onAddEntryPoint,
        onAddConnection,
        onEntryPointSelect,
        onConnectionSelect,
        onDeleteComponent,
    };

    return (
        <>
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
