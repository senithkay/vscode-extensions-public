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
    ComponentLinkModel, ComponentModel, ComponentPortModel, OverlayLayerFactory, ComponentFactory, ComponentLinkFactory, ComponentPortFactory, ConnectorPortModel, ConnectorFactory, ConnectorPortFactory, ConnectorLinkFactory
} from '../components';
import { Component, Connection, ConnectionMetadata, ConnectionType } from '../types';
import { ConnectorModel } from '../components/Connector/ConnectorNode/ConnectorModel';
import { ConnectorLinkModel } from '../components/Connector/ConnectorLink/ConnectorLinkModel';

export function generateEngine(): DiagramEngine {
    const engine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false
    });
    engine.getLinkFactories().registerFactory(new ComponentLinkFactory());
    engine.getPortFactories().registerFactory(new ComponentPortFactory());
    engine.getNodeFactories().registerFactory(new ComponentFactory());
    engine.getLinkFactories().registerFactory(new ConnectorLinkFactory());
    engine.getPortFactories().registerFactory(new ConnectorPortFactory());
    engine.getNodeFactories().registerFactory(new ConnectorFactory());
    engine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    return engine;
}

export function modelMapper(entities: Map<string, Component>): DiagramModel {
    let componentNodes: Map<string, ComponentModel> = generateComponentNodes(entities);
    let componentLinks: Map<string, ComponentLinkModel> = generateComponentLinks(entities, componentNodes);
    let connectorNodes: Map<string, ConnectorModel> = generateConnectorNodes(entities);
    let connectorLinks: Map<string, ComponentLinkModel> = generateConnectorLinks(entities, componentNodes, connectorNodes);

    let model = new DiagramModel();
    model.addAll(
        ...Array.from(componentNodes.values()),
        ...Array.from(componentLinks.values()),
        ...Array.from(connectorNodes.values()),
        ...Array.from(connectorLinks.values())
    );
    return model;
}

function generateComponentNodes(entities: Map<string, Component>): Map<string, ComponentModel> {
    let nodes: Map<string, ComponentModel> = new Map<string, ComponentModel>();
    entities?.forEach((component, _key) => {
        const componentNode = new ComponentModel(component.id, component);
        nodes.set(component.id, componentNode);
    });

    return nodes;
}

function generateConnectorNodes(entities: Map<string, Component>): Map<string, ConnectorModel> {
    let nodes: Map<string, ConnectorModel> = new Map<string, ConnectorModel>();
    entities?.forEach((component, _key) => {
        component.connections?.forEach(connection => {
            if (connection.type === ConnectionType.Connector) {
                const connectorNode = new ConnectorModel(connection.id, connection);
                nodes.set(connection.id, connectorNode);
            }
        })
    });

    return nodes;
}

function generateComponentLinks(entities: Map<string, Component>, nodes: Map<string, ComponentModel>): Map<string, ComponentLinkModel> {
    let links: Map<string, ComponentLinkModel> = new Map();
    let mappedLinkNodes: Map<string, string[]> = new Map();

    entities?.forEach((component, key) => {
        let callingComponent: ComponentModel | undefined = nodes.get(component.id);
        let associatedComponent: ComponentModel | undefined;

        if (!mappedLinkNodes.has(key)) {
            mappedLinkNodes.set(key, []);
        }

        component.connections.forEach(connection => {
            const connectionMetadata = getMetadataFromConnection(connection);
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
        })
    });

    return links;
}

function generateConnectorLinks(entities: Map<string, Component>, componentNodes: Map<string, ComponentModel>,  connectorNodes: Map<string, ConnectorModel>): Map<string, ConnectorLinkModel> {
    let links: Map<string, ConnectorLinkModel> = new Map();
    let mappedLinkNodes: Map<string, string[]> = new Map();

    entities?.forEach((component, key) => {
        let callingComponent: ComponentModel | undefined = componentNodes.get(component.id);
        let associatedComponent: ConnectorModel | undefined;

        if (!mappedLinkNodes.has(key)) {
            mappedLinkNodes.set(key, []);
        }

        component.connections.forEach(connection => {
            if (connection.type === ConnectionType.Connector) {
                associatedComponent = connectorNodes.get(connection.id);
                if (callingComponent && associatedComponent) {
                    let sourcePort: ComponentPortModel | null = callingComponent.getPort(`bottom-${callingComponent.getID()}`);
                    let targetPort: ConnectorPortModel | null = associatedComponent.getPort(`top-${associatedComponent.getID()}`);

                    if (sourcePort && targetPort) {
                        const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
                        let link: ConnectorLinkModel = new ConnectorLinkModel(linkId);
                        links.set(linkId, createLinks(sourcePort, targetPort, link));
                        link.setSourceNode(callingComponent.getID());
                        link.setTargetNode(associatedComponent.getID());
                        mappedLinkNodes.set(key, [...(mappedLinkNodes.get(key) || []), associatedComponent.getID()]);
                    }
                }
            }
        })
    });

    return links;
}

function createLinks(sourcePort: ComponentPortModel, targetPort: ComponentPortModel, link: ComponentLinkModel): ComponentLinkModel {
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}

export function getMetadataFromConnection(connection: Connection): ConnectionMetadata | null {
    const ids = connection.id.split(':');
    if (connection.type === ConnectionType.HTTP && ids.length == 4) {
        return {
            type: ConnectionType.HTTP,
            organization: ids[0],
            project: ids[1],
            component: ids[2],
            service: ids[3]
        }
    } else if (connection.type === ConnectionType.Connector && ids.length == 2) {
        return {
            type: ConnectionType.Connector,
            organization: ids[0],
            package: ids[1],
        }
    }
    return null;
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
