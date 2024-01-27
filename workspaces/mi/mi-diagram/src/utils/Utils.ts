/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DefaultDiagramState, DiagramEngine, DiagramModel, NodeModel, PortModelAlignment } from "@projectstorm/react-diagrams";
import { MediatorLinkFactory } from "../components/link/MediatorLinkFactory";
import { MediatorPortFactory } from "../components/port/MediatorPortFactory";
import { MediatorLinkModel } from "../components/link/MediatorLinkModel";
import { SimpleMediatorNodeFactory } from "../components/nodes/mediators/simpleMediator/SimpleMediatorFactory";
import { SimpleEndpointNodeFactory } from "../components/nodes/mediators/simpleEndpoint/SimpleEndpointFactory";
import { InvisibleNodeFactory } from "../components/nodes/InvisibleNode/InvisibleNodeFactory";
import { PlusNodeFactory } from "../components/nodes/plusNode/PlusNodeFactory";
import { PlusNodeModel } from "../components/nodes/plusNode/PlusNodeModel";
import { BaseNodeModel, SequenceType } from "../components/base/base-node/base-node";
import { SequenceNodeFactory } from "../components/nodes/sequence/SequenceNodeFactory";
import { SequenceNodeModel } from "../components/nodes/sequence/SequenceNodeModel";
import { AdvancedMediatorNodeFactory } from "../components/nodes/mediators/advancedMediator/AdvancedMediatorFactory";
import { OFFSET } from "../constants";
import { Position, STNode, Range } from "@wso2-enterprise/mi-syntax-tree/lib/src";
export function generateEngine(): DiagramEngine {
    const engine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: false,
        registerDefaultZoomCanvasAction: false,
    });

    const state = engine.getStateMachine().getCurrentState();
    if (state instanceof DefaultDiagramState) {
        state.dragCanvas.config.allowDrag = false;
    }

    engine.getLinkFactories().registerFactory(new MediatorLinkFactory());
    engine.getPortFactories().registerFactory(new MediatorPortFactory());
    engine.getNodeFactories().registerFactory(new SimpleMediatorNodeFactory());
    engine.getNodeFactories().registerFactory(new AdvancedMediatorNodeFactory());
    engine.getNodeFactories().registerFactory(new InvisibleNodeFactory());
    engine.getNodeFactories().registerFactory(new PlusNodeFactory());
    engine.getNodeFactories().registerFactory(new SequenceNodeFactory());
    engine.getNodeFactories().registerFactory(new SimpleEndpointNodeFactory());

    // engine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    return engine;
}

export function setNodePositions(nodes: NodeModel[], startX: number, startY: number, sequenceWidth: number) {
    startX += OFFSET.BETWEEN.X;
    startY += OFFSET.BETWEEN.Y;
    for (let i = 0; i < nodes.length; i++) {
        const node: any = nodes[i];
        node.setPosition(startX + (sequenceWidth / 2) - node.width / 2, startY);
        startY += (node instanceof SequenceNodeModel ? 0 : node.height) + OFFSET.BETWEEN.Y;
    }
}

export function drawSequence(nodes: BaseNodeModel[], sequenceType: SequenceType, range: Range, model: DiagramModel, parentNode?: STNode) {
    const sequenceNode = new SequenceNodeModel(`${sequenceType}`, sequenceType, range);
    const nodesAndLinks: any[] = [];

    // Add initial plus node
    const plusNode = new PlusNodeModel(`${sequenceType}:${range.start.line}.${range.start.character}:${range.end.line}.${range.end.character}:start`, null, sequenceType, parentNode);
    const position: Position = {
        line: range.start.line,
        character: range.start.character + sequenceType.length + 2
    }

    plusNode.setNodeRange({
        start: position,
        end: position
    });

    if (nodes.length > 0) {
        const targetNode = nodes[0];
        const canvasPortLink = createLinks(plusNode, targetNode, parentNode);

        if (sequenceType !== SequenceType.SUB_SEQUENCE) {
            addNodesAndLinksToModel(model, [sequenceNode, ...canvasPortLink, targetNode], nodesAndLinks);
        } else {
            addNodesAndLinksToModel(model, [...canvasPortLink, targetNode], nodesAndLinks);
        }
    } else {
        if (sequenceType !== SequenceType.SUB_SEQUENCE) {
            addNodesAndLinksToModel(model, [sequenceNode, plusNode], nodesAndLinks);
        } else {
            addNodesAndLinksToModel(model, [plusNode], nodesAndLinks);
        }
    }

    if (nodes.length > 1) {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (nodes[i].getParentNode() == nodes[j].getParentNode()) {
                    const link = createLinks(nodes[i], nodes[j], parentNode);
                    if (i === 0) {
                        addNodesAndLinksToModel(model, [...link, nodes[j]], nodesAndLinks);

                    } else {
                        addNodesAndLinksToModel(model, [nodes[i], ...link, nodes[j]], nodesAndLinks);
                    }
                    break;
                }
            }
        }
    }
    if (nodes.length > 0) {
        // Add final plus node
        const sourceNode = nodes[nodes.length - 1];
        const plusNode = new PlusNodeModel(`${sequenceType}:plus:end`, null, sequenceType, parentNode);
        const position: Position = {
            line: sourceNode.getNodeRange().end.line,
            character: sourceNode.getNodeRange().end.character
        }

        plusNode.setNodeRange({
            start: position,
            end: position
        });
        const canvasPortLink = createLinks(sourceNode, plusNode, parentNode);
        addNodesAndLinksToModel(model, canvasPortLink, nodesAndLinks);
    }
    return nodesAndLinks;

    function addNodesAndLinksToModel(model: DiagramModel, nodesAndLinks: any[], allNodesAndLinks: any[]) {
        nodesAndLinks.forEach((nodeOrLink) => {
            if (!model.getNode(nodeOrLink.getID()) && !model.getLink(nodeOrLink.getID())) {
                model.addAll(nodeOrLink);
                allNodesAndLinks.push(nodeOrLink);
            } else if (model.getNode(nodeOrLink.getID())) {
                allNodesAndLinks.push(model.getNode(nodeOrLink.getID()));
            } else if (model.getLink(nodeOrLink.getID())) {
                allNodesAndLinks.push(model.getLink(nodeOrLink.getID()));
            }
        });
    }
}

export function createLinks(sourceNode: BaseNodeModel, targetNode: BaseNodeModel, parentNode: STNode,
    addPlus: boolean = true, addArrow: boolean = true, isEndpoint: boolean = false): any[] {
    if (!sourceNode || !targetNode) {
        return [];
    }
    const portsAndNodes = [];
    let sourcePort = sourceNode.getPortByAllignment(sourceNode instanceof SequenceNodeModel ? PortModelAlignment.TOP : PortModelAlignment.BOTTOM);
    let targetPort = targetNode.getPortByAllignment(targetNode instanceof SequenceNodeModel ? PortModelAlignment.TOP : PortModelAlignment.TOP);

    if (isEndpoint) {
        sourcePort = sourceNode.getPortByAllignment(PortModelAlignment.RIGHT);
        targetPort = targetNode.getPortByAllignment(PortModelAlignment.LEFT);
    }

    if (!sourcePort || !targetPort || sourceNode.isDropSequence()) {
        return [];
    }

    if (addPlus) {
        const nodeRange = {
            start: {
                line: sourceNode.getNodeRange().end.line,
                character: sourceNode.getNodeRange().end.character
            },
            end: {
                line: targetNode.getNodeRange().start.line,
                character: targetNode.getNodeRange().start.character
            }
        }
        const plusNode = new PlusNodeModel(`plusNode${nodeRange.start.line}.${nodeRange.start.character}:${nodeRange.end.line}.${nodeRange.end.character}`, sourceNode.getDocumentUri(), sourceNode.getSequenceType(), parentNode);
        plusNode.setNodeRange(nodeRange);
        const link = createLinks(sourceNode, plusNode, parentNode, false, false);
        sourcePort = plusNode.getPortByAllignment(PortModelAlignment.BOTTOM);
        sourceNode instanceof SequenceNodeModel ? portsAndNodes.push(plusNode) : portsAndNodes.push(plusNode, ...link);
    }
    const link: MediatorLinkModel = new MediatorLinkModel(`${sourcePort.getID()}::${targetPort.getID()}`, addArrow);
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    portsAndNodes.push(link);

    return portsAndNodes;
}

export function isDarkMode() {
    return document.body.getAttribute('data-vscode-theme-kind')?.includes('dark') ?? false;
}
