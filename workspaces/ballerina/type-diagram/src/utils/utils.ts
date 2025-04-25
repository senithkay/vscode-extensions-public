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
    CMEntryPoint, CMInteraction, CMRemoteFunction, CMResourceFunction,
    CMService,
    ComponentModel,
    ComponentModelDeprecated,
    Member,
    TypeFunctionModel
} from '@wso2-enterprise/ballerina-core';
import { EntityFactory, EntityLinkFactory, EntityPortFactory } from '../components/entity-relationship';
import { OverlayLayerFactory } from '../components/OverlayLoader';
import { validate as validateUUID } from 'uuid';
import { VerticalScrollCanvasAction } from '../actions/VerticalScrollCanvasAction';
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

export function createEntitiesEngine(): DiagramEngine {
    const diagramEngine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: false,
        registerDefaultZoomCanvasAction: false,
        registerDefaultDeleteItemsAction: false,
    });
    diagramEngine.getLinkFactories().registerFactory(new EntityLinkFactory());
    diagramEngine.getPortFactories().registerFactory(new EntityPortFactory());
    diagramEngine.getNodeFactories().registerFactory(new EntityFactory());
    diagramEngine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    diagramEngine.getActionEventBus().registerAction(new VerticalScrollCanvasAction());
    return diagramEngine;
}

export function getAngleFromRadians(value: number): number {
    return value * 180 / Math.PI;
}

export function getRadiansFormAngle(value: number): number {
    return value * Math.PI / 180;
}

export function isVersionBelow(projectComponents: Map<string, ComponentModel | ComponentModelDeprecated>, targetVersion: number): boolean {
    const firstComponent = projectComponents.values().next().value;
    if (firstComponent?.modelVersion) {
        return parseFloat(firstComponent.modelVersion) < targetVersion;
    }
    return parseFloat(firstComponent.version) < targetVersion;
}

export function transformToV4Models(projectComponents: Map<string, ComponentModelDeprecated>): Map<string, ComponentModel> {
    const newProjectComponents = new Map<string, ComponentModel>();
    projectComponents.forEach((componentModel: ComponentModelDeprecated, key: string) => {
        const newComponentModel: ComponentModel = {
            id: componentModel.packageId.name,
            orgName: componentModel.packageId.org,
            version: componentModel.packageId.version,
            modelVersion: componentModel.version,
            services: transformToV4Services(componentModel.services, componentModel.packageId.name) as any,
            entities: componentModel.entities,
            diagnostics: componentModel.diagnostics,
            functionEntryPoint: componentModel.functionEntryPoint
                && transformToV4FunctionEntryPoint(componentModel.functionEntryPoint),
            hasCompilationErrors: componentModel.hasCompilationErrors,
            hasModelErrors: false,
            connections: deriveDependencies(componentModel),
        }

        newProjectComponents.set(key, newComponentModel);
    });

    return newProjectComponents;
}

function deriveDependencies(componentModel: ComponentModelDeprecated): CMDependency[] {
    const dependencies: CMDependency[] = [];
    Object.entries(componentModel.services).forEach(([_, service]: [string, any]) => {
        service?.dependencies.forEach((dependency: any) => {
            dependencies.push(transformToV4Dependency(dependency));
        });
    });
    componentModel.functionEntryPoint?.dependencies.forEach((dependency: any) => {
        dependencies.push(transformToV4Dependency(dependency));
    });

    return dependencies;
}

export function transformToV4Services(services: Map<string, any>, packageName: string): Record<string, CMService> {
    const newServices: Record<string, CMService> = {};
    let unnamedSvcIndex = 0;
    Object.entries(services).forEach(([key, service]: [string, any]) => {
        let label = service.annotation.label || service?.path;
        if (!service.path && (!service.annotation.label || validateUUID(service.annotation.label))
            && validateUUID(service.annotation.id)) {
            [label, unnamedSvcIndex] = getLabelAndNextIndex(packageName, unnamedSvcIndex);
        }
        newServices[key] = {
            id: service.serviceId,
            label: label,
            remoteFunctions: transformToV4RemoteFunctions(service.remoteFunctions),
            resourceFunctions: transformToV4ResourceFunctions(service.resources),
            type: service.serviceType,
            dependencies: service?.dependencies?.map((dep: any) => dep?.serviceId),
            annotation: service.annotation,
            deploymentMetadata: service.deploymentMetadata,
            isNoData: service.isNoData,
            sourceLocation: service.elementLocation,
            diagnostics: service.diagnostics
        };
    });

    return newServices;
}

export function transformToV4FunctionEntryPoint(functionEntryPoint: any): CMEntryPoint {
    return {
        id: functionEntryPoint?.annotation?.id,
        label: functionEntryPoint?.annotation?.label,
        interactions: functionEntryPoint.interactions,
        parameters: functionEntryPoint.parameters,
        returns: functionEntryPoint.returns,
        annotation: functionEntryPoint.annotation,
        type: functionEntryPoint.type,
        dependencies: (functionEntryPoint as any)?.dependencies?.map((dep: any) => dep?.serviceId),
        sourceLocation: functionEntryPoint.elementLocation,
        diagnostics: functionEntryPoint.diagnostics
    };
}

export function transformToV4ResourceFunctions(resources: any[]): CMResourceFunction[] {
    return resources.map(resource => {
        return {
            id: `${resource.resourceId.serviceId}:${resource.resourceId.path}:${resource.resourceId.action}`,
            label: resource.resourceId.path,
            interactions: transformToV4Interactions(resource.interactions),
            parameters: resource.parameters,
            returns: resource.returns,
            path: resource.resourceId.path,
            sourceLocation: resource.elementLocation,
            diagnostics: resource.diagnostics
        }
    });
}

export function transformToV4RemoteFunctions(remotes: any[]): CMRemoteFunction[] {
    return remotes.map(remoteFn => {
        return {
            id: remoteFn.name,
            label: remoteFn.name,
            interactions: transformToV4Interactions(remoteFn.interactions),
            parameters: remoteFn.parameters,
            returns: remoteFn.returns,
            name: remoteFn.name,
            sourceLocation: remoteFn.elementLocation,
            diagnostics: remoteFn.diagnostics
        }
    });
}

export function transformToV4Interactions(interactions: any[]): CMInteraction[] {
    return interactions.map(interaction => {
        return {
            id: `${interaction.resourceId.serviceId}:${interaction.resourceId.path}:${interaction.resourceId.action}`,
            type: interaction.connectorType,
            serviceId: interaction.resourceId.serviceId,
            serviceLabel: interaction.serviceLabel,
            sourceLocation: interaction.elementLocation,
            diagnostics: interaction.diagnostics
        }
    });
}

export function transformToV4Dependency(dependency: any): CMDependency {
    return {
        id: dependency.serviceId,
        type: dependency.connectorType,
        serviceLabel: dependency.serviceLabel,
        sourceLocation: dependency.elementLocation,
        diagnostics: dependency.diagnostics
    };
}

function getLabelAndNextIndex(packageName: string, index: number): [string, number] {
    const label: string = `${packageName} Component${index > 0 ? index : ''}`;
    return [label, index + 1];
}

export function focusToNode(node: NodeModel, currentZoomLevel: number, diagramEngine: DiagramEngine) {
    const canvasBounds = diagramEngine?.getCanvas()?.getBoundingClientRect();
    const nodeBounds = node?.getBoundingBox();

    if (canvasBounds && nodeBounds) {
        const zoomOffset = currentZoomLevel / 100;
        const offsetX = canvasBounds.width / 2 - (nodeBounds.getTopLeft().x + nodeBounds.getWidth() / 2) * zoomOffset;
        const offsetY = canvasBounds.height / 2 - (nodeBounds.getTopLeft().y + nodeBounds.getHeight() / 2) * zoomOffset;

        diagramEngine.getModel().setOffset(offsetX, offsetY);
        diagramEngine.repaintCanvas();
    }
}

export const getAttributeType = (attr: Member | TypeFunctionModel): string => {

    const type = 'returnType' in attr ? attr.returnType : (attr as Member).type;

    if (typeof type === 'string') {
        return type;
    }

    // Get base type representation based on node kind
    const getTypeString = (members: Member[]): string => {
        const memberTypes = members.map(member => {
            if (typeof member.type === 'string') {
                return member.type;
            }
            return getAttributeType(member);
        });

        switch (type.codedata.node) {
            case 'ARRAY':
                return `${memberTypes[0]}[]`;
            case 'UNION':
                return memberTypes.reverse().join('|');
            case 'MAP':
                return `map<${memberTypes[0]}>`;
            case 'TABLE':
                const rowType = members.find(m => m.name === 'rowType');
                const keyConstraint = members.find(m => m.name === 'keyConstraintType');
                const tableType = rowType ? getAttributeType(rowType) : 'unknown';
                return keyConstraint
                    ? `table<${tableType}> key<${getAttributeType(keyConstraint)}>`
                    : `table<${tableType}>`;
            case 'STREAM':
                return `stream<${memberTypes.reverse().join(',')}>`;
            case 'FUTURE':
                return `future<${memberTypes[0] || ''}>`;
            case 'TYPEDESC':
                return `typedesc<${memberTypes[0] || ''}>`;
            case 'TUPLE':
                return `[${memberTypes.reverse().join(',')}]`;
            case 'RECORD':
                const recordMembers = [...members].reverse().map(member => {
                    const memberType = typeof member.type === 'string' ? member.type : getAttributeType(member);
                    return `${memberType} ${member.name}`;
                });
                return `record {${recordMembers.join(', ')}}`;// TODO: Verify anonymous records representation
            case 'ERROR':
                return `error`; // HACK: This is a hack to represent error till we get refs a empty
            default:
                return type.name || 'unknown';
        }
    };

    return getTypeString(type.members);
};
