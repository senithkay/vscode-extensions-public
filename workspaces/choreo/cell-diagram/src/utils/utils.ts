/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DiagramEngine, DiagramModel, NodeModel, NodeModelGenerics, PortModelAlignment } from "@projectstorm/react-diagrams";
import {
    ComponentLinkModel,
    ComponentModel,
    ComponentPortModel,
    OverlayLayerFactory,
    ComponentFactory,
    ComponentLinkFactory,
    ComponentPortFactory,
    CellFactory,
    CellLinkFactory,
    CellPortFactory,
    CellLinkModel,
    CellPortModel,
    EmptyFactory,
    ExternalFactory,
    ExternalLinkFactory,
    ExternalLinkModel,
    ExternalModel,
    EmptyModel,
    ConnectionPortFactory,
    ConnectionFactory,
    ConnectionModel,
    ConnectionPortModel,
} from "../components";
import { Connection, ConnectionMetadata, ConnectionType, ConnectorMetadata, Project, ServiceMetadata } from "../types";
import { CellBounds } from "../components/Cell/CellNode/CellModel";
import { getEmptyNodeName, getNodePortId, getCellPortMetadata } from "../components/Cell/CellNode/cell-util";
import { CIRCLE_WIDTH, COMPONENT_NODE, CONNECTION_NODE, DOT_WIDTH, EMPTY_NODE, MAIN_CELL, MAIN_CELL_DEFAULT_HEIGHT, dagreEngine } from "../resources";
import { Orientation } from "../components/Connection/ConnectionNode/ConnectionModel";

export type CommonModel = ComponentModel | ConnectionModel | ExternalModel | EmptyModel;
interface NodesAndLinks {
    nodes: Nodes;
    links: Links;
}

interface Nodes {
    [key: string]: Map<string, CommonModel>;
}

interface Links {
    [key: string]: Map<string, ComponentLinkModel | ExternalLinkModel | CellLinkModel>;
}

export function generateEngine(): DiagramEngine {
    const engine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false,
    });
    engine.getLinkFactories().registerFactory(new ComponentLinkFactory());
    engine.getPortFactories().registerFactory(new ComponentPortFactory());
    engine.getNodeFactories().registerFactory(new ComponentFactory());

    engine.getPortFactories().registerFactory(new ConnectionPortFactory());
    engine.getNodeFactories().registerFactory(new ConnectionFactory());

    engine.getLinkFactories().registerFactory(new CellLinkFactory());
    engine.getPortFactories().registerFactory(new CellPortFactory());
    engine.getNodeFactories().registerFactory(new CellFactory());

    engine.getLinkFactories().registerFactory(new ExternalLinkFactory());
    engine.getNodeFactories().registerFactory(new ExternalFactory());

    engine.getNodeFactories().registerFactory(new EmptyFactory());

    engine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    return engine;
}

export function getNodesNLinks(project: Project): NodesAndLinks {
    const componentNodes: Map<string, CommonModel> = generateComponentNodes(project);
    const connectorNodes: Map<string, ConnectionModel> = generateConnectorNodes(project);
    const connectionNodes: Map<string, ConnectionModel> = generateConnectionNodes(project);
    const externalNodes: Map<string, ExternalModel> = generateExternalNodes();
    const emptyNodes: Map<string, EmptyModel> = generateEmptyNodes(project.name, [...connectionNodes.values(), ...connectorNodes.values()]);

    const componentLinks: Map<string, ComponentLinkModel> = generateComponentLinks(project, componentNodes);
    const cellLinks: Map<string, ComponentLinkModel> = generateCellLinks(project, emptyNodes, componentNodes);
    const connectorLinks: Map<string, ExternalLinkModel> = generateConnectorLinks(emptyNodes, connectorNodes);
    const connectionLinks: Map<string, ExternalLinkModel> = generateConnectionLinks(emptyNodes, connectionNodes);
    const externalLinks: Map<string, ExternalLinkModel> = generateExternalLinks(emptyNodes, externalNodes);

    return {
        nodes: {
            componentNodes,
            connectionNodes,
            connectorNodes,
            externalNodes,
            emptyNodes,
        },
        links: {
            componentLinks,
            cellLinks,
            connectorLinks,
            connectionLinks,
            externalLinks,
        },
    };
}

export function getComponentDiagramWidth(models: NodesAndLinks): number {
    const tempModel = new DiagramModel();
    tempModel.addAll(
        ...models.nodes.componentNodes.values(),
        ...models.links.componentLinks.values(),
        ...models.nodes.emptyNodes.values(),
        ...models.links.cellLinks.values()
    );
    // auto distribute component nodes, component links, empty nodes and cell links
    dagreEngine.redistribute(tempModel);
    // calculate component diagram width
    return calculateCellWidth(tempModel);
}

export function calculateCellWidth(model: DiagramModel) {
    const { maxX, minX, maxY, minY } = getComponentDiagramBoundaries(model);
    const layoutWidth = Math.max(maxX - minX, maxY - minY, MAIN_CELL_DEFAULT_HEIGHT);
    const cellWidth = (layoutWidth * 3) / 2;
    return cellWidth;
}

export function manualDistribute(model: DiagramModel): DiagramModel {
    // get component diagram boundaries and calculate center
    const { maxX, minX, maxY, minY } = getComponentDiagramBoundaries(model);
    const layoutCenterX = (maxX + minX) / 2;
    const layoutCenterY = (maxY + minY) / 2;
    const cellNode = model.getNode(MAIN_CELL);
    if (!cellNode) {
        console.error("Cell node not found");
        return model;
    }
    const cellWidth = cellNode.width;
    // center cell node
    const cellNodePosition = cellNode.getPosition().clone();
    cellNodePosition.x = layoutCenterX - cellWidth / 2;
    cellNodePosition.y = layoutCenterY - cellWidth / 2;
    cellNode.setPosition(cellNodePosition);
    // update empty node and connection node positions
    updateBoundNodePositions(cellNode, model);

    return model;
}

export function updateBoundNodePositions(cellNode: NodeModel<NodeModelGenerics>, model: DiagramModel) {
    const externalLinkOffset = Math.max(100, cellNode.width / 10);
    let nextConnectorNodeOffset = externalLinkOffset;
    for (const key in cellNode.getPorts()) {
        if (Object.prototype.hasOwnProperty.call(cellNode.getPorts(), key)) {
            const port = cellNode.getPorts()[key];
            // const portData = port.getID().split(PORT_NAME_JOIN_CHAR);
            const { bound, align, args } = getCellPortMetadata(port.getID());
            if(!bound || !align){
                console.error("Cannot get cell node port metadata from port id", port.getID());
                return;
            }
            const connectionId = args?.length > 0 ? args[0] : undefined;
            // change south bound positions
            if (bound === CellBounds.SouthBound && align === PortModelAlignment.BOTTOM) {
                const portPosition = port.getPosition().clone();
                // change connection link positions
                const connectionNode = model.getNode(connectionId);
                const defaultNodeWidth = CIRCLE_WIDTH + 24; // padding + circle border width
                if (connectionNode) {
                    portPosition.x = portPosition.x - connectionNode.width / 2;
                    portPosition.y = portPosition.y + nextConnectorNodeOffset;
                    connectionNode.setPosition(portPosition);
                    // if connection node width is greater than cell node width, next connection node should be placed below the previous one
                    nextConnectorNodeOffset =
                        nextConnectorNodeOffset === externalLinkOffset
                            ? connectionNode.width > defaultNodeWidth
                                ? externalLinkOffset + connectionNode.height
                                : externalLinkOffset
                            : externalLinkOffset;
                }
            }
            if (connectionId && bound === CellBounds.SouthBound && align === PortModelAlignment.TOP) {
                const portPosition = port.getPosition().clone();
                // change south bound empty node position
                model.getNode(getEmptyNodeName(EMPTY_NODE, CellBounds.SouthBound, connectionId)).setPosition(portPosition);
            }
            // change east bound positions
            if (connectionId && bound === CellBounds.EastBound && align === PortModelAlignment.RIGHT) {
                const portPosition = port.getPosition().clone();
                // change east bound external link position
                const connectionNode = model.getNode(connectionId);
                if (connectionNode) {
                    portPosition.x = portPosition.x + externalLinkOffset;
                    portPosition.y = portPosition.y - connectionNode.height / 2;
                    connectionNode.setPosition(portPosition);
                }
            }
            if (connectionId && bound === CellBounds.EastBound && align === PortModelAlignment.LEFT) {
                const portPosition = port.getPosition().clone();
                // change east bound empty node position
                model.getNode(getEmptyNodeName(EMPTY_NODE, CellBounds.EastBound, connectionId)).setPosition(portPosition);
            }
            // change west bound external link position
            if (bound === CellBounds.WestBound && align === PortModelAlignment.LEFT) {
                const portPosition = port.getPosition().clone();
                model.getNode(getEmptyNodeName(EMPTY_NODE, CellBounds.WestBound)).setPosition(portPosition.clone());
                portPosition.x = portPosition.x - externalLinkOffset;
                model.getNode(bound)?.setPosition(portPosition);
            }
            // change north bound positions
            if (bound === CellBounds.NorthBound && align === PortModelAlignment.TOP) {
                const portPosition = port.getPosition().clone();
                // change north bound empty node position
                model.getNode(getEmptyNodeName(EMPTY_NODE, CellBounds.NorthBound)).setPosition(portPosition.clone());
                // change north bound external link position
                portPosition.y = portPosition.y - externalLinkOffset;
                model.getNode(bound)?.setPosition(portPosition);
            }
        }
    }
}

export function getComponentDiagramBoundaries(model: DiagramModel) {
    let minX = 0,
        minY = 0,
        maxX = 0,
        maxY = 0;
    model.getNodes().forEach((node) => {
        if (!(node.getType() === COMPONENT_NODE || (node.getType() === CONNECTION_NODE && (node as ConnectionModel).connection.onPlatform))) {
            return;
        }
        const nodePosition = node.getPosition().clone();
        minX = Math.min(minX, nodePosition.x);
        minY = Math.min(minY, nodePosition.y);
        maxX = Math.max(maxX, nodePosition.x + node.width);
        maxY = Math.max(maxY, nodePosition.y + node.height);
    });
    return { maxX, minX, maxY, minY };
}

function generateComponentNodes(project: Project): Map<string, CommonModel> {
    const nodes: Map<string, CommonModel> = new Map<string, ComponentModel>();
    project.components?.forEach((component, _key) => {
        const componentNode = new ComponentModel(component.id, component);
        nodes.set(component.id, componentNode);
        component.connections?.forEach((connection) => {
            // add platform connections
            if (isConnectorConnection(connection) && connection.onPlatform) {
                const connectionNode = new ConnectionModel(connection.id, connection);
                nodes.set(connection.id, connectionNode);
            }
        });
    });
    project.configurations?.forEach((connection, _key) => {
        if (isConnectorConnection(connection) && connection.onPlatform) {
            const connectionNode = new ConnectionModel(connection.id, connection);
            nodes.set(connection.id, connectionNode);
        }
    });

    return nodes;
}
// other project connection nodes
function generateConnectionNodes(project: Project): Map<string, ConnectionModel> {
    const nodes: Map<string, ConnectionModel> = new Map<string, ConnectionModel>();
    project.components?.forEach((component, _key) => {
        component.connections?.forEach((connection) => {
            if (isExternalService(project.name, connection)) {
                const connectionNode = new ConnectionModel(connection.id, connection, Orientation.HORIZONTAL);
                nodes.set(connection.id, connectionNode);
            }
        });
    });

    return nodes;
}

// third party connector nodes ( not platform connector )
function generateConnectorNodes(project: Project): Map<string, ConnectionModel> {
    const nodes: Map<string, ConnectionModel> = new Map<string, ConnectionModel>();
    project.components?.forEach((component, _key) => {
        component.connections?.forEach((connection) => {
            if (isConnectorConnection(connection) && !connection.onPlatform) {
                const connectionNode = new ConnectionModel(connection.id, connection);
                nodes.set(connection.id, connectionNode);
            }
        });
    });
    project.configurations?.forEach((connection, _key) => {
        if (isConnectorConnection(connection) && !connection.onPlatform) {
            const connectionNode = new ConnectionModel(connection.id, connection);
            nodes.set(connection.id, connectionNode);
        }
    });

    return nodes;
}

function generateExternalNodes(): Map<string, ExternalModel> {
    const nodes: Map<string, ExternalModel> = new Map<string, ExternalModel>();

    const eastBoundExternalNode = new ExternalModel(CellBounds.EastBound);
    nodes.set(eastBoundExternalNode.getID(), eastBoundExternalNode);

    const northBoundExternalNode = new ExternalModel(CellBounds.NorthBound);
    nodes.set(northBoundExternalNode.getID(), northBoundExternalNode);

    const westBoundExternalNode = new ExternalModel(CellBounds.WestBound);
    nodes.set(westBoundExternalNode.getID(), westBoundExternalNode);

    return nodes;
}

function generateEmptyNodes(projectId: string, connectionNodes: ConnectionModel[]): Map<string, EmptyModel> {
    const DIAGRAM_END = 1000;
    const nodes: Map<string, EmptyModel> = new Map<string, EmptyModel>();

    const northBoundEmptyNode = new EmptyModel(EMPTY_NODE, CellBounds.NorthBound, CIRCLE_WIDTH);
    northBoundEmptyNode.setPosition(0, DIAGRAM_END * -1);
    nodes.set(northBoundEmptyNode.getID(), northBoundEmptyNode);

    const westBoundEmptyNode = new EmptyModel(EMPTY_NODE, CellBounds.WestBound, CIRCLE_WIDTH);
    westBoundEmptyNode.setPosition(DIAGRAM_END * -1, 0);
    nodes.set(westBoundEmptyNode.getID(), westBoundEmptyNode);

    let count = 0;
    connectionNodes.forEach((connectionNode, _key) => {
        if (isConnectorConnection(connectionNode.connection)) {
            const connectionEmptyNode = new EmptyModel(EMPTY_NODE, CellBounds.SouthBound, DOT_WIDTH, connectionNode.getID());
            connectionEmptyNode.setPosition(count++ * 30, DIAGRAM_END);
            nodes.set(connectionEmptyNode.getID(), connectionEmptyNode);
        } else if (isExternalService(projectId, connectionNode.connection)) {
            const connectionEmptyNode = new EmptyModel(EMPTY_NODE, CellBounds.EastBound, DOT_WIDTH, connectionNode.getID());
            connectionEmptyNode.setPosition(DIAGRAM_END, count++ * 30);
            nodes.set(connectionEmptyNode.getID(), connectionEmptyNode);
        }
    });

    return nodes;
}

function generateComponentLinks(project: Project, nodes: Map<string, CommonModel>): Map<string, ComponentLinkModel> {
    const links: Map<string, ComponentLinkModel> = new Map();

    project.components?.forEach((component, _key) => {
        const callingComponent: ComponentModel | undefined = nodes.get(component.id) as ComponentModel;

        component.connections.forEach((connection) => {
            const connectionMetadata = getConnectionMetadata(connection);
            if (
                connectionMetadata &&
                (connectionMetadata.type === ConnectionType.HTTP || connectionMetadata.type === ConnectionType.GRPC) &&
                !isExternalService(project.name, connection)
            ) {
                const associatedComponent = nodes.get(connectionMetadata.component) as ComponentModel;
                if (callingComponent && associatedComponent) {
                    const sourcePort: ComponentPortModel | null = callingComponent.getPort(`right-${callingComponent.getID()}`);
                    const targetPort: ComponentPortModel | null = associatedComponent.getPort(`left-${associatedComponent.getID()}`);

                    if (sourcePort && targetPort) {
                        const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
                        const link: ComponentLinkModel = new ComponentLinkModel(linkId);
                        links.set(linkId, createLinks(sourcePort, targetPort, link) as ComponentLinkModel);
                        link.setSourceNode(callingComponent.getID());
                        link.setTargetNode(associatedComponent.getID());
                    }
                }
            }
            if (isConnectorConnection(connection) && connection.onPlatform) {
                const associatedComponent = nodes.get(connection.id) as ConnectionModel;
                if (callingComponent && associatedComponent) {
                    const sourcePort: ComponentPortModel | null = callingComponent.getPort(`bottom-${callingComponent.getID()}`);
                    const targetPort: ConnectionPortModel | null = associatedComponent.getPort(`top-${associatedComponent.getID()}`);

                    if (sourcePort && targetPort) {
                        const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
                        const link: ComponentLinkModel = new ComponentLinkModel(linkId);
                        links.set(linkId, createLinks(sourcePort, targetPort, link) as ComponentLinkModel);
                        link.setSourceNode(callingComponent.getID());
                        link.setTargetNode(associatedComponent.getID());
                    }
                }
            }
        });
    });

    return links;
}

function generateConnectorLinks(emptyNodes: Map<string, EmptyModel>, connectorNodes: Map<string, ConnectionModel>): Map<string, ExternalLinkModel> {
    const links: Map<string, ExternalLinkModel> = new Map();

    connectorNodes?.forEach((connectionNode, _key) => {
        const southBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.SouthBound, connectionNode.getID()));
        if (!southBoundEmptyNode) {
            return;
        }
        const sourcePort: CellPortModel | null = southBoundEmptyNode.getPort(getNodePortId(southBoundEmptyNode.getID(), PortModelAlignment.BOTTOM));
        const targetPort: ConnectionPortModel | null = connectionNode.getPort(`top-${connectionNode.getID()}`);

        if (sourcePort && targetPort) {
            const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
            const link: ExternalLinkModel = new ExternalLinkModel(linkId);
            links.set(linkId, createLinks(sourcePort, targetPort, link) as ExternalLinkModel);
            link.setSourceNode(southBoundEmptyNode.getID());
            link.setTargetNode(connectionNode.getID());
        }
    });

    return links;
}

function generateConnectionLinks(emptyNodes: Map<string, EmptyModel>, connectionNodes: Map<string, ConnectionModel>): Map<string, ExternalLinkModel> {
    const links: Map<string, ExternalLinkModel> = new Map();

    connectionNodes?.forEach((connectionNode, _key) => {
        const eastboundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.EastBound, connectionNode.getID()));
        if (!eastboundEmptyNode) {
            return;
        }
        const sourcePort: CellPortModel | null = eastboundEmptyNode.getPort(getNodePortId(eastboundEmptyNode.getID(), PortModelAlignment.RIGHT));
        const targetPort: ConnectionPortModel | null = connectionNode.getPort(`left-${connectionNode.getID()}`);

        if (sourcePort && targetPort) {
            const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
            const link: ExternalLinkModel = new ExternalLinkModel(linkId);
            links.set(linkId, createLinks(sourcePort, targetPort, link) as ExternalLinkModel);
            link.setSourceNode(eastboundEmptyNode.getID());
            link.setTargetNode(connectionNode.getID());
        }
    });

    return links;
}

function generateCellLinks(project: Project, emptyNodes: Map<string, EmptyModel>, nodes: Map<string, CommonModel>): Map<string, CellLinkModel> {
    const links: Map<string, CellLinkModel> = new Map();

    project.components?.forEach((component, _key) => {
        const targetComponent: ComponentModel | undefined = nodes.get(component.id) as ComponentModel;
        // internet/public exposed services links
        if (targetComponent) {
            let isExposed = false;
            for (const serviceId in component.services) {
                if (Object.prototype.hasOwnProperty.call(component.services, serviceId)) {
                    const service = component.services[serviceId];
                    isExposed = isExposed || service.deploymentMetadata?.gateways.internet.isExposed;
                }
            }
            const northBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.NorthBound));
            if (isExposed && northBoundEmptyNode) {
                const sourcePort: CellPortModel | null = northBoundEmptyNode.getPort(getNodePortId(northBoundEmptyNode.getID(), PortModelAlignment.BOTTOM));
                const targetPort: ComponentPortModel | null = targetComponent.getPort(`top-${targetComponent.getID()}`);
                if (sourcePort && targetPort) {
                    const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
                    const link: CellLinkModel = new CellLinkModel(linkId);
                    links.set(linkId, createLinks(sourcePort, targetPort, link) as CellLinkModel);
                    link.setSourceNode(northBoundEmptyNode.getID());
                    link.setTargetNode(targetComponent.getID());
                }
            }
        }
        // intranet/org exposed services links
        if (targetComponent) {
            let isExposed = false;
            for (const serviceId in component.services) {
                if (Object.prototype.hasOwnProperty.call(component.services, serviceId)) {
                    const service = component.services[serviceId];
                    isExposed = isExposed || service.deploymentMetadata?.gateways.intranet.isExposed;
                }
            }
            const northBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.WestBound));
            if (isExposed && northBoundEmptyNode) {
                const sourcePort: CellPortModel | null = northBoundEmptyNode.getPort(getNodePortId(northBoundEmptyNode.getID(), PortModelAlignment.RIGHT));
                const targetPort: ComponentPortModel | null = targetComponent.getPort(`left-${targetComponent.getID()}`);
                if (sourcePort && targetPort) {
                    const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
                    const link: CellLinkModel = new CellLinkModel(linkId);
                    links.set(linkId, createLinks(sourcePort, targetPort, link) as CellLinkModel);
                    link.setSourceNode(northBoundEmptyNode.getID());
                    link.setTargetNode(targetComponent.getID());
                }
            }
        }
        // connection links
        component.connections.forEach((connection) => {
            if (isConnectorConnection(connection)) {
                const southBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.SouthBound, connection.id));
                if (targetComponent && southBoundEmptyNode) {
                    const sourcePort: ComponentPortModel | null = targetComponent.getPort(`bottom-${targetComponent.getID()}`);
                    const targetPort: CellPortModel | null = southBoundEmptyNode.getPort(getNodePortId(southBoundEmptyNode.getID(), PortModelAlignment.TOP));

                    if (sourcePort && targetPort) {
                        const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
                        const link: CellLinkModel = new CellLinkModel(linkId);
                        links.set(linkId, createLinks(sourcePort, targetPort, link) as CellLinkModel);
                        link.setSourceNode(targetComponent.getID());
                        link.setTargetNode(southBoundEmptyNode.getID());
                    }
                }
            } else if (isExternalService(project.name, connection)) {
                const eastBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.EastBound, connection.id));
                if (targetComponent && eastBoundEmptyNode) {
                    const sourcePort: ComponentPortModel | null = targetComponent.getPort(`right-${targetComponent.getID()}`);
                    const targetPort: CellPortModel | null = eastBoundEmptyNode.getPort(getNodePortId(eastBoundEmptyNode.getID(), PortModelAlignment.LEFT));

                    if (sourcePort && targetPort) {
                        const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
                        const link: CellLinkModel = new CellLinkModel(linkId);
                        links.set(linkId, createLinks(sourcePort, targetPort, link) as CellLinkModel);
                        link.setSourceNode(targetComponent.getID());
                        link.setTargetNode(eastBoundEmptyNode.getID());
                    }
                }
            }
        });
    });

    return links;
}

function generateExternalLinks(emptyNodes: Map<string, EmptyModel>, externalNodes: Map<string, ExternalModel>): Map<string, ExternalLinkModel> {
    const links: Map<string, ExternalLinkModel> = new Map();
    // East bound external node link
    const eastBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.EastBound));
    if (eastBoundEmptyNode) {
        const eastBoundLink = createExternalLink(eastBoundEmptyNode, externalNodes, CellBounds.EastBound, PortModelAlignment.RIGHT);
        if (eastBoundLink) {
            links.set(eastBoundLink.getID(), eastBoundLink);
        }
    }
    // North bound external node link
    const northBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.NorthBound));
    if (northBoundEmptyNode) {
        const northBoundLink = createExternalLink(northBoundEmptyNode, externalNodes, CellBounds.NorthBound, PortModelAlignment.TOP, true);
        if (northBoundLink) {
            links.set(northBoundLink.getID(), northBoundLink);
        }
    }
    // West bound external node link
    const westBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.WestBound));
    if (westBoundEmptyNode) {
        const westBoundLink = createExternalLink(westBoundEmptyNode, externalNodes, CellBounds.WestBound, PortModelAlignment.LEFT, true);
        if (westBoundLink) {
            links.set(westBoundLink.getID(), westBoundLink);
        }
    }
    return links;
}

function createLinks(
    sourcePort: ComponentPortModel,
    targetPort: ComponentPortModel,
    link: ComponentLinkModel | ExternalLinkModel | CellLinkModel
): ComponentLinkModel | ExternalLinkModel | CellLinkModel {
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}

function createExternalLink(
    emptyNode: EmptyModel,
    externalNodes: Map<string, ExternalModel>,
    bounds: CellBounds,
    alignment: PortModelAlignment,
    switchArrow = false
) {
    const sourcePort: CellPortModel | null = emptyNode.getPort(getNodePortId(emptyNode.getID(), alignment));
    const targetNode = externalNodes.get(bounds);
    const targetPort = targetNode?.getPort(`${getOppositeAlignment(alignment)}-${targetNode.getID()}`);

    if (sourcePort && targetNode && targetPort) {
        const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
        const link: ExternalLinkModel = new ExternalLinkModel(linkId);

        if (switchArrow) {
            link.setSourceNode(targetNode.getID());
            link.setTargetNode(emptyNode.getID());
            return createLinks(targetPort, sourcePort, link) as ExternalLinkModel;
        } else {
            link.setSourceNode(emptyNode.getID());
            link.setTargetNode(targetNode.getID());
            return createLinks(sourcePort, targetPort, link) as ExternalLinkModel;
        }
    }
    return undefined;
}

function getOppositeAlignment(alignment: PortModelAlignment): PortModelAlignment {
    switch (alignment) {
        case PortModelAlignment.LEFT:
            return PortModelAlignment.RIGHT;
        case PortModelAlignment.RIGHT:
            return PortModelAlignment.LEFT;
        case PortModelAlignment.TOP:
            return PortModelAlignment.BOTTOM;
        case PortModelAlignment.BOTTOM:
            return PortModelAlignment.TOP;
    }
}

export function getConnectionMetadata(connection: Connection): ConnectionMetadata | null {
    const ids = connection.id.split(":");
    if (ids.length == 4) {
        return {
            type: connection.type,
            organization: ids[0],
            project: ids[1],
            component: ids[2],
            service: ids[3],
        } as ServiceMetadata;
    } else if (isConnectorConnection(connection) && ids.length == 2) {
        return {
            type: connection.type,
            organization: ids[0],
            package: ids[1],
        } as ConnectorMetadata;
    }
    return null;
}

export function getConnectionIdFromMetadata(metadata: ConnectionMetadata): string {
    switch (metadata.type) {
        case ConnectionType.HTTP:
            return `${metadata.organization}:${metadata.project}:${metadata.component}:${metadata.service}`;
        case ConnectionType.Connector:
        case ConnectionType.Datastore:
            return `${metadata.organization}:${(metadata as ConnectorMetadata).package}`;
        default:
            return "";
    }
}

export function getComponentIdFromMetadata(organization: string, project: string, component: string): string {
    return `${organization}:${project}:${component}`;
}

// check external service
export function isExternalService(projectId: string, connection: Connection): boolean {
    const metadata = getConnectionMetadata(connection);
    return !isConnectorConnection(connection) && metadata && (metadata as ServiceMetadata).project !== projectId;
}

// check is connector connection
export function isConnectorConnection(connection: Connection): boolean {
    // connector and datastore treat as connector connections
    return connection.type === ConnectionType.Connector || connection.type === ConnectionType.Datastore;
}
