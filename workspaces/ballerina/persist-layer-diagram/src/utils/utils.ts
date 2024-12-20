/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DiagramEngine, DiagramModel } from '@projectstorm/react-diagrams';
import { CMEntity as Entity } from '@wso2-enterprise/ballerina-core';
import {
    EntityLinkModel, EntityModel, EntityPortModel, OverlayLayerFactory, EntityFactory, EntityLinkFactory, EntityPortFactory
} from '../components';

export function generateEngine(): DiagramEngine {
    const engine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false
    });
    engine.getLinkFactories().registerFactory(new EntityLinkFactory());
    engine.getPortFactories().registerFactory(new EntityPortFactory());
    engine.getNodeFactories().registerFactory(new EntityFactory());
    engine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    return engine;
}

export function modelMapper(entities: Map<string, Entity>): DiagramModel {
    let entityNodes: Map<string, EntityModel> = generateNodes(entities);
    let entityLinks: Map<string, EntityLinkModel> = generateLinks(entities, entityNodes);

    let model = new DiagramModel();
    model.addAll(...Array.from(entityNodes.values()), ...Array.from(entityLinks.values()));
    return model;
}

function generateNodes(entities: Map<string, Entity>): Map<string, EntityModel> {
    let nodes: Map<string, EntityModel> = new Map<string, EntityModel>();
    entities?.forEach((entity, key) => {
        const entityNode = new EntityModel(key, entity);
        nodes.set(key, entityNode);
    });

    return nodes;
}

function generateLinks(entities: Map<string, Entity>, nodes: Map<string, EntityModel>): Map<string, EntityLinkModel> {
    let links: Map<string, EntityLinkModel> = new Map();
    let mappedLinkNodes: Map<string, string[]> = new Map();

    entities?.forEach((entity, key) => {
        let callingEntity: EntityModel = nodes.get(key);
        let associatedEntity: EntityModel;

        if (!mappedLinkNodes.has(key)) {
            mappedLinkNodes.set(key, []);
        }

        entity.attributes.forEach(attribute => {
            attribute.associations.forEach(association => {
                associatedEntity = nodes.get(association.associate);
                if (callingEntity && associatedEntity) {
                    let sourcePort: EntityPortModel = callingEntity.getPort(`right-${key}/${attribute.name}`);
                    let targetPort: EntityPortModel = associatedEntity.getPort(`left-${association.associate}`);

                    if (sourcePort && targetPort) {
                        if (mappedLinkNodes.has(associatedEntity.getID()) &&
                            mappedLinkNodes.get(associatedEntity.getID()).includes(callingEntity.getID())) {
                            const linkId: string = Array.from(links.keys()).find(itemId =>
                                itemId.slice(itemId.indexOf('-') + 1).startsWith(associatedEntity.getID()) && itemId.endsWith(key)
                            );
                            if (linkId) {
                                const link2update = links.get(linkId);
                                link2update.cardinality.self = association.cardinality.associate;
                                link2update.setTargetPort(sourcePort);
                                link2update.setTargetNode(callingEntity.getID(), attribute.name);
                            }
                            const index = mappedLinkNodes.get(associatedEntity.getID()).indexOf(callingEntity.getID());
                            if (index > -1) {
                                mappedLinkNodes.get(associatedEntity.getID()).splice(index, 1);
                            }
                        } else {
                            const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
                            let link: EntityLinkModel = new EntityLinkModel(linkId, association.cardinality);
                            links.set(linkId, createLinks(sourcePort, targetPort, link));
                            link.setSourceNode(callingEntity.getID(), attribute.name);
                            link.setTargetNode(associatedEntity.getID());
                            mappedLinkNodes.set(key, [...mappedLinkNodes.get(key), associatedEntity.getID()]);
                        }
                    }
                }
            });
        });

        entity.inclusions.forEach((inclusion) => {
            associatedEntity = nodes.get(inclusion);
            if (callingEntity && associatedEntity) {
                let sourcePort: EntityPortModel = callingEntity.getPort(`top-${key}`);
                let targetPort: EntityPortModel = associatedEntity.getPort(`bottom-${inclusion}`);

                if (sourcePort && targetPort) {
                    const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
                    let link: EntityLinkModel = new EntityLinkModel(linkId, undefined);
                    links.set(linkId, createLinks(sourcePort, targetPort, link));
                }
            }
        })
    });

    return links;
}

function createLinks(sourcePort: EntityPortModel, targetPort: EntityPortModel, link: EntityLinkModel): EntityLinkModel {
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}
