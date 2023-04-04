/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import createEngine, { DiagramEngine, NodeModel } from '@projectstorm/react-diagrams';
import { EntityFactory, EntityLinkFactory, EntityPortFactory } from '../components/entity-relationship';
import {
    EntryNodeFactory,
    ExtServiceNodeFactory,
    ServiceLinkFactory,
    ServiceNodeFactory,
    ServiceNodeModel,
    ServicePortFactory,
    ServicePortModel
} from '../components/service-interaction';
import { GatewayNodeFactory } from "../components/gateway/GatewayNode/GatewayNodeFactory";
import { GatewayPortFactory } from "../components/gateway/GatewayPort/GatewayPortFactory";
import { GatewayNodeModel } from "../components/gateway/GatewayNode/GatewayNodeModel";
import { GatewayLinkFactory } from "../components/gateway/GatewayLink/GatewayLinkFactory";
import { Point } from "@projectstorm/geometry";
import { GatewayType } from "../components/gateway/types";
import { Service } from "../resources";
import { GatewayPortModel } from "../components/gateway/GatewayPort/GatewayPortModel";
import { GatewayLinkModel } from "../components/gateway/GatewayLink/GatewayLinkModel";

export const defaultZoomLevel = 100;
export const diagramTopXOffset = 580;
export const diagramTopYOffset = 190;
export const diagramLeftXOffset = 30;
export const diagramLeftYOffset = -10;
export const CELL_DIAGRAM_MARGIN_X = 300;
export const CELL_DIAGRAM_MARGIN_Y = 100;

export interface ZoomOffset {
    topXOffset: number;
    topYOffset: number;
    leftXOffset: number;
    leftYOffset: number;
}

export function createRenderPackageObject(projectPackages: IterableIterator<string>): Map<string, boolean> {
    let packages2render: Map<string, boolean> = new Map<string, boolean>();
    let packages: string[] = Array.from(projectPackages).sort();

    packages.forEach((balPackage) => {
        packages2render.set(balPackage, true);
    })

    return packages2render;
}

export function createServicesEngine(): DiagramEngine {
    const diagramEngine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false
    });
    diagramEngine.getLinkFactories().registerFactory(new GatewayLinkFactory());
    diagramEngine.getPortFactories().registerFactory(new GatewayPortFactory());
    diagramEngine.getNodeFactories().registerFactory(new GatewayNodeFactory());
    diagramEngine.getLinkFactories().registerFactory(new ServiceLinkFactory());
    diagramEngine.getPortFactories().registerFactory(new ServicePortFactory());
    diagramEngine.getNodeFactories().registerFactory(new ServiceNodeFactory());
    diagramEngine.getNodeFactories().registerFactory(new ExtServiceNodeFactory());
    diagramEngine.getNodeFactories().registerFactory(new EntryNodeFactory());
    return diagramEngine;
}

export function createEntitiesEngine(): DiagramEngine {
    const diagramEngine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false
    });
    diagramEngine.getLinkFactories().registerFactory(new EntityLinkFactory());
    diagramEngine.getPortFactories().registerFactory(new EntityPortFactory());
    diagramEngine.getNodeFactories().registerFactory(new EntityFactory());
    return diagramEngine;
}

export function getZoomOffSet(engine: DiagramEngine): ZoomOffset {
    const model = engine.getModel();
    const canvas = engine.getCanvas();
    const zoomDiff = model.getZoomLevel() - defaultZoomLevel;
    // Get the bounding rect of nodes excluding gateway nodes
    const nodesRect = engine.getBoundingNodesRect(engine.getModel().getNodes().filter(
        node => !(node instanceof GatewayNodeModel)
    ));
    // work out zoom
    const xFactor = canvas.clientWidth / (nodesRect.getWidth());
    const yFactor = canvas.clientHeight / (nodesRect.getHeight());
    return {
        topXOffset: (xFactor * zoomDiff * ((zoomDiff > 0) ? 0.4 : 1)),
        topYOffset: (yFactor * zoomDiff * ((zoomDiff > 0) ? 0.2 : 1)),
        leftXOffset: (xFactor * zoomDiff * ((zoomDiff > 0) ? 0.5 : 2.6)),
        leftYOffset: (yFactor * zoomDiff * ((zoomDiff > 0) ? 0.2 : 0.5))
    };
}

export function positionGatewayNodes(engine: DiagramEngine) {
    const model = engine.getModel();
    const gatewayNodes: GatewayNodeModel[] = <GatewayNodeModel[]>
        (model?.getNodes()?.filter((node) => node instanceof GatewayNodeModel));
    const canvas = engine.getCanvas();
    const zoomOffset = getZoomOffSet(engine);
    if (canvas) {
        const canvasTopMidX = (canvas.clientWidth * 0.5) - diagramTopXOffset - model.getOffsetX()
            - zoomOffset.topXOffset;
        const canvasTopMidY = diagramTopYOffset - model.getOffsetY() + zoomOffset.topYOffset;
        const canvasRightMidX = (canvas.clientWidth * 0.265) - model.getOffsetX();
        const canvasRightMidY = (canvas.clientHeight * 0.15) - model.getOffsetY();
        const canvasBottomMidX = (-(canvas.clientWidth * 0.254) - model.getOffsetX());
        const canvasBottomMidY = (canvas.clientWidth * 0.4) - model.getOffsetY();
        const canvasLeftMidX = (canvas.clientWidth * 0.006) - diagramLeftXOffset - model.getOffsetX()
            + zoomOffset.leftXOffset;
        const canvasLeftMidY = (canvas.clientHeight * 0.42) + diagramLeftYOffset - model.getOffsetY()
            - zoomOffset.leftYOffset;
        gatewayNodes.forEach((node) => {
            if (node.type === 'NORTH') {
                node.setPosition(canvasTopMidX, canvasTopMidY);
            } else if (node.type === 'SOUTH') {
                node.setPosition(canvasBottomMidX, canvasBottomMidY);
            } else if (node.type === 'EAST') {
                node.setPosition(canvasRightMidX, canvasRightMidY);
            } else if (node.type === 'WEST') {
                node.setPosition(canvasLeftMidX, canvasLeftMidY);
            }
        });
    }
}

export function extractGateways(service: Service): GatewayType[] {
    let gatewayTypes: GatewayType[] = [];
    if (service?.deploymentMetadata?.gateways?.internet?.isExposed) {
        // Internet type to North
        gatewayTypes.push("NORTH");
    }
    if (service?.deploymentMetadata?.gateways?.intranet?.isExposed) {
        // Intranet type to West
        gatewayTypes.push("WEST");
    }
    return gatewayTypes;
}

export function createGWLinks(sourcePort: GatewayPortModel, targetPort: ServicePortModel, link: GatewayLinkModel)
    : GatewayLinkModel {
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}

export function addGWNodes(engine: DiagramEngine) {
    const nodes = engine.getModel().getNodes();
    let isNorthExists: boolean = false;
    let isWestExists: boolean = false;
    // Avoid adding redundant GWs
    nodes.forEach(nodes => {
        if (nodes.getID() === 'NORTH') {
            isNorthExists = true;
        } else if (nodes.getID() === 'WEST') {
            isWestExists = true;
        }
    });
    if (!isNorthExists) {
        engine.getModel().addNode(new GatewayNodeModel('NORTH', 'Internet'));
    }
    if (!isWestExists) {
        engine.getModel().addNode(new GatewayNodeModel('WEST', 'Intranet'));
    }
}

function addGWLinks(engine: DiagramEngine) {
    const nodes = engine.getModel().getNodes();
    nodes.forEach(node => {
        if (node instanceof ServiceNodeModel) {
            node.getTargetGateways().forEach((gwType: GatewayType) => {
                mapGWInteraction(gwType, node, nodes, engine);
            });
        }
    });
}

function mapGWInteraction(sourceGWType: GatewayType, targetNode: ServiceNodeModel, nodes: NodeModel[], engine: DiagramEngine) {
    const gatewayNode = nodes.find((node) => node instanceof GatewayNodeModel && node.getID() === sourceGWType);
    if (gatewayNode && targetNode) {
        const link: GatewayLinkModel = new GatewayLinkModel(targetNode.level);
        const sourcePort: GatewayPortModel = gatewayNode.getPortFromID(`${sourceGWType}-in`);
        let targetPort: ServicePortModel;
        if (sourceGWType === "WEST") {
            targetPort = targetNode.getPortFromID(`left-gw-${targetNode.serviceObject.serviceId}`);
        } else if (sourceGWType === "NORTH") {
            targetPort = targetNode.getPortFromID(`top-${targetNode.serviceObject.serviceId}`);
        }
        if (sourcePort && targetPort) {
            engine.getModel().addLink(createGWLinks(sourcePort, targetPort, link));
        }
    }
}

export function addGWNodesModel(engine: DiagramEngine, addNodes: boolean = false) {
    if (addNodes) {
        addGWNodes(engine);
    }
    addGWLinks(engine);
}

export function removeGWLinks(engine: DiagramEngine) {
    engine.getModel().getLinks().forEach(link => {
        if (link instanceof GatewayLinkModel) {
            engine.getModel().removeLink(link);
        }
    });
}

export function cellDiagramZoomToFit(diagramEngine: DiagramEngine) {
    // Exclude gateway nodes from the zoom to fit, since we are manually positioning them after zoom to fit
    const nodesWithoutGW = diagramEngine.getModel().getNodes().filter(
        node => !(node instanceof GatewayNodeModel)
    );
    const nodesRect = diagramEngine.getBoundingNodesRect(nodesWithoutGW);
    diagramEngine.getModel().setOffset((nodesRect.getWidth() / 2) + CELL_DIAGRAM_MARGIN_X,
        (nodesRect.getHeight() / 2) + CELL_DIAGRAM_MARGIN_Y);
    positionGatewayNodes(diagramEngine);
    diagramEngine.repaintCanvas();
}

export function getWestGWArrowHeadSlope(slope: number) {
    let newSlope = slope;
    if (slope < 15) {
        newSlope = (slope * 0.1);
    } else if (slope < 30) {
        newSlope = (slope * 0.3);
    } else if (slope < 45) {
        newSlope = (slope * 0.5);
    } else if (slope < 60) {
        newSlope = (slope * 0.3);
    } else if (slope < 80) {
        newSlope = (slope * 0.6);
    } else if (slope <= 90) {
        newSlope = (slope * 0.7);
    }
    return newSlope;
}

export function getAngleFromRadians(value: number): number {
    return value * 180 / Math.PI;
}

export function getRadiansFormAngle(value: number): number {
    return value * Math.PI / 180;
}

export function getWestArrowHeadPoints(targetPort: Point, directLineSlope: number, widthOfTriangle: number): string {
    let baseTopX;
    let baseTopY;
    let baseBottomX;
    let baseBottomY;
    let newSlope;
    if (directLineSlope <= 0) {
        newSlope = getWestGWArrowHeadSlope(-directLineSlope);
        baseTopX = targetPort.x - (widthOfTriangle * Math.cos(getRadiansFormAngle(newSlope - 30)));
        baseTopY = targetPort.y + (widthOfTriangle * Math.sin(getRadiansFormAngle(newSlope - 30)));
        baseBottomX = targetPort.x - (widthOfTriangle * Math
            .cos(getRadiansFormAngle(30 + newSlope)));
        baseBottomY = targetPort.y + (widthOfTriangle * Math
            .sin(getRadiansFormAngle(30 + newSlope)));
    } else {
        newSlope = getWestGWArrowHeadSlope(directLineSlope);
        baseTopX = targetPort.x - (widthOfTriangle * Math.sin(getRadiansFormAngle(60 - newSlope)));
        baseTopY = targetPort.y - (widthOfTriangle * Math.cos(getRadiansFormAngle(60 - newSlope)));
        baseBottomX = targetPort.x - (widthOfTriangle * Math
            .cos(getRadiansFormAngle(newSlope - 30)));
        baseBottomY = targetPort.y - (widthOfTriangle * Math
            .sin(getRadiansFormAngle(newSlope - 30)));
    }
    return `${targetPort.x} ${targetPort.y}, ${baseTopX} ${baseTopY}, ${baseBottomX} ${baseBottomY}`;
}

export function getNorthArrowHeadPoints(targetPort: Point, directLineSlope: number, widthOfTriangle: number): string {
    let baseTopX;
    let baseTopY;
    let baseBottomX;
    let baseBottomY;
    let newSlope;
    if (directLineSlope <= 0) {
        newSlope = getNorthGWArrowHeadSlope(-directLineSlope);
        baseTopX = targetPort.x + (widthOfTriangle * Math.sin(getRadiansFormAngle(60 - newSlope)));
        baseTopY = targetPort.y - (widthOfTriangle * Math.cos(getRadiansFormAngle(60 - newSlope)));
        baseBottomX = targetPort.x + (widthOfTriangle * Math.cos(getRadiansFormAngle(newSlope - 30)));
        baseBottomY = targetPort.y - (widthOfTriangle * Math.sin(getRadiansFormAngle(newSlope - 30)));
    } else {
        newSlope = getNorthGWArrowHeadSlope(directLineSlope);
        baseTopX = targetPort.x - (widthOfTriangle * Math.sin(getRadiansFormAngle(60 - newSlope)));
        baseTopY = targetPort.y - (widthOfTriangle * Math.cos(getRadiansFormAngle(60 - newSlope)));
        baseBottomX = targetPort.x - (widthOfTriangle * Math.cos(getRadiansFormAngle(newSlope - 30)));
        baseBottomY = targetPort.y - (widthOfTriangle * Math.sin(getRadiansFormAngle(newSlope - 30)));
    }
    return `${targetPort.x} ${targetPort.y}, ${baseTopX} ${baseTopY}, ${baseBottomX} ${baseBottomY}`;
}

export function getNorthGWArrowHeadSlope(slope: number) {
    let newSlope = slope;
    if (newSlope > 0 && newSlope < 1) {
        newSlope = (newSlope) + (newSlope * 400);
    } else if (newSlope < 15) {
        newSlope = (newSlope * 5);
    } else if (newSlope < 30) {
        newSlope = (newSlope * 2.8);
    } else if (newSlope < 45) {
        newSlope = (newSlope * 1.8);
    } else if (newSlope < 60) {
        newSlope = (newSlope * 1.4);
    } else if (newSlope < 80) {
        newSlope = (newSlope * 1.2);
    }
    return newSlope;
}
