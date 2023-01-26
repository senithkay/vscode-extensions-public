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

import createEngine, {DiagramEngine, LinkModel, NodeModel} from '@projectstorm/react-diagrams';
import { EntityFactory, EntityLinkFactory, EntityPortFactory } from '../components/entity-relationship';
import {
    ExtServiceNodeFactory,
    ServiceLinkFactory,
    ServiceLinkModel,
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
export const canvasTopXOffset = 675;
export const canvasTopYOffset = 205;

export function createRenderPackageObject(projectPackages: IterableIterator<string>): Map<string, boolean> {
    let packages2render: Map<string, boolean> = new Map<string, boolean>();
    let packages: string[] = Array.from(projectPackages).sort();

    packages.forEach((balPackage) => {
        packages2render.set(balPackage, true);
    })

    return packages2render;
}

export function createServicesEngine(): DiagramEngine {
    const diagramEngine: DiagramEngine = createEngine({registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false});
    diagramEngine.getLinkFactories().registerFactory(new GatewayLinkFactory());
    diagramEngine.getPortFactories().registerFactory(new GatewayPortFactory());
    diagramEngine.getNodeFactories().registerFactory(new GatewayNodeFactory());
    diagramEngine.getLinkFactories().registerFactory(new ServiceLinkFactory());
    diagramEngine.getPortFactories().registerFactory(new ServicePortFactory());
    diagramEngine.getNodeFactories().registerFactory(new ServiceNodeFactory());
    diagramEngine.getNodeFactories().registerFactory(new ExtServiceNodeFactory());
    return diagramEngine;
}

export function createEntitiesEngine(): DiagramEngine {
    const diagramEngine: DiagramEngine = createEngine({registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false});
    diagramEngine.getLinkFactories().registerFactory(new EntityLinkFactory());
    diagramEngine.getPortFactories().registerFactory(new EntityPortFactory());
    diagramEngine.getNodeFactories().registerFactory(new EntityFactory());
    return diagramEngine;
}

export function positionGatewayNodes(engine: DiagramEngine) {
    const model = engine.getModel();
    const gatewayNodes: GatewayNodeModel[] = <GatewayNodeModel[]>
        (model?.getNodes()?.filter((node) => node instanceof GatewayNodeModel));
    const canvas = engine.getCanvas();
    const zoomLevel = model.getZoomLevel();
    if (canvas) {
        const canvasTopMidX = (canvas.clientWidth * 0.5) - canvasTopXOffset - model.getOffsetX() - ((zoomLevel - defaultZoomLevel) * 4.85);
        const canvasTopMidY = canvasTopYOffset - model.getOffsetY() - ((zoomLevel - defaultZoomLevel) * 0.7);
        const canvasRightMidX = (canvas.clientWidth * 0.265) - model.getOffsetX();
        const canvasRightMidY = (canvas.clientHeight * 0.15) - model.getOffsetY();
        const canvasBottomMidX = (-(canvas.clientWidth * 0.254) - model.getOffsetX());
        const canvasBottomMidY = (canvas.clientWidth * 0.4) - model.getOffsetY();
        const canvasLeftMidX = (canvas.clientWidth * 0.006) - model.getOffsetX() - ((zoomLevel - defaultZoomLevel) * 0.78);
        const canvasLeftMidY = (canvas.clientHeight * 0.42) - model.getOffsetY() - ((zoomLevel - defaultZoomLevel) * 3);
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

export function createGWLinks(sourcePort: ServicePortModel, targetPort: ServicePortModel | GatewayPortModel,
                              link: ServiceLinkModel | GatewayLinkModel): ServiceLinkModel | GatewayLinkModel {
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
    const links = engine.getModel().getLinks();
    nodes.forEach(node => {
        if (node instanceof ServiceNodeModel) {
            node.getTargetGateways().forEach((gwType: GatewayType) => {
                mapGWInteraction(gwType, node, nodes, links, engine);
            });
        }
    });
}

function mapGWInteraction(sourceGWType: GatewayType, targetNode: ServiceNodeModel, nodes: NodeModel[],
                          links: LinkModel[], engine: DiagramEngine) {
    nodes.forEach(sourceGW => {
        if ((sourceGW instanceof GatewayNodeModel) && (sourceGW.getID() === sourceGWType)) {
            const link: GatewayLinkModel = new GatewayLinkModel(targetNode.level);
            const sourcePort: GatewayPortModel = sourceGW.getPortFromID(`${sourceGWType}-in`);
            let targetPort;
            if (sourceGWType === "WEST") {
                targetPort = targetNode.getPortFromID(`left-gw-${targetNode.serviceObject.serviceId}`);
            } else {
                targetPort = targetNode.getPortFromID(`top-${targetNode.serviceObject.serviceId}`);
            }
            engine.getModel().addLink(createGWLinks(sourcePort, targetPort, link));
        }
    });
}

export function getGWNodesModel(engine: DiagramEngine) {
    addGWNodes(engine);
    addGWLinks(engine);
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

export function getAngleFromRadians (value: number): number {
    return value * 180 / Math.PI;
}

export function getRadiansFormAngle (value: number): number {
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
        baseTopX = targetPort.x - (widthOfTriangle * Math.sin(getRadiansFormAngle( 60 - newSlope)));
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
