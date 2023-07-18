/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DiagramEngine, NodeModel } from '@projectstorm/react-diagrams';
import {
    CMDependency,
    CMEntryPoint, CMPackageID, CMService,
    CMService as Service,
    ComponentModel
} from '@wso2-enterprise/ballerina-languageclient';
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
import { OverlayLayerFactory } from '../components/common';
import { GatewayNodeFactory } from "../components/gateway/GatewayNode/GatewayNodeFactory";
import { GatewayPortFactory } from "../components/gateway/GatewayPort/GatewayPortFactory";
import { GatewayNodeModel } from "../components/gateway/GatewayNode/GatewayNodeModel";
import { GatewayLinkFactory } from "../components/gateway/GatewayLink/GatewayLinkFactory";
import { Point } from "@projectstorm/geometry";
import { GatewayType } from "../components/gateway/types";
import { GatewayPortModel } from "../components/gateway/GatewayPort/GatewayPortModel";
import { GatewayLinkModel } from "../components/gateway/GatewayLink/GatewayLinkModel";
import { validate as validateUUID } from 'uuid';

export const CELL_DIAGRAM_MIN_WIDTH = 400;
export const CELL_DIAGRAM_MAX_WIDTH = 800;
export const CELL_DIAGRAM_MIN_HEIGHT = 250;
export const CELL_DIAGRAM_MAX_HEIGHT = 600;

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
    diagramEngine.getLayerFactories().registerFactory(new OverlayLayerFactory());
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
    diagramEngine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    return diagramEngine;
}

export function positionGatewayNodes(engine: DiagramEngine, isConsole: boolean) {
    const model = engine.getModel();
    const gatewayNodes: GatewayNodeModel[] = <GatewayNodeModel[]>
        (model?.getNodes()?.filter((node) => node instanceof GatewayNodeModel));
    const canvas = engine.getCanvas();
    const letMidYPadding = isConsole ? 30 : 60;
    if (canvas) {
        const viewPort = document.getElementById('cell-canvas-wrapper');
        const viewPortBoundingRect = viewPort.getBoundingClientRect();

        const gwTopMidX = ((viewPortBoundingRect.width / 2) - model.getOffsetX()) / (model.getZoomLevel() / 100);
        const gwTopMidY = (0 - model.getOffsetY() + 30) / (model.getZoomLevel() / 100);

        const gwLeftMidX = (0 - model.getOffsetX() + 30) / (model.getZoomLevel() / 100);
        const gwLeftMidY = (viewPortBoundingRect.height / 2 - model.getOffsetY() - letMidYPadding) /
            (model.getZoomLevel() / 100);
        gatewayNodes.forEach((node) => {
            const inPort = node.getPorts()["in"];
            const outPort = node.getPorts()["out"];
            if (node.type === 'NORTH') {
                node.setPosition(gwTopMidX, gwTopMidY);
                inPort.setPosition(gwTopMidX, gwTopMidY);
                outPort.setPosition(gwTopMidX, gwTopMidY);
            } else if (node.type === 'SOUTH') {
                // TODO: Implement
            } else if (node.type === 'EAST') {
                // TODO: Implement
            } else if (node.type === 'WEST') {
                node.setPosition(gwLeftMidX, gwLeftMidY);
                inPort.setPosition(gwLeftMidX, gwLeftMidY);
                outPort.setPosition(gwLeftMidX, gwLeftMidY);
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
            targetPort = targetNode.getPortFromID(`left-gw-${targetNode.nodeObject.serviceId}`);
        } else if (sourceGWType === "NORTH") {
            targetPort = targetNode.getPortFromID(`top-${targetNode.nodeObject.serviceId}`);
        }
        if (sourcePort && targetPort) {
            engine.getModel().addLink(createGWLinks(sourcePort, targetPort, link));
        }
    }
}

export function addGWNodesModel(engine: DiagramEngine, addNodes: boolean = false) {
    if (addNodes) {
        addGWNodes(engine); // todo check and remove the if condition
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

export function cellDiagramZoomToFit(diagramEngine: DiagramEngine, isConsole: boolean) {
    // Exclude gateway nodes from the zoom to fit, since we are manually positioning them after zoom to fit
    const nodesWithoutGW = diagramEngine.getModel().getNodes().filter(
        node => !(node instanceof GatewayNodeModel)
    );
    const nodesRect = diagramEngine.getBoundingNodesRect(nodesWithoutGW);
    let modelWidthOffset = nodesRect.getWidth() / 2;
    if (modelWidthOffset < CELL_DIAGRAM_MIN_WIDTH) {
        modelWidthOffset = CELL_DIAGRAM_MIN_WIDTH;
    } else if (modelWidthOffset > CELL_DIAGRAM_MAX_WIDTH) {
        modelWidthOffset = CELL_DIAGRAM_MAX_WIDTH;
    }
    let modelHeightOffset = nodesRect.getHeight() / 2;
    if (modelWidthOffset < CELL_DIAGRAM_MIN_HEIGHT) {
        modelHeightOffset = CELL_DIAGRAM_MIN_HEIGHT;
    } else if (modelWidthOffset > CELL_DIAGRAM_MAX_HEIGHT) {
        modelHeightOffset = CELL_DIAGRAM_MAX_HEIGHT;
    }
    modelHeightOffset = modelHeightOffset > 300  ? modelHeightOffset - (nodesRect.getHeight() * 0.5)
        : modelHeightOffset;
    diagramEngine.getModel().setOffset(modelWidthOffset - (nodesRect.getWidth() * 0.4),
        modelHeightOffset);
    positionGatewayNodes(diagramEngine, isConsole);
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

export function isVersionBelowV4(projectComponents: Map<string, ComponentModel>): boolean {
    const firstComponent: ComponentModel = projectComponents.values().next().value;
    return parseFloat(firstComponent.version) < 0.4;
}

export function transformToV4Models(projectComponents: Map<string, ComponentModel>): Map<string, ComponentModel> {
    const newProjectComponents = new Map<string, ComponentModel>();
    projectComponents.forEach((componentModel: ComponentModel, key: string) => {
        const newComponentModel: ComponentModel = {
            ...componentModel,
            services: transformToV4Services(componentModel.services, (componentModel.packageId as CMPackageID).name) as any,
            functionEntryPoint: componentModel.functionEntryPoint
                && transformToV4FunctionEntryPoint(componentModel.functionEntryPoint),
            hasModelErrors: false,
            dependencies: deriveDependencies(componentModel),
        }

        newProjectComponents.set(key, newComponentModel);
    });

    return newProjectComponents;
}

function deriveDependencies(componentModel: ComponentModel): CMDependency[] {
    const dependencies: CMDependency[] = [];
    Object.entries(componentModel.services).forEach(([_, service]: [string, any]) => {
        (service as any)?.dependencies.forEach((dependency: CMDependency) => {
            dependencies.push(transformToV4Dependency(dependency));
        });
    });
    (componentModel.functionEntryPoint as any)?.dependencies.forEach((dependency: CMDependency) => {
        dependencies.push(transformToV4Dependency(dependency));
    });

    return dependencies;
}

export function transformToV4Services(services: Map<string, any>, packageName: string): Record<string, CMService> {
    const newServices: Record<string, CMService> = {};
    let unnamedSvcIndex = 0;
    Object.entries(services).forEach(([key, service]: [string, any]) => {
        let label = service?.path || service.annotation.label;
        if (!service.path && (!service.annotation.label || validateUUID(service.annotation.label))
            && validateUUID(service.annotation.id)) {
            [label, unnamedSvcIndex] = getLabelAndNextIndex(packageName, unnamedSvcIndex);
        }
        newServices[key] = {
            serviceId: service.serviceId,
            label: label,
            annotation: service.annotation,
            serviceType: service.serviceType,
            resources: service.resources,
            remoteFunctions: service.remoteFunctions,
            deploymentMetadata: service.deploymentMetadata,
            isNoData: service.isNoData,
            dependencyIDs: service?.dependencies?.map((dep: any) => dep?.serviceId)
        };
    });

    return newServices;
}

export function transformToV4FunctionEntryPoint(functionEntryPoint: CMEntryPoint): CMEntryPoint {
    return {
        functionID: functionEntryPoint?.annotation?.id,
        label: functionEntryPoint?.annotation?.label,
        annotation: functionEntryPoint.annotation,
        type: functionEntryPoint.type,
        interactions: functionEntryPoint.interactions,
        parameters: functionEntryPoint.parameters,
        returns: functionEntryPoint.returns,
        dependencyIDs: (functionEntryPoint as any)?.dependencies?.map((dep: any) => dep?.serviceId)
    };
}

export function transformToV4Dependency(dependency: CMDependency): CMDependency {
    return {
        entryPointID: (dependency as any)?.serviceId,
        connectorType: dependency.connectorType,
        serviceLabel: dependency.serviceLabel
    };
}

function getLabelAndNextIndex(packageName: string, index: number): [string, number] {
    const label: string = `${packageName} Component${index > 0 ? index : ''}`;
    return [label, index + 1];
}
