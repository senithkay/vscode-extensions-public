/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import createEngine, { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { OverlayLayerFactory } from "../components/OverlayLayer";
import { DagreEngine } from "../resources/dagre/DagreEngine";
import { NodeLinkFactory } from "../components/NodeLink";
import { NodePortFactory } from "../components/NodePort";
import { EmptyNodeFactory } from "../components/nodes/EmptyNode";
import { ParticipantNodeFactory } from "../components/nodes/ParticipantNode";
import {
    BBox,
    DiagramElement,
    Flow,
    IfViewState,
    Node,
    NodeBranch,
    NodeViewState,
    Participant,
    ParticipantViewState,
} from "./types";
import { kebabCase } from "lodash";
import { DiagramElementKindChecker } from "./check-kind-utils";
import { NODE_HEIGHT, NODE_WIDTH, PARTICIPANT_NODE_HEIGHT, PARTICIPANT_NODE_WIDTH } from "../resources/constants";
import { PointNodeFactory } from "../components/nodes/PointNode";
import { ContainerNodeFactory } from "../components/nodes/ContainerNode";
import { LifeLineNodeFactory } from "../components/nodes/LifeLineNode";

export function generateEngine(): DiagramEngine {
    const engine = createEngine({
        registerDefaultDeleteItemsAction: false,
        registerDefaultZoomCanvasAction: false,
        registerDefaultPanAndZoomCanvasAction: true,
    });

    engine.getPortFactories().registerFactory(new NodePortFactory());
    engine.getLinkFactories().registerFactory(new NodeLinkFactory());
    engine.getNodeFactories().registerFactory(new PointNodeFactory());
    engine.getNodeFactories().registerFactory(new EmptyNodeFactory());
    engine.getNodeFactories().registerFactory(new ParticipantNodeFactory());
    engine.getNodeFactories().registerFactory(new ContainerNodeFactory());
    engine.getNodeFactories().registerFactory(new LifeLineNodeFactory());
    engine.getLayerFactories().registerFactory(new OverlayLayerFactory());

    return engine;
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
            rankdir: "TB",
            nodesep: 60,
            ranksep: 60,
            marginx: 50,
            marginy: 100,
            ranker: "tight-tree",
        },
    });
}

export function getEntryParticipant(flow: Flow): Participant {
    return flow.participants?.find(
        (participant) =>
            flow.location.startLine.line === participant.location.startLine.line &&
            flow.location.startLine.offset === participant.location.startLine.offset &&
            flow.location.endLine.line === participant.location.endLine.line &&
            flow.location.endLine.offset === participant.location.endLine.offset,
    );
}

export function getParticipantId(model: Participant, ...suffixes: string[]) {
    const suffix = suffixes.join("-");
    return kebabCase(`participant-${model.id}-${suffix}`);
}

export function getBranchId(node: NodeBranch, parent: Node) {
    return getNodeId(parent, node.label);
}

export function getNodeId(model: Node, ...suffixes: string[]) {
    if (!model?.location) {
        console.warn(">> Node or location not found", model, suffixes);
        return "";
    }
    const suffix = suffixes.join("-");
    return kebabCase(
        `node-${model.kind}-${model.location.startLine.line}-${model.location.startLine.offset}-${model.location.endLine.line}-${model.location.endLine.offset}-${suffix}`,
    );
}

export function getCallerNodeId(parent: DiagramElement, ...suffixes: string[]) {
    if (!parent?.location) {
        console.warn(">> Node or location not found", parent, suffixes);
        return "";
    }
    if (DiagramElementKindChecker.isParticipant(parent)) {
        return getParticipantId(parent, ...suffixes);
    }
    return getNodeId(parent, ...suffixes);
}

// // create link between ports
// export function createPortsLink(sourcePort: NodePortModel, targetPort: NodePortModel, options?: NodeLinkModelOptions) {
//     const link = new NodeLinkModel(options);
//     link.setSourcePort(sourcePort);
//     link.setTargetPort(targetPort);
//     sourcePort.addLink(link);
//     return link;
// }

// // create link between nodes
// export function createNodesLink(sourceNode: NodeModel, targetNode: NodeModel, options?: NodeLinkModelOptions) {
//     const sourcePort = sourceNode.getRightPort();
//     const targetPort = targetNode.getLeftPort();
//     const link = createPortsLink(sourcePort, targetPort, options);
//     link.setSourceNode(sourceNode);
//     link.setTargetNode(targetNode);
//     return link;
// }

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
// export const loadDiagramZoomAndPosition = (engine: DiagramEngine) => {
//     const zoomLevel = JSON.parse(localStorage.getItem("diagram-zoom-level") || "100");
//     const offsetX = JSON.parse(localStorage.getItem("diagram-offset-x") || "0");
//     const offsetY = JSON.parse(localStorage.getItem("diagram-offset-y") || "0");

//     engine.getModel().setZoomLevel(zoomLevel);
//     engine.getModel().setOffset(offsetX, offsetY);
// };

// check local storage has zoom level and position
// export const hasDiagramZoomAndPosition = () => {
//     return localStorage.getItem("diagram-zoom-level") !== null;
// };

// traverse utils
export function getInitialNodeViewState(
    id: string,
    startParticipantId: string,
    endParticipantId: string,
): NodeViewState {
    return {
        callNodeId: id,
        bBox: {
            x: 0,
            y: 0,
            h: 0,
            w: 0,
        },
        points: {
            start: {
                bBox: {
                    x: 0,
                    y: 0,
                    h: NODE_HEIGHT,
                    w: NODE_WIDTH,
                },
                participantId: startParticipantId,
            },
            end: {
                bBox: {
                    x: 0,
                    y: 0,
                    h: NODE_HEIGHT,
                    w: NODE_WIDTH,
                },
                participantId: endParticipantId,
            },
            returnStart: {
                bBox: {
                    x: 0,
                    y: 0,
                    h: NODE_HEIGHT,
                    w: NODE_WIDTH,
                },
                participantId: endParticipantId,
            },
            returnEnd: {
                bBox: {
                    x: 0,
                    y: 0,
                    h: NODE_HEIGHT,
                    w: NODE_WIDTH,
                },
                participantId: startParticipantId,
            },
        },
    };
}

export function getInitialParticipantViewState(
    index: number,
    height = PARTICIPANT_NODE_HEIGHT,
    width = PARTICIPANT_NODE_WIDTH,
): ParticipantViewState {
    return {
        bBox: {
            x: 0,
            y: 0,
            h: height,
            w: width,
        },
        xIndex: index,
    };
}

export function getInitialIfNodeViewState(id: string, height = NODE_HEIGHT, width = NODE_WIDTH): IfViewState {
    return {
        blockId: id,
        bBox: {
            x: 0,
            y: 0,
            h: height,
            w: width,
        },
    };
}

export function getElementBBox(element: DiagramElement): BBox {
    if (DiagramElementKindChecker.isParticipant(element)) {
        return element.viewState.bBox;
    }

    if (DiagramElementKindChecker.isNode(element)) {
        return element.viewStates.at(0).bBox; // todo: fix this logic
    }

    console.warn(">> Parent BBox not found. using default bBox values", element);
    return {
        x: 0,
        y: 0,
        h: 0,
        w: 0,
    };
}
