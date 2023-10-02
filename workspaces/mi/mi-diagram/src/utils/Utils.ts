/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DiagramEngine } from "@projectstorm/react-diagrams";
import { MediatorLinkFactory } from "../components/link/MediatorLinkFactory";
import { MediatorPortFactory } from "../components/port/MediatorPortFactory";
import { MediatorPortModel } from "../components/port/MediatorPortModel";
import { MediatorLinkModel } from "../components/link/MediatorLinkModel";
import { LogMediatorNodeFactory } from "../components/nodes/mediators/log/LogMediatorFactory";
import { InvisibleNodeFactory } from "../components/nodes/InvisibleNode/InvisibleNodeFactory";
import { DefaultState } from "../components/canvas/DefaultState";
import { PlusNodeFactory } from "../components/nodes/plusNode/PlusNodeFactory";
import { PlusNodeModel } from "../components/nodes/plusNode/PlusNodeModel";

export function generateEngine(): DiagramEngine {
    const engine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: false,
        registerDefaultZoomCanvasAction: false
    });
    engine.getStateMachine().pushState(new DefaultState());

    engine.getLinkFactories().registerFactory(new MediatorLinkFactory());
    engine.getPortFactories().registerFactory(new MediatorPortFactory());
    engine.getNodeFactories().registerFactory(new LogMediatorNodeFactory());
    engine.getNodeFactories().registerFactory(new InvisibleNodeFactory());
    engine.getNodeFactories().registerFactory(new PlusNodeFactory());

    // engine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    return engine;
}

export function createLinks(sourcePort: MediatorPortModel, targetPort: MediatorPortModel, addPlus: boolean, addArrow: boolean = true): any[] {
    const portsAndNodes = [];
    if (addPlus) {
        const plusNode = new PlusNodeModel(`${sourcePort.getID()}:plus:${targetPort.getID()}`);
        const plusNodePort = plusNode.getPort(`left-${plusNode.getID()}`);
        const link = createLinks(sourcePort, plusNodePort, false, false);
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
