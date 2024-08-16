/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import createEngine, { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { EntryNodeFactory, EntryNodeModel } from "../components/nodes/EntryNode";
import { NodePortFactory, NodePortModel } from "../components/NodePort";
import { NodeLinkFactory, NodeLinkModel, NodeLinkModelOptions } from "../components/NodeLink";
import { OverlayLayerFactory } from "../components/OverlayLayer";
import { DagreEngine } from "../resources/dagre/DagreEngine";
import { NodeModel } from "./types";
import { ConnectionNodeFactory } from "../components/nodes/ConnectionNode/ConnectionNodeFactory";
import { ActorNodeFactory } from "../components/nodes/ActorNode/ActorNodeFactory";
import {
    ACTOR_NODE_WIDTH,
    ACTOR_SUFFIX,
    CON_NODE_HEIGHT,
    ENTRY_NODE_WIDTH,
    NEW_CONNECTION,
    NODE_GAP_Y,
    NODE_PADDING,
    NodeTypes,
} from "../resources/constants";
import { ConnectionNodeModel } from "../components/nodes/ConnectionNode";

export function generateEngine(): DiagramEngine {
    const engine = createEngine({
        registerDefaultDeleteItemsAction: false,
        registerDefaultZoomCanvasAction: false,
        registerDefaultPanAndZoomCanvasAction: false,
    });

    engine.getPortFactories().registerFactory(new NodePortFactory());
    engine.getLinkFactories().registerFactory(new NodeLinkFactory());

    engine.getNodeFactories().registerFactory(new EntryNodeFactory());
    engine.getNodeFactories().registerFactory(new ConnectionNodeFactory());
    engine.getNodeFactories().registerFactory(new ActorNodeFactory());

    engine.getLayerFactories().registerFactory(new OverlayLayerFactory());

    // engine.getActionEventBus().registerAction(new VerticalScrollCanvasAction());
    return engine;
}

export function autoDistribute(engine: DiagramEngine) {
    const model = engine.getModel();

    const dagreEngine = genDagreEngine();
    dagreEngine.redistribute(model);

    // reposition actor node
    model.getNodes().forEach((node) => {
        if (node.getType() === NodeTypes.ENTRY_NODE) {
            const actorNode = model.getNode(node.getID() + ACTOR_SUFFIX);
            if (actorNode) {
                const entryNode = node;
                const entryNodeX = entryNode.getX();
                const entryNodeY = entryNode.getY();
                const newActorNodeX = entryNodeX - (NODE_GAP_Y + ACTOR_NODE_WIDTH);
                const newActorNodeY = entryNodeY + (ENTRY_NODE_WIDTH - ACTOR_NODE_WIDTH) / 2 - NODE_PADDING / 2;
                actorNode.setPosition(newActorNodeX, newActorNodeY);
                return;
            }
        }
    });

    // reposition new connection node if no more connections
    const connectionNodes = model
        .getNodes()
        .filter((node) => node.getType() === NodeTypes.CONNECTION_NODE && node.getID() !== NEW_CONNECTION);
    if (connectionNodes.length === 0) {
        const newConnectionNode = model.getNode(NEW_CONNECTION) as ConnectionNodeModel;
        if (newConnectionNode) {
            for (const id in newConnectionNode.getInPort().getLinks()) {
                const link = newConnectionNode.getInPort().getLinks()[id] as NodeLinkModel;
                const entryNode = link.sourceNode as EntryNodeModel;
                console.log(">>> newConnectionNode", {
                    entryNode: entryNode.getPosition(),
                    conNode: newConnectionNode.getPosition(),
                });
                const entryNodeY = entryNode.getY();
                const newConNodeX = newConnectionNode.getX();
                const newConNodeY = entryNodeY + (ENTRY_NODE_WIDTH - CON_NODE_HEIGHT) / 2 + NODE_PADDING / 2;
                newConnectionNode.setPosition(newConNodeX, newConNodeY);
                return;
            }
        }
    }

    engine.repaintCanvas();
}

export function registerListeners(engine: DiagramEngine) {
    engine.getModel().registerListener({
        offsetUpdated: (event: any) => {
            saveDiagramZoomAndPosition(engine.getModel());
        },
    });
}

export function genDagreEngine() {
    return new DagreEngine({
        graph: {
            rankdir: "LR",
            nodesep: 160,
            ranksep: 300,
            marginx: 100,
            marginy: 100,
            ranker: "longest-path",
        },
    });
}

// create link between ports
export function createPortsLink(sourcePort: NodePortModel, targetPort: NodePortModel, options?: NodeLinkModelOptions) {
    const link = new NodeLinkModel(options);
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}

// create link between nodes
export function createNodesLink(sourceNode: NodeModel, targetNode: NodeModel, options?: NodeLinkModelOptions) {
    const sourcePort = sourceNode.getOutPort();
    const targetPort = targetNode.getInPort();
    const link = createPortsLink(sourcePort, targetPort, options);
    link.setSourceNode(sourceNode);
    link.setTargetNode(targetNode);
    return link;
}

// save diagram zoom level and position to local storage
export const saveDiagramZoomAndPosition = (model: DiagramModel) => {
    const zoomLevel = model.getZoomLevel();
    const offsetX = model.getOffsetX();
    const offsetY = model.getOffsetY();

    // Store them in localStorage
    localStorage.setItem("diagram-zoom-level", JSON.stringify(zoomLevel));
    localStorage.setItem("diagram-offset-x", JSON.stringify(offsetX));
    localStorage.setItem("diagram-offset-y", JSON.stringify(offsetY));
};

// load diagram zoom level and position from local storage
export const loadDiagramZoomAndPosition = (engine: DiagramEngine) => {
    const zoomLevel = JSON.parse(localStorage.getItem("diagram-zoom-level") || "100");
    const offsetX = JSON.parse(localStorage.getItem("diagram-offset-x") || "0");
    const offsetY = JSON.parse(localStorage.getItem("diagram-offset-y") || "0");

    engine.getModel().setZoomLevel(zoomLevel);
    engine.getModel().setOffset(offsetX, offsetY);
};

// check local storage has zoom level and position
export const hasDiagramZoomAndPosition = (file: string) => {
    return localStorage.getItem("diagram-file-path") === file;
};

export const resetDiagramZoomAndPosition = (file: string) => {
    localStorage.setItem("diagram-file-path", file);
    localStorage.setItem("diagram-zoom-level", "100");
    localStorage.setItem("diagram-offset-x", "0");
    localStorage.setItem("diagram-offset-y", "0");
};
