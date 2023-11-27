/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DiagramEngine, NodeModel, PortModelAlignment } from "@projectstorm/react-diagrams";
import { MediatorLinkFactory } from "../components/link/MediatorLinkFactory";
import { MediatorPortFactory } from "../components/port/MediatorPortFactory";
import { MediatorLinkModel } from "../components/link/MediatorLinkModel";
import { SimpleMediatorNodeFactory } from "../components/nodes/mediators/simpleMediator/SimpleMediatorFactory";
import { InvisibleNodeFactory } from "../components/nodes/InvisibleNode/InvisibleNodeFactory";
import { PlusNodeFactory } from "../components/nodes/plusNode/PlusNodeFactory";
import { PlusNodeModel } from "../components/nodes/plusNode/PlusNodeModel";
import { BaseNodeModel } from "../components/base/base-node/base-node";
import { SequenceNodeFactory } from "../components/nodes/sequence/SequenceNodeFactory";
import { SequenceNodeModel } from "../components/nodes/sequence/SequenceNodeModel";
import { AdvancedMediatorNodeFactory } from "../components/nodes/mediators/advancedMediator/AdvancedMediatorFactory";
import { OFFSET } from "../constants";

export function generateEngine(): DiagramEngine {
    const engine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false,
    });

    engine.getLinkFactories().registerFactory(new MediatorLinkFactory());
    engine.getPortFactories().registerFactory(new MediatorPortFactory());
    engine.getNodeFactories().registerFactory(new SimpleMediatorNodeFactory());
    engine.getNodeFactories().registerFactory(new AdvancedMediatorNodeFactory());
    engine.getNodeFactories().registerFactory(new InvisibleNodeFactory());
    engine.getNodeFactories().registerFactory(new PlusNodeFactory());
    engine.getNodeFactories().registerFactory(new SequenceNodeFactory());

    // engine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    return engine;
}

export function setNodePositions(nodes: NodeModel[], isInOutSequence: boolean, startX: number, startY: number, sequenceHeight: number) {
    startX += OFFSET.BETWEEN.X;
    startY += OFFSET.BETWEEN.Y;
    if (!isInOutSequence) {
        for (let i = 0; i < nodes.length; i++) {
            const node: any = nodes[i];
            node.setPosition(startX, startY + (sequenceHeight / 2) - node.height / 2);
            startX += (node instanceof SequenceNodeModel ? 0 : node.width) + OFFSET.BETWEEN.X;
            startY += OFFSET.BETWEEN.Y;
        }
    } else {
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node: any = nodes[i];
            node.setPosition(startX, startY + (sequenceHeight / 2) - node.height / 2);
            startX += (node instanceof SequenceNodeModel ? 0 : node.width) + OFFSET.BETWEEN.X;
            startY += OFFSET.BETWEEN.Y;
        }
    }
}

export function createLinks(sourceNode: BaseNodeModel, targetNode: BaseNodeModel,
    addPlus: boolean = true, addArrow: boolean = true): any[] {
    if (!sourceNode || !targetNode) {
        return [];
    }
    const portsAndNodes = [];
    let sourcePort = sourceNode.getPortByAllignment(sourceNode instanceof SequenceNodeModel ? PortModelAlignment.LEFT : (sourceNode.isInOutSequenceNode() ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT));
    const targetPort = targetNode.getPortByAllignment(targetNode instanceof SequenceNodeModel ? PortModelAlignment.LEFT : (targetNode.isInOutSequenceNode() ? PortModelAlignment.RIGHT : PortModelAlignment.LEFT));

    if (!sourcePort || !targetPort) {
        return [];
    }

    if (addPlus) {
        // TODO: Fix this
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
        const plusNode = new PlusNodeModel(`${sourcePort.getID()}:plus:${targetPort.getID()}`, sourceNode.getDocumentUri(), sourceNode.isInOutSequenceNode());
        plusNode.setNodeRange(nodeRange);
        const link = createLinks(sourceNode, plusNode, false, false);
        sourcePort = plusNode.getPortByAllignment(sourceNode.isInOutSequenceNode() ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT);
        portsAndNodes.push(plusNode, ...link);
    }
    const link: MediatorLinkModel = new MediatorLinkModel(`${sourcePort.getID()}::${targetPort.getID()}`, addArrow, sourceNode.isInOutSequenceNode() != targetNode.isInOutSequenceNode());
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    portsAndNodes.push(link);

    return portsAndNodes;
}

export function isDarkMode() {
    return document.body.getAttribute('data-vscode-theme-kind')?.includes('dark') ?? false;
}
