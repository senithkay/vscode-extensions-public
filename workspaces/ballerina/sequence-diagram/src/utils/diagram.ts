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
import { NodeLinkFactory, NodeLinkModel, NodeLinkModelOptions } from "../components/NodeLink";
import { NodePortFactory, NodePortModel } from "../components/NodePort";
import { EmptyNodeFactory } from "../components/nodes/EmptyNode";
import { ParticipantNodeFactory } from "../components/nodes/ParticipantNode";
import { BBox, DiagramElement, Node, NodeModel, Participant, ViewState, ViewStateLabel } from "./types";
import _ from "lodash";
import { DiagramElementKindChecker } from "./check-kind-utils";

export function generateEngine(): DiagramEngine {
    const engine = createEngine({
        registerDefaultDeleteItemsAction: false,
        registerDefaultZoomCanvasAction: false,
        registerDefaultPanAndZoomCanvasAction: true,
    });

    engine.getPortFactories().registerFactory(new NodePortFactory());
    engine.getLinkFactories().registerFactory(new NodeLinkFactory());
    engine.getNodeFactories().registerFactory(new EmptyNodeFactory());
    engine.getNodeFactories().registerFactory(new ParticipantNodeFactory());
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

export function getParticipantId(model: Participant) {
    return _.snakeCase(`participant-${model.id}`);
}
export function getNodeId(model: Node, suffix = "") {
    if (!model) {
        return "";
    }
    return _.snakeCase(
        `node-${model.kind}-${model.location.startLine.line}-${model.location.startLine.offset}-${model.location.endLine.line}-${model.location.endLine.offset}-${suffix}`,
    );
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
    const sourcePort = sourceNode.getRightPort();
    const targetPort = targetNode.getLeftPort();
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
export const hasDiagramZoomAndPosition = () => {
    return localStorage.getItem("diagram-zoom-level") !== null;
};

// traverse utils
export function getInitialViewState(
    label = ViewStateLabel.DEFAULT_NODE,
    height = 0,
    width = 0,
    suffix?: string,
): ViewState {
    return {
        label: getViewStateLabel(label, suffix),
        bBox: {
            x: 0,
            y: 0,
            h: height,
            w: width,
            cx: 0,
            cy: 0,
            ch: height,
            cw: width,
        },
    };
}

export function getViewStateLabel(label: string, suffix?: string): string {
    return suffix ? `${label}_${suffix}` : label;
}

export function getParentBBox(parent: DiagramElement): BBox {
    if (DiagramElementKindChecker.isParticipant(parent)) {
        return parent.viewState.bBox;
    }

    if (DiagramElementKindChecker.isInteraction(parent)) {
        return parent.viewStates.at(0).bBox;
    }
    console.warn(">> Parent BBox not found. using default bBox values", parent);
    return getInitialViewState().bBox;
}
