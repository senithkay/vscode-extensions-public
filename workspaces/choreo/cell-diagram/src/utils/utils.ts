/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, {
    DiagramEngine,
    DiagramModel,
    NodeModel,
    NodeModelGenerics,
    PortModelAlignment,
} from "@projectstorm/react-diagrams";
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
} from "../components";
import { Connection, ConnectionMetadata, ConnectionType, ConnectorMetadata, Project } from "../types";
import { ConnectorModel } from "../components/Connector/ConnectorNode/ConnectorModel";
import { CellBounds, CellModel } from "../components/Cell/CellNode/CellModel";
import { getEmptyNodeName, getNodePortId } from "../components/Cell/CellNode/cell-util";
import { COMPONENT_NODE, EMPTY_NODE, MAIN_CELL, MAIN_CELL_DEFAULT_HEIGHT, dagreEngine } from "../resources";

export function generateEngine(): DiagramEngine {
    const engine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false,
    });
    engine.getLinkFactories().registerFactory(new ComponentLinkFactory());
    engine.getPortFactories().registerFactory(new ComponentPortFactory());
    engine.getNodeFactories().registerFactory(new ComponentFactory());

    engine.getPortFactories().registerFactory(new ConnectorPortFactory());
    engine.getNodeFactories().registerFactory(new ConnectorFactory());

    engine.getLinkFactories().registerFactory(new CellLinkFactory());
    engine.getPortFactories().registerFactory(new CellPortFactory());
    engine.getNodeFactories().registerFactory(new CellFactory());

    engine.getLinkFactories().registerFactory(new ExternalLinkFactory());
    engine.getNodeFactories().registerFactory(new ExternalFactory());

    engine.getNodeFactories().registerFactory(new EmptyFactory());

    engine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    return engine;
}

interface NodesAndLinks {
    nodes: Nodes,
    links: Links
}

interface Nodes {
    [key: string]: Map<string, ComponentModel | ConnectorModel | ExternalModel | EmptyModel>
}

interface Links {
    [key: string]: Map<string, ComponentLinkModel | ExternalLinkModel | CellLinkModel>
}

export function getNodesNLinks(project: Project): NodesAndLinks {
    const componentNodes: Map<string, ComponentModel> = generateComponentNodes(project);
    const connectorNodes: Map<string, ConnectorModel> = generateConnectorNodes(project);
    const externalNodes: Map<string, ExternalModel> = generateExternalNodes();
    const emptyNodes: Map<string, EmptyModel> = generateEmptyNodes(connectorNodes);

    const componentLinks: Map<string, ComponentLinkModel> = generateComponentLinks(project, componentNodes);
    const cellLinks: Map<string, ComponentLinkModel> = generateCellLinks(project, emptyNodes, componentNodes);
    const connectorLinks: Map<string, ExternalLinkModel> = generateConnectorLinks(emptyNodes, connectorNodes);
    const externalLinks: Map<string, ExternalLinkModel> = generateExternalLinks(emptyNodes, externalNodes);

    return {
        nodes: {
            componentNodes,
            connectorNodes,
            externalNodes,
            emptyNodes,
        },
        links: {
            componentLinks,
            cellLinks,
            connectorLinks,
            externalLinks,
        }
    }
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

export function manualDistribute(model: DiagramModel): DiagramModel {
    // get component diagram boundaries and calculate center
    const { maxX, minX, maxY, minY } = getComponentDiagramBoundaries(model);
    console.log(">>> cell boundaries", maxX, minX, maxY, minY)
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
    // update empty node and connector node positions
    updateBoundNodePositions(cellNode, model);

    return model;
}

export function updateBoundNodePositions(cellNode : NodeModel<NodeModelGenerics>, model: DiagramModel) {
    const externalLinkOffset = Math.max(100, cellNode.width / 10);
    for (const key in cellNode.getPorts()) {
        if (Object.prototype.hasOwnProperty.call(cellNode.getPorts(), key)) {
            const port = cellNode.getPorts()[key];
            const portData = port.getID().split("-");
            // change south bound positions
            if (portData.length > 3 && portData[2] === CellBounds.SouthBound && portData[0] === PortModelAlignment.BOTTOM) {
                const portPosition = port.getPosition().clone();
                // change connector link positions
                portPosition.x = portPosition.x - 40;
                portPosition.y = portPosition.y + externalLinkOffset;
                model.getNode(portData[3])?.setPosition(portPosition);
            }
            if (portData.length > 3 && portData[2] === CellBounds.SouthBound && portData[0] === PortModelAlignment.TOP) {
                const portPosition = port.getPosition().clone();
                // change south bound empty node position
                model.getNode(getEmptyNodeName(EMPTY_NODE, CellBounds.SouthBound, portData[3])).setPosition(portPosition);
            }
            // change east bound positions
            if (portData.length > 2 && portData[2] === CellBounds.EastBound && portData[0] === PortModelAlignment.RIGHT) {
                const portPosition = port.getPosition().clone();
                // change east bound external link position
                portPosition.x = portPosition.x + externalLinkOffset;
                model.getNode(portData[2])?.setPosition(portPosition);
            }
            if (portData.length > 2 && portData[2] === CellBounds.EastBound && portData[0] === PortModelAlignment.LEFT) {
                const portPosition = port.getPosition().clone();
                // change east bound empty node position
                model.getNode(getEmptyNodeName(EMPTY_NODE, CellBounds.EastBound)).setPosition(portPosition);
            }
            // // change west bound external link position
            if (portData.length > 2 && portData[2] === CellBounds.WestBound && portData[0] === PortModelAlignment.LEFT) {
                const portPosition = port.getPosition().clone();
                model.getNode(getEmptyNodeName(EMPTY_NODE, CellBounds.WestBound)).setPosition(portPosition.clone());
                portPosition.x = portPosition.x - externalLinkOffset;
                model.getNode(portData[2])?.setPosition(portPosition);
            }
            // change north bound positions
            if (portData.length > 2 && portData[2] === CellBounds.NorthBound && portData[0] === PortModelAlignment.TOP) {
                const portPosition = port.getPosition().clone();
                // change north bound empty node position
                model.getNode(getEmptyNodeName(EMPTY_NODE, CellBounds.NorthBound)).setPosition(portPosition.clone());
                // change north bound external link position
                portPosition.y = portPosition.y - externalLinkOffset;
                model.getNode(portData[2])?.setPosition(portPosition);
            }
        }
    }
}


export function modelMapper(project: Project): DiagramModel {
    const componentNodes: Map<string, ComponentModel> = generateComponentNodes(project);
    const connectorNodes: Map<string, ConnectorModel> = generateConnectorNodes(project);
    const externalNodes: Map<string, ExternalModel> = generateExternalNodes();
    const emptyNodes: Map<string, EmptyModel> = generateEmptyNodes(connectorNodes);

    const componentLinks: Map<string, ComponentLinkModel> = generateComponentLinks(project, componentNodes);
    const cellLinks: Map<string, ComponentLinkModel> = generateCellLinks(project, emptyNodes, componentNodes);
    const connectorLinks: Map<string, ExternalLinkModel> = generateConnectorLinks(emptyNodes, connectorNodes);
    const externalLinks: Map<string, ExternalLinkModel> = generateExternalLinks(emptyNodes, externalNodes);

    const tempModel = new DiagramModel();
    tempModel.addAll(
        ...Array.from(componentNodes.values()),
        ...Array.from(componentLinks.values()),
        ...Array.from(emptyNodes.values()),
        ...Array.from(cellLinks.values())
    );
    dagreEngine.redistribute(tempModel);
    const cellWidth = calculateCellWidth(tempModel);

    const cellNode = new CellModel(MAIN_CELL, cellWidth, Array.from(connectorNodes.values()));

    const model = new DiagramModel();
    model.addAll(
        cellNode,
        ...Array.from(componentNodes.values()),
        ...Array.from(componentLinks.values()),
        ...Array.from(externalNodes.values()),
        ...Array.from(connectorNodes.values()),
        ...Array.from(externalLinks.values()),
        ...Array.from(connectorLinks.values()),
        ...Array.from(emptyNodes.values()),
        ...Array.from(cellLinks.values())
    );

    return model;
}

export function calculateCellWidth(model: DiagramModel) {
    const { maxX, minX, maxY, minY } = getComponentDiagramBoundaries(model);
    const layoutWidth = Math.max(maxX - minX, maxY - minY, MAIN_CELL_DEFAULT_HEIGHT);
    const cellWidth = (layoutWidth * 3) / 2;
    return cellWidth;
}

export function getComponentDiagramBoundaries(model: DiagramModel) {
    let minX = 0,
        minY = 0,
        maxX = 0,
        maxY = 0;
    model.getNodes().forEach((node) => {
        if (node.getType() !== COMPONENT_NODE) {
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

function generateComponentNodes(project: Project): Map<string, ComponentModel> {
    const nodes: Map<string, ComponentModel> = new Map<string, ComponentModel>();
    project.components?.forEach((component, _key) => {
        const componentNode = new ComponentModel(component.id, component);
        nodes.set(component.id, componentNode);
    });

    return nodes;
}

function generateConnectorNodes(project: Project): Map<string, ConnectorModel> {
    const nodes: Map<string, ConnectorModel> = new Map<string, ConnectorModel>();
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

function generateEmptyNodes(connectorNodes: Map<string, ConnectorModel>): Map<string, EmptyModel> {
    const DIAGRAM_END = 1000;
    const nodes: Map<string, EmptyModel> = new Map<string, EmptyModel>();

    const eastBoundEmptyNode = new EmptyModel(EMPTY_NODE, CellBounds.EastBound);
    eastBoundEmptyNode.setPosition(DIAGRAM_END, 0);
    nodes.set(eastBoundEmptyNode.getID(), eastBoundEmptyNode);

    const northBoundEmptyNode = new EmptyModel(EMPTY_NODE, CellBounds.NorthBound);
    northBoundEmptyNode.setPosition(0, DIAGRAM_END * -1);
    nodes.set(northBoundEmptyNode.getID(), northBoundEmptyNode);

    const westBoundEmptyNode = new EmptyModel(EMPTY_NODE, CellBounds.WestBound);
    westBoundEmptyNode.setPosition(DIAGRAM_END * -1, 0);
    nodes.set(westBoundEmptyNode.getID(), westBoundEmptyNode);

    let count = 0;
    connectorNodes.forEach((connectorNode, _key) => {
        const connectorEmptyNode = new EmptyModel(EMPTY_NODE, CellBounds.SouthBound, connectorNode.getID());
        connectorEmptyNode.setPosition(count++ * 30, DIAGRAM_END);
        nodes.set(connectorEmptyNode.getID(), connectorEmptyNode);
    });

    return nodes;
}

function generateComponentLinks(project: Project, nodes: Map<string, ComponentModel>): Map<string, ComponentLinkModel> {
    const links: Map<string, ComponentLinkModel> = new Map();

    project.components?.forEach((component, _key) => {
        const callingComponent: ComponentModel | undefined = nodes.get(component.id);
        let associatedComponent: ComponentModel | undefined;

        component.connections.forEach((connection) => {
            const connectionMetadata = getMetadataFromConnection(connection);
            if (
                connectionMetadata &&
                (connectionMetadata.type === ConnectionType.HTTP || connectionMetadata.type === ConnectionType.GRPC) &&
                project.id === connectionMetadata.project
            ) {
                associatedComponent = nodes.get(connectionMetadata.component);
                if (callingComponent && associatedComponent) {
                    const sourcePort: ComponentPortModel | null = callingComponent.getPort(`right-${callingComponent.getID()}`);
                    const targetPort: ComponentPortModel | null = associatedComponent.getPort(`left-${associatedComponent.getID()}`);

                    if (sourcePort && targetPort) {
                        const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
                        const link: ComponentLinkModel = new ComponentLinkModel(linkId);
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

function generateConnectorLinks(emptyNodes: Map<string, EmptyModel>, connectorNodes: Map<string, ConnectorModel>): Map<string, ExternalLinkModel> {
    const links: Map<string, ExternalLinkModel> = new Map();

    connectorNodes?.forEach((connectorNode, _key) => {
        const southBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.SouthBound, connectorNode.getID()));
        const sourcePort: CellPortModel | null = southBoundEmptyNode.getPort(getNodePortId(southBoundEmptyNode.getID(), PortModelAlignment.BOTTOM));
        const targetPort: ConnectorPortModel | null = connectorNode.getPort(`top-${connectorNode.getID()}`);

        if (sourcePort && targetPort) {
            const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
            const link: ExternalLinkModel = new ExternalLinkModel(linkId);
            links.set(linkId, createLinks(sourcePort, targetPort, link));
            link.setSourceNode(southBoundEmptyNode.getID());
            link.setTargetNode(connectorNode.getID());
        }
    });

    return links;
}

function generateCellLinks(project: Project, emptyNodes: Map<string, EmptyModel>, nodes: Map<string, ComponentModel>): Map<string, CellLinkModel> {
    const links: Map<string, ComponentLinkModel> = new Map();

    project.components?.forEach((component, _key) => {
        const targetComponent: ComponentModel | undefined = nodes.get(component.id);
        // public exposed services links
        if (targetComponent) {
            let isExposed = false;
            for (const serviceId in component.services) {
                if (Object.prototype.hasOwnProperty.call(component.services, serviceId)) {
                    const service = component.services[serviceId];
                    isExposed = isExposed || service.isExposedToInternet;
                }
            }
            const northBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.NorthBound));
            if (isExposed && northBoundEmptyNode) {
                const sourcePort: CellPortModel | null = northBoundEmptyNode.getPort(getNodePortId(northBoundEmptyNode.getID(), PortModelAlignment.BOTTOM));
                const targetPort: ComponentPortModel | null = targetComponent.getPort(`top-${targetComponent.getID()}`);
                if (sourcePort && targetPort) {
                    const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
                    const link: CellLinkModel = new CellLinkModel(linkId);
                    links.set(linkId, createLinks(sourcePort, targetPort, link));
                    link.setSourceNode(northBoundEmptyNode.getID());
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
                connectionMetadata.project !== project.id
            ) {
                const eastBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.EastBound));
                if (targetComponent && eastBoundEmptyNode) {
                    const sourcePort: ComponentPortModel | null = targetComponent.getPort(`right-${targetComponent.getID()}`);
                    const targetPort: CellPortModel | null = eastBoundEmptyNode.getPort(getNodePortId(eastBoundEmptyNode.getID(), PortModelAlignment.LEFT));

                    if (sourcePort && targetPort) {
                        const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
                        const link: CellLinkModel = new CellLinkModel(linkId);
                        links.set(linkId, createLinks(sourcePort, targetPort, link));
                        link.setSourceNode(targetComponent.getID());
                        link.setTargetNode(eastBoundEmptyNode.getID());
                    }
                }
            }
        });
        // connector links
        component.connections.forEach((connection) => {
            if (connection.type === ConnectionType.Connector) {
                const southBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.SouthBound, connection.id));
                if (targetComponent && southBoundEmptyNode) {
                    const sourcePort: ComponentPortModel | null = targetComponent.getPort(`bottom-${targetComponent.getID()}`);
                    const targetPort: CellPortModel | null = southBoundEmptyNode.getPort(getNodePortId(southBoundEmptyNode.getID(), PortModelAlignment.TOP));

                    if (sourcePort && targetPort) {
                        const linkId = `${sourcePort.getID()}::${targetPort.getID()}`;
                        const link: CellLinkModel = new CellLinkModel(linkId);
                        links.set(linkId, createLinks(sourcePort, targetPort, link));
                        link.setSourceNode(targetComponent.getID());
                        link.setTargetNode(southBoundEmptyNode.getID());
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
    const eastBoundLink = createExternalLink(eastBoundEmptyNode, externalNodes, CellBounds.EastBound, PortModelAlignment.RIGHT);
    if (eastBoundLink) {
        links.set(eastBoundLink.getID(), eastBoundLink);
    }
    // North bound external node link
    const northBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.NorthBound));
    const northBoundLink = createExternalLink(northBoundEmptyNode, externalNodes, CellBounds.NorthBound, PortModelAlignment.TOP, true);
    if (northBoundLink) {
        links.set(northBoundLink.getID(), northBoundLink);
    }
    // West bound external node link
    const westBoundEmptyNode = emptyNodes.get(getEmptyNodeName(EMPTY_NODE, CellBounds.WestBound));
    const westBoundLink = createExternalLink(westBoundEmptyNode, externalNodes, CellBounds.WestBound, PortModelAlignment.LEFT, true);
    if (westBoundLink) {
        links.set(westBoundLink.getID(), westBoundLink);
    }

    return links;
}

function createLinks(sourcePort: ComponentPortModel, targetPort: ComponentPortModel, link: ComponentLinkModel): ComponentLinkModel {
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
            return createLinks(targetPort, sourcePort, link);
        } else {
            link.setSourceNode(emptyNode.getID());
            link.setTargetNode(targetNode.getID());
            return createLinks(sourcePort, targetPort, link);
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
            return `${metadata.organization}:${(metadata as ConnectorMetadata).package}`;
        default:
            return "";
    }
}

export function getComponentIdFromMetadata(organization: string, project: string, component: string): string {
    return `${organization}:${project}:${component}`;
}
