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

import createEngine, { DiagramEngine } from '@projectstorm/react-diagrams';
import { EntityFactory, EntityLinkFactory, EntityPortFactory } from '../components/entity-relationship';
import { ExtServiceNodeFactory, ServiceLinkFactory, ServiceNodeFactory, ServicePortFactory } from '../components/service-interaction';
import { GatewayNodeFactory } from "../components/gateway/GatewayNode/GatewayNodeFactory";
import { GatewayPortFactory } from "../components/gateway/GatewayPort/GatewayPortFactory";
import { GatewayNodeModel } from "../components/gateway/GatewayNode/GatewayNodeModel";
import { GatewayLinkFactory } from "../components/gateway/GatewayLink/GatewayLinkFactory";
import { Point } from "@projectstorm/geometry";

export const defaultZoomLevel = 100;

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
        const canvasTopMidX = (canvas.clientWidth * 0.09) - model.getOffsetX() - ((zoomLevel - defaultZoomLevel) * 4.85);
        const canvasTopMidY = (canvas.clientHeight * 0.235) - model.getOffsetY() - ((zoomLevel - defaultZoomLevel) * 0.7);
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
