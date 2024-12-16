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
import { autoDistribute, createNodesLink, generateEngine, sortItems } from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { NodeModel } from "../utils/types";
import { NodeLinkModel } from "./NodeLink";
import { OverlayLayerModel } from "./OverlayLayer";
import { DiagramContextProvider, DiagramContextState } from "./DiagramContext";
import Controls from "./Controls";
import { CDAutomation, CDConnection, CDListener, CDModel, CDService } from "@wso2-enterprise/ballerina-core";
import { EntryNodeModel } from "./nodes/EntryNode";
import { ListenerNodeModel } from "./nodes/ListenerNode";
import { ConnectionNodeModel } from "./nodes/ConnectionNode";
import { AUTOMATION_LISTENER } from "../resources/constants";

export interface DiagramProps {
    project: CDModel;
    onListenerSelect: (listener: CDListener) => void;
    onServiceSelect: (service: CDService) => void;
    onAutomationSelect: (automation: CDAutomation) => void;
    onConnectionSelect: (connection: CDConnection) => void;
    onDeleteComponent: (component: CDListener | CDService | CDAutomation | CDConnection) => void;
}

export function Diagram(props: DiagramProps) {
    const { project, onListenerSelect, onServiceSelect, onAutomationSelect, onConnectionSelect, onDeleteComponent } =
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
        const nodes: NodeModel[] = [];
        const links: NodeLinkModel[] = [];

        // Sort and create connections
        const sortedConnections = sortItems(project.connections || []) as CDConnection[];
        sortedConnections.forEach((connection, index) => {
            const node = new ConnectionNodeModel(connection);
            // Set initial Y position for connections
            node.setPosition(0, 100 + index * 100);
            nodes.push(node);
        });

        // Sort services by sortText before creating nodes
        const sortedServices = sortItems(project.services || []) as CDService[];

        // create services with initial positions
        const startY = 100;
        const verticalGap = 100;

        sortedServices.forEach((service, index) => {
            const node = new EntryNodeModel(service, "service");
            // Set initial Y position based on sorted order
            node.setPosition(0, startY + index * verticalGap);
            nodes.push(node);

            service.connections.forEach((connectionUuid) => {
                const connectionNode = nodes.find((node) => node.getID() === connectionUuid);
                if (connectionNode) {
                    const link = createNodesLink(node, connectionNode);
                    if (link) {
                        links.push(link);
                    }
                }
            });
        });

        // create automation
        const automation = project.automation;
        if (automation) {
            const automationNode = new EntryNodeModel(automation, "automation");
            nodes.push(automationNode);
            // link connections
            automation.connections.forEach((connectionUuid) => {
                const connectionNode = nodes.find((node) => node.getID() === connectionUuid);
                if (connectionNode) {
                    const link = createNodesLink(automationNode, connectionNode);
                    if (link) {
                        links.push(link);
                    }
                }
            });
            // add listener to the automation
            const listenerNode = new ListenerNodeModel({
                symbol: "",
                location: automation.location,
                attachedServices: [automation.uuid],
                kind: "ANON",
                type: AUTOMATION_LISTENER,
                args: [],
                uuid: automation.uuid + "-listener",
                icon: "",
                enableFlowModel: false,
                sortText: "",
            });
            nodes.push(listenerNode);
            // link automation to the listener
            const link = createNodesLink(listenerNode, automationNode);
            if (link) {
                links.push(link);
            }
        }

        // create listeners
        project.listeners?.forEach((listener) => {
            const node = new ListenerNodeModel(listener);
            nodes.push(node);
            // link services
            listener.attachedServices.forEach((serviceUuid) => {
                const serviceNode = nodes.find((node) => node.getID() === serviceUuid);
                if (serviceNode) {
                    const link = createNodesLink(node, serviceNode);
                    if (link) {
                        links.push(link);
                    }
                }
            });
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
            diagramEngine.repaintCanvas();
        }, 200);
    };

    const context: DiagramContextState = {
        project,
        onListenerSelect,
        onServiceSelect,
        onAutomationSelect,
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
