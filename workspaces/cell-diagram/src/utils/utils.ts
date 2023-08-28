/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DiagramEngine, DiagramModel, PortModelAlignment } from "@projectstorm/react-diagrams";
import {
    ComponentLinkModel,
    ComponentModel,
    ComponentPortModel,
    OverlayLayerFactory,
    ComponentFactory,
    ComponentLinkFactory,
    ComponentPortFactory,
    ConnectorPortModel,
    ConnectorFactory,
    ConnectorPortFactory,
    ConnectorLinkFactory,
    CellFactory,
    CellLinkFactory,
    CellPortFactory,
    CellLinkModel,
    CellPortModel,
} from "../components";
import { Component, Connection, ConnectionMetadata, ConnectionType, Project } from "../types";
import { ConnectorModel } from "../components/Connector/ConnectorNode/ConnectorModel";
import { ConnectorLinkModel } from "../components/Connector/ConnectorLink/ConnectorLinkModel";
import { CellBounds, CellModel } from "../components/Cell/CellNode/CellModel";
import { getCellPortId } from "../components/Cell/CellNode/cell-util";
import { MAIN_CELL } from "../resources";

export function generateEngine(): DiagramEngine {
    const engine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false,
    });
    engine.getLinkFactories().registerFactory(new ComponentLinkFactory());
    engine.getPortFactories().registerFactory(new ComponentPortFactory());
    engine.getNodeFactories().registerFactory(new ComponentFactory());

    engine.getLinkFactories().registerFactory(new ConnectorLinkFactory());
    engine.getPortFactories().registerFactory(new ConnectorPortFactory());
    engine.getNodeFactories().registerFactory(new ConnectorFactory());

    engine.getLinkFactories().registerFactory(new CellLinkFactory());
    engine.getPortFactories().registerFactory(new CellPortFactory());
    engine.getNodeFactories().registerFactory(new CellFactory());

    engine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    return engine;
}

export function modelMapper(project: Project): DiagramModel {
    let componentNodes: Map<string, ComponentModel> = generateComponentNodes(project);
    let componentLinks: Map<string, ComponentLinkModel> = generateComponentLinks(project, componentNodes);
    let connectorNodes: Map<string, ConnectorModel> = generateConnectorNodes(project);

    let cellNode = new CellModel(MAIN_CELL, Array.from(connectorNodes.values()));
    let cellLinks: Map<string, ComponentLinkModel> = generateCellLinks(project, cellNode, componentNodes);

    let connectorLinks: Map<string, ComponentLinkModel> = generateConnectorLinks(cellNode, connectorNodes);

    let model = new DiagramModel();
    model.addAll(
        cellNode,
        ...Array.from(cellLinks.values()),
        ...Array.from(componentNodes.values()),
        ...Array.from(componentLinks.values()),
        ...Array.from(connectorNodes.values()),
        ...Array.from(connectorLinks.values())
    );
    return model;
}

function generateComponentNodes(project: Project): Map<string, ComponentModel> {
    let nodes: Map<string, ComponentModel> = new Map<string, ComponentModel>();
    project.components?.forEach((component, _key) => {
        const componentNode = new ComponentModel(component.id, component);
        nodes.set(component.id, componentNode);
    });

    return nodes;
}

function generateConnectorNodes(project: Project): Map<string, ConnectorModel> {
    let nodes: Map<string, ConnectorModel> = new Map<string, ConnectorModel>();
    project.components?.forEach((component, _key) => {
        component.connections?.forEach((connection) => {
            if (connection.type === ConnectionType.Connector) {
                const connectorNode = new ConnectorModel(connection.id, connection);
                nodes.set(connection.id, connectorNode);
            }
        });
    });

    return nodes;
}

function generateComponentLinks(project: Project, nodes: Map<string, ComponentModel>): Map<string, ComponentLinkModel> {
    let links: Map<string, ComponentLinkModel> = new Map();

    project.components?.forEach((component, key) => {
        let callingComponent: ComponentModel | undefined = nodes.get(component.id);
        let associatedComponent: ComponentModel | undefined;

        component.connections.forEach((connection) => {
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
                    }
                }
            }
        });
    });

    return links;
}

function generateConnectorLinks(cellNode: CellModel, connectorNodes: Map<string, ConnectorModel>): Map<string, ConnectorLinkModel> {
    let links: Map<string, ConnectorLinkModel> = new Map();

    connectorNodes?.forEach((connectorNode, key) => {
        let sourcePort: CellPortModel | null = cellNode.getPort(
            getCellPortId(cellNode.getID(), CellBounds.SouthBound, PortModelAlignment.BOTTOM, connectorNode.getID())
        );
        let targetPort: ConnectorPortModel | null = connectorNode.getPort(`top-${connectorNode.getID()}`);

        if (sourcePort && targetPort) {
            const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
            let link: ConnectorLinkModel = new ConnectorLinkModel(linkId);
            links.set(linkId, createLinks(sourcePort, targetPort, link));
            link.setSourceNode(cellNode.getID());
            link.setTargetNode(connectorNode.getID());
        }
    });

    return links;
}

function generateCellLinks(project: Project, cellNode: CellModel, nodes: Map<string, ComponentModel>): Map<string, CellLinkModel> {
    let links: Map<string, ComponentLinkModel> = new Map();

    project.components?.forEach((component, key) => {
        let targetComponent: ComponentModel | undefined = nodes.get(component.id);
        // public exposed services links
        if (targetComponent) {
            let isExposed = false;
            for (const serviceId in component.services) {
                if (Object.prototype.hasOwnProperty.call(component.services, serviceId)) {
                    const service = component.services[serviceId];
                    isExposed = isExposed || service.isExposedToInternet;
                }
            }
            if (isExposed) {
                let sourcePort: CellPortModel | null = cellNode.getPort(getCellPortId(cellNode.getID(), CellBounds.NorthBound, PortModelAlignment.BOTTOM));
                let targetPort: ComponentPortModel | null = targetComponent.getPort(`top-${targetComponent.getID()}`);
                if (sourcePort && targetPort) {
                    const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
                    let link: CellLinkModel = new CellLinkModel(linkId);
                    links.set(linkId, createLinks(sourcePort, targetPort, link));
                    link.setSourceNode(cellNode.getID());
                    link.setTargetNode(targetComponent.getID());
                }
            }
        }
        // org service links
        component.connections.forEach((connection) => {
            const connectionMetadata = getMetadataFromConnection(connection);
            if (
                connectionMetadata &&
                (connectionMetadata.type === ConnectionType.HTTP || connectionMetadata.type === ConnectionType.GRPC) &&
                connectionMetadata.organization !== project.id
            ) {
                if (targetComponent) {
                    let sourcePort: ComponentPortModel | null = targetComponent.getPort(`right-${targetComponent.getID()}`);
                    let targetPort: CellPortModel | null = cellNode.getPort(getCellPortId(cellNode.getID(), CellBounds.EastBound, PortModelAlignment.LEFT));

                    if (sourcePort && targetPort) {
                        const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
                        let link: CellLinkModel = new CellLinkModel(linkId);
                        links.set(linkId, createLinks(sourcePort, targetPort, link));
                        link.setSourceNode(targetComponent.getID());
                        link.setTargetNode(cellNode.getID());
                    }
                }
            }
        });
        // connector links
        component.connections.forEach((connection) => {
            if (connection.type === ConnectionType.Connector) {
                if (targetComponent) {
                    let sourcePort: ComponentPortModel | null = targetComponent.getPort(`bottom-${targetComponent.getID()}`);
                    let targetPort: CellPortModel | null = cellNode.getPort(getCellPortId(cellNode.getID(), CellBounds.SouthBound, PortModelAlignment.TOP, connection.id));

                    if (sourcePort && targetPort) {
                        const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
                        let link: CellLinkModel = new CellLinkModel(linkId);
                        links.set(linkId, createLinks(sourcePort, targetPort, link));
                        link.setSourceNode(targetComponent.getID());
                        link.setTargetNode(cellNode.getID());
                    }
                }
            }
        });
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
    const ids = connection.id.split(":");
    if (ids.length == 4) {
        return {
            type: connection.type,
            organization: ids[0],
            project: ids[1],
            component: ids[2],
            service: ids[3],
        };
    } else if (connection.type === ConnectionType.Connector && ids.length == 2) {
        return {
            type: ConnectionType.Connector,
            organization: ids[0],
            package: ids[1],
        };
    }
    return null;
}

export function getConnectionIdFromMetadata(metadata: ConnectionMetadata): string {
    switch (metadata.type) {
        case ConnectionType.HTTP:
            return `${metadata.organization}:${metadata.project}:${metadata.component}:${metadata.service}`;
        case ConnectionType.Connector:
            return `${metadata.organization}:${metadata.package}`;
        default:
            return "";
    }
}

export function getComponentIdFromMetadata(organization: string, project: string, component: string): string {
    return `${organization}:${project}:${component}`;
}
