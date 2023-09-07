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
import { MediatorNodeFactory } from "../components/node/MediatorNodeFactory";
import { MediatorPortFactory } from "../components/port/MediatorPortFactory";
import { MediatorPortModel } from "../components/port/MediatorPortModel";
import { MediatorLinkModel } from "../components/link/MediatorLinkModel";

export function generateEngine(): DiagramEngine {
    const engine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false
    });
    engine.getLinkFactories().registerFactory(new MediatorLinkFactory());
    engine.getPortFactories().registerFactory(new MediatorPortFactory());
    engine.getNodeFactories().registerFactory(new MediatorNodeFactory());
    // engine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    return engine;
}

export function createLinks(sourcePort: MediatorPortModel, targetPort: MediatorPortModel, link: MediatorLinkModel): MediatorLinkModel {
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}
