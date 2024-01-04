/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DefaultDiagramState, DiagramEngine, NodeModel, PortModelAlignment } from "@projectstorm/react-diagrams";
import { MediatorLinkFactory } from "../components/link/MediatorLinkFactory";
import { MediatorPortFactory } from "../components/port/MediatorPortFactory";
import { MediatorLinkModel } from "../components/link/MediatorLinkModel";
import { SimpleMediatorNodeFactory } from "../components/nodes/mediators/simpleMediator/SimpleMediatorFactory";
import { SimpleEndpointNodeFactory } from "../components/nodes/mediators/simpleEndpoint/SimpleEndpointFactory";
import { InvisibleNodeFactory } from "../components/nodes/InvisibleNode/InvisibleNodeFactory";
import { PlusNodeFactory } from "../components/nodes/plusNode/PlusNodeFactory";
import { PlusNodeModel } from "../components/nodes/plusNode/PlusNodeModel";
import { BaseNodeModel } from "../components/base/base-node/base-node";
import { SequenceNodeFactory } from "../components/nodes/sequence/SequenceNodeFactory";
import { SequenceNodeModel } from "../components/nodes/sequence/SequenceNodeModel";
import { AdvancedMediatorNodeFactory } from "../components/nodes/mediators/advancedMediator/AdvancedMediatorFactory";
import { OFFSET } from "../constants";
import { STNode } from "@wso2-enterprise/mi-syntax-tree/lib/src";
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
        const plusNode = new PlusNodeModel(`${sourcePort.getID()}:plus:${targetPort.getID()}`, sourceNode.getDocumentUri(), sourceNode.getSequenceType(), parentNode);
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
