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
    ComponentLinkModel, ComponentModel, ComponentPortModel, OverlayLayerFactory, ComponentFactory, ComponentLinkFactory, ComponentPortFactory
} from '../components';
import { Component, ConnectionMetadata, ConnectionType } from '../types';

export function generateEngine(): DiagramEngine {
    const engine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false
    });
    engine.getLinkFactories().registerFactory(new ComponentLinkFactory());
    engine.getPortFactories().registerFactory(new ComponentPortFactory());
    engine.getNodeFactories().registerFactory(new ComponentFactory());
    engine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    return engine;
}

export function modelMapper(entities: Map<string, Component>): DiagramModel {
    let componentNodes: Map<string, ComponentModel> = generateNodes(entities);
    let componentLinks: Map<string, ComponentLinkModel> = generateLinks(entities, componentNodes);

    let model = new DiagramModel();
    model.addAll(...Array.from(componentNodes.values()), ...Array.from(componentLinks.values()));
    return model;
}

function generateNodes(entities: Map<string, Component>): Map<string, ComponentModel> {
    let nodes: Map<string, ComponentModel> = new Map<string, ComponentModel>();
    entities?.forEach((component, _key) => {
        const componentNode = new ComponentModel(component.id, component);
        nodes.set(component.id, componentNode);
    });

    return nodes;
}

function generateLinks(entities: Map<string, Component>, nodes: Map<string, ComponentModel>): Map<string, ComponentLinkModel> {
    let links: Map<string, ComponentLinkModel> = new Map();
    let mappedLinkNodes: Map<string, string[]> = new Map();

    entities?.forEach((component, key) => {
        let callingComponent: ComponentModel | undefined = nodes.get(component.id);
        let associatedComponent: ComponentModel | undefined;

        if (!mappedLinkNodes.has(key)) {
            mappedLinkNodes.set(key, []);
        }

        component.connections.forEach(connection => {
            switch (connection.type) {
                case ConnectionType.HTTP:
                    const connectionMetadata = getMetadataFromConnectionId(connection.id);
                    if (connectionMetadata && connectionMetadata.type === ConnectionType.HTTP) {
                        associatedComponent = nodes.get(connectionMetadata.component);
                        if (callingComponent && associatedComponent) {
                            let sourcePort: ComponentPortModel | null = callingComponent.getPort(`right-${callingComponent.getID()}`);
                            let targetPort: ComponentPortModel | null = associatedComponent.getPort(`left-${associatedComponent.getID()}`);

                            if (sourcePort && targetPort) {
                                const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
                                let link: ComponentLinkModel = new ComponentLinkModel(linkId);
                                links.set(linkId, createLinks(sourcePort, targetPort, link));
                                link.setSourceNode(callingComponent.getID());
                                link.setTargetNode(associatedComponent.getID());
                                mappedLinkNodes.set(key, [...(mappedLinkNodes.get(key) || []), associatedComponent.getID()]);
                            }

                        }
                    }
                    break;
                case ConnectionType.Connector:
                    // TODO: Implement connector links
                    break;
            }

        })


        // component.attributes.forEach(attribute => {
        //     attribute.associations.forEach(association => {
        //         associatedComponent = nodes.get(association.associate);
        //         if (callingComponent && associatedComponent) {
        //             let sourcePort: ComponentPortModel = callingComponent.getPort(`right-${key}/${attribute.name}`);
        //             let targetPort: ComponentPortModel = associatedComponent.getPort(`left-${association.associate}`);

        //             if (sourcePort && targetPort) {
        //                 if (mappedLinkNodes.has(associatedComponent.getID()) &&
        //                     mappedLinkNodes.get(associatedComponent.getID()).includes(callingComponent.getID())) {
        //                     const linkId: string = Array.from(links.keys()).find(itemId =>
        //                         itemId.slice(itemId.indexOf('-') + 1).startsWith(associatedComponent.getID()) && itemId.endsWith(key)
        //                     );
        //                     if (linkId) {
        //                         const link2update = links.get(linkId);
        //                         link2update.cardinality.self = association.cardinality.associate;
        //                         link2update.setTargetPort(sourcePort);
        //                         link2update.setTargetNode(callingComponent.getID(), attribute.name);
        //                     }
        //                     const index = mappedLinkNodes.get(associatedComponent.getID()).indexOf(callingComponent.getID());
        //                     if (index > -1) {
        //                         mappedLinkNodes.get(associatedComponent.getID()).splice(index, 1);
        //                     }
        //                 } else {
        //                     const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
        //                     let link: ComponentLinkModel = new ComponentLinkModel(linkId, association.cardinality);
        //                     links.set(linkId, createLinks(sourcePort, targetPort, link));
        //                     link.setSourceNode(callingComponent.getID(), attribute.name);
        //                     link.setTargetNode(associatedComponent.getID());
        //                     mappedLinkNodes.set(key, [...mappedLinkNodes.get(key), associatedComponent.getID()]);
        //                 }
        //             }
        //         }
        //     });
        // });

        // component.inclusions.forEach((inclusion) => {
        //     associatedComponent = nodes.get(inclusion);
        //     if (callingComponent && associatedComponent) {
        //         let sourcePort: ComponentPortModel = callingComponent.getPort(`top-${key}`);
        //         let targetPort: ComponentPortModel = associatedComponent.getPort(`bottom-${inclusion}`);

        //         if (sourcePort && targetPort) {
        //             const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
        //             let link: ComponentLinkModel = new ComponentLinkModel(linkId, undefined);
        //             links.set(linkId, createLinks(sourcePort, targetPort, link));
        //         }
        //     }
        // })
    });

    return links;
}

function createLinks(sourcePort: ComponentPortModel, targetPort: ComponentPortModel, link: ComponentLinkModel): ComponentLinkModel {
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
