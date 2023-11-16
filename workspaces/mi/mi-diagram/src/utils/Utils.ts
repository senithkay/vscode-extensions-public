/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DiagramEngine, PortModelAlignment } from "@projectstorm/react-diagrams";
import { MediatorLinkFactory } from "../components/link/MediatorLinkFactory";
import { MediatorPortFactory } from "../components/port/MediatorPortFactory";
import { MediatorLinkModel } from "../components/link/MediatorLinkModel";
import { LogMediatorNodeFactory } from "../components/nodes/mediators/log/LogMediatorFactory";
import { InvisibleNodeFactory } from "../components/nodes/InvisibleNode/InvisibleNodeFactory";
import { PlusNodeFactory } from "../components/nodes/plusNode/PlusNodeFactory";
import { PlusNodeModel } from "../components/nodes/plusNode/PlusNodeModel";
import { BaseNodeModel } from "../components/base/base-node/base-node";
import { InvisibleNodeModel } from "../components/nodes/InvisibleNode/InvisibleNodeModel";

export function generateEngine(): DiagramEngine {
    const engine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false,
    });

    engine.getLinkFactories().registerFactory(new MediatorLinkFactory());
    engine.getPortFactories().registerFactory(new MediatorPortFactory());
    engine.getNodeFactories().registerFactory(new LogMediatorNodeFactory());
    engine.getNodeFactories().registerFactory(new InvisibleNodeFactory());
    engine.getNodeFactories().registerFactory(new PlusNodeFactory());

    // engine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    return engine;
}

export function createLinks(sourceNode: BaseNodeModel, targetNode: BaseNodeModel,
    addPlus: boolean = true, addArrow: boolean = true): any[] {
    const portsAndNodes = [];
    let sourcePort = sourceNode.getPort(sourceNode instanceof InvisibleNodeModel ? PortModelAlignment.RIGHT : `right-${sourceNode.getID()}`);
    const targetPort = targetNode.getPort(targetNode instanceof InvisibleNodeModel ? PortModelAlignment.RIGHT : `left-${targetNode.getID()}`);

    if (!sourcePort || !targetPort) {
        return;
    }

    if (addPlus) {
        // TODO: Fix this
        const nodeRange = {
            start: {
                line: sourceNode.getRange().end.line,
                character: sourceNode.getRange().end.character
            },
            end: {
                line: targetNode.getRange().start.line,
                character: targetNode.getRange().start.character
            }
        }
        const plusNode = new PlusNodeModel(`${sourcePort.getID()}:plus:${targetPort.getID()}`, nodeRange, sourceNode.getDocumentUri());
        const link = createLinks(sourceNode, plusNode, false, false);
        sourcePort = plusNode.getPort(`right-${plusNode.getID()}`);
        portsAndNodes.push(plusNode, ...link);
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
