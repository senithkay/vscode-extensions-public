/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DiagramEngine, DiagramModel } from '@projectstorm/react-diagrams';
import {
    EntityLinkModel, EntityModel, EntityPortModel, OverlayLayerFactory, EntityFactory, EntityLinkFactory, EntityPortFactory
} from '../components';
import { Component, ConnectionMetadata, ConnectionType } from '../types';

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

export function modelMapper(entities: Map<string, Component>): DiagramModel {
    let componentNodes: Map<string, EntityModel> = generateNodes(entities);
    let componentLinks: Map<string, EntityLinkModel> = generateLinks(entities, componentNodes);

    let model = new DiagramModel();
    model.addAll(...Array.from(componentNodes.values()), ...Array.from(componentLinks.values()));
    return model;
}

function generateNodes(entities: Map<string, Component>): Map<string, EntityModel> {
    let nodes: Map<string, EntityModel> = new Map<string, EntityModel>();
    entities?.forEach((entity, _key) => {
        const entityNode = new EntityModel(entity.id, entity);
        nodes.set(entity.id, entityNode);
    });

    return nodes;
}

function generateLinks(entities: Map<string, Component>, nodes: Map<string, EntityModel>): Map<string, EntityLinkModel> {
    let links: Map<string, EntityLinkModel> = new Map();
    let mappedLinkNodes: Map<string, string[]> = new Map();

    entities?.forEach((entity, key) => {
        let callingEntity: EntityModel | undefined = nodes.get(entity.id);
        let associatedEntity: EntityModel | undefined;

        if (!mappedLinkNodes.has(key)) {
            mappedLinkNodes.set(key, []);
        }

        entity.connections.forEach(connection => {
            switch (connection.type) {
                case ConnectionType.HTTP:
                    const connectionMetadata = getMetadataFromConnectionId(connection.id);
                    if (connectionMetadata && connectionMetadata.type === ConnectionType.HTTP) {
                        associatedEntity = nodes.get(connectionMetadata.component);
                        if (callingEntity && associatedEntity) {
                            let sourcePort: EntityPortModel | null = callingEntity.getPort(`right-${callingEntity.getID()}`);
                            let targetPort: EntityPortModel | null = associatedEntity.getPort(`left-${associatedEntity.getID()}`);

                            if (sourcePort && targetPort) {
                                const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
                                let link: EntityLinkModel = new EntityLinkModel(linkId);
                                links.set(linkId, createLinks(sourcePort, targetPort, link));
                                link.setSourceNode(callingEntity.getID());
                                link.setTargetNode(associatedEntity.getID());
                                mappedLinkNodes.set(key, [...(mappedLinkNodes.get(key) || []), associatedEntity.getID()]);
                            }

                        }
                    }
                    break;
                case ConnectionType.Connector:
                    // TODO: Implement connector links
                    break;
            }

        })


        // entity.attributes.forEach(attribute => {
        //     attribute.associations.forEach(association => {
        //         associatedEntity = nodes.get(association.associate);
        //         if (callingEntity && associatedEntity) {
        //             let sourcePort: EntityPortModel = callingEntity.getPort(`right-${key}/${attribute.name}`);
        //             let targetPort: EntityPortModel = associatedEntity.getPort(`left-${association.associate}`);

        //             if (sourcePort && targetPort) {
        //                 if (mappedLinkNodes.has(associatedEntity.getID()) &&
        //                     mappedLinkNodes.get(associatedEntity.getID()).includes(callingEntity.getID())) {
        //                     const linkId: string = Array.from(links.keys()).find(itemId =>
        //                         itemId.slice(itemId.indexOf('-') + 1).startsWith(associatedEntity.getID()) && itemId.endsWith(key)
        //                     );
        //                     if (linkId) {
        //                         const link2update = links.get(linkId);
        //                         link2update.cardinality.self = association.cardinality.associate;
        //                         link2update.setTargetPort(sourcePort);
        //                         link2update.setTargetNode(callingEntity.getID(), attribute.name);
        //                     }
        //                     const index = mappedLinkNodes.get(associatedEntity.getID()).indexOf(callingEntity.getID());
        //                     if (index > -1) {
        //                         mappedLinkNodes.get(associatedEntity.getID()).splice(index, 1);
        //                     }
        //                 } else {
        //                     const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
        //                     let link: EntityLinkModel = new EntityLinkModel(linkId, association.cardinality);
        //                     links.set(linkId, createLinks(sourcePort, targetPort, link));
        //                     link.setSourceNode(callingEntity.getID(), attribute.name);
        //                     link.setTargetNode(associatedEntity.getID());
        //                     mappedLinkNodes.set(key, [...mappedLinkNodes.get(key), associatedEntity.getID()]);
        //                 }
        //             }
        //         }
        //     });
        // });

        // entity.inclusions.forEach((inclusion) => {
        //     associatedEntity = nodes.get(inclusion);
        //     if (callingEntity && associatedEntity) {
        //         let sourcePort: EntityPortModel = callingEntity.getPort(`top-${key}`);
        //         let targetPort: EntityPortModel = associatedEntity.getPort(`bottom-${inclusion}`);

        //         if (sourcePort && targetPort) {
        //             const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
        //             let link: EntityLinkModel = new EntityLinkModel(linkId, undefined);
        //             links.set(linkId, createLinks(sourcePort, targetPort, link));
        //         }
        //     }
        // })
    });

    return links;
}

function createLinks(sourcePort: EntityPortModel, targetPort: EntityPortModel, link: EntityLinkModel): EntityLinkModel {
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}

export function getMetadataFromConnectionId(id: string): ConnectionMetadata | null {
    const ids = id.split(':');
    if (ids.length == 4) {
        // This is a service
        return {
            type: ConnectionType.HTTP,
            organization: ids[0],
            project: ids[1],
            component: ids[2],
            service: ids[3]
        }
    } else if (ids.length == 2) {
        // This is a connector
        return {
            type: ConnectionType.Connector,
            organization: ids[0],
            package: ids[1],
        }
    }
    return null;
}

export function getConnectionIdFromMetadata(metadata: ConnectionMetadata): string {
    switch (metadata.type) {
        case ConnectionType.HTTP:
            return `${metadata.organization}:${metadata.project}:${metadata.component}:${metadata.service}`;
        case ConnectionType.Connector:
            return `${metadata.organization}:${metadata.package}`;
    }
}

export function getComponentIdFromMetadata(organization: string, project: string, component: string): string {
    return `${organization}:${project}:${component}`;
}
