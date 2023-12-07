/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DefaultLinkModel, DefaultNodeModel, DiagramEngine, DiagramModel, PortModelAlignment } from "@projectstorm/react-diagrams";
import { EntityLinkModel, EntityModel, EntityPortModel, OverlayLayerFactory, EntityFactory, EntityLinkFactory, EntityPortFactory } from "../components";
import { Node } from "../types/types";
import { getEntityPortId } from "../components/EntityPort/EntityPortModel";
import { WorkerPortFactory } from "../components/Port/WorkerPortFactory";
import { LinkFactory } from "../components/Link/LinkFactory";

export function generateEngine(): DiagramEngine {
    const engine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: true,
    });
    engine.getLinkFactories().registerFactory(new EntityLinkFactory());
    engine.getPortFactories().registerFactory(new EntityPortFactory());
    engine.getNodeFactories().registerFactory(new EntityFactory());
    engine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    engine.getLinkFactories().registerFactory(new LinkFactory());
    engine.getPortFactories().registerFactory(new WorkerPortFactory());
    return engine;
}

export function modelMapper(nodes: Node[]): DiagramModel {
    let model = new DiagramModel();

    const entityModels: Map<string, EntityModel> = new Map<string, EntityModel>();

    // generate nodes
    nodes.forEach((node) => {
        const entityNode = new EntityModel(node.name, node);
        entityModels.set(node.name, entityNode);
        model.addNode(entityNode);
    });

    // generate links
    nodes.forEach((node) => {
        const startNode = entityModels.get(node.name);
        node.links.forEach((link) => {
            const endNode = entityModels.get(link.name);
            const linkId: string = `${startNode.getID()}::${endNode.getID()}`;
            let entityLink: EntityLinkModel = new EntityLinkModel(linkId);
            entityLink.setSourceNode(startNode.getID());
            entityLink.setTargetNode(endNode.getID());

            const sourcePortId = getEntityPortId(node.name, PortModelAlignment.RIGHT, link.name);
            const sourcePort: EntityPortModel = startNode.getPort(sourcePortId);
            const targetPortId = getEntityPortId(link.name, PortModelAlignment.LEFT);
            const targetPort: EntityPortModel = endNode.getPort(targetPortId);
            if (!sourcePort || !targetPort) {
                console.error("Error: Port not found");
                return;
            }

            createLinks(sourcePort, targetPort, entityLink);
            model.addLink(entityLink);
        });
    });

    return model;
}

function createLinks(sourcePort: EntityPortModel, targetPort: EntityPortModel, link: EntityLinkModel): EntityLinkModel {
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}
