/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DiagramModel } from '@projectstorm/react-diagrams';
import { v4 as uuid, validate as validateUUID } from 'uuid';
import {
    ComponentModel, CMDependency as Dependency, CMLocation as Location, CMInteraction as Interaction,
    CMRemoteFunction as RemoteFunction, CMResourceFunction as ResourceFunction, CMService as Service, CMDependency
} from '@wso2-enterprise/ballerina-languageclient';
import { Level, ServiceModels, ServiceTypes } from '../../resources';
import { EntryNodeModel, ExtServiceNodeModel, ServiceLinkModel, ServiceNodeModel, ServicePortModel } from '../../components/service-interaction';
import { extractGateways, isVersionBelowV4, transformToV4Models } from "../utils";

type ServiceNodeModels = ServiceNodeModel | EntryNodeModel;

let l1Nodes: Map<string, ServiceNodeModel>;
let l2Nodes: Map<string, ServiceNodeModel>;
let cellNodes: Map<string, ServiceNodeModel>;
let l1EntryNodes: Map<string, EntryNodeModel>;
let l2EntryNodes: Map<string, EntryNodeModel>;
let cellEntryNodes: Map<string, EntryNodeModel>;
let l1ExtNodes: Map<string, ExtServiceNodeModel>;
let l2ExtNodes: Map<string, ExtServiceNodeModel>;
let cellExtNodes: Map<string, ExtServiceNodeModel>;
let l1Links: Map<string, ServiceLinkModel>;
let l2Links: ServiceLinkModel[];
let cellLinks: Map<string, ServiceLinkModel>;

let untrackedPkgComponents: string[];

export function serviceModeller(projectComponents: Map<string, ComponentModel>, projectPackages: Map<string, boolean>): ServiceModels {
    l1Nodes = new Map<string, ServiceNodeModel>();
    l2Nodes = new Map<string, ServiceNodeModel>();
    cellNodes = new Map<string, ServiceNodeModel>();

    l1EntryNodes = new Map<string, EntryNodeModel>();
    l2EntryNodes = new Map<string, EntryNodeModel>();
    cellEntryNodes = new Map<string, EntryNodeModel>();

    l1ExtNodes = new Map<string, ExtServiceNodeModel>();
    l2ExtNodes = new Map<string, ExtServiceNodeModel>();
    cellExtNodes = new Map<string, ExtServiceNodeModel>();

    l1Links = new Map<string, ServiceLinkModel>();
    cellLinks = new Map<string, ServiceLinkModel>();
    l2Links = [];

    let components = projectComponents;
    if (isVersionBelowV4(projectComponents)) {
        components = transformToV4Models(projectComponents);
    }

    // convert service and main entrypoints to nodes
    generateNodes(components, projectPackages);
    // convert interactions to links and detect external services
    generateLinks(components, projectPackages);

    // set L1 model
    let l1Model = new DiagramModel();
    l1Model.addAll(
        ...Array.from(l1Nodes.values()),
        ...Array.from(l1EntryNodes.values()),
        ...Array.from(l1ExtNodes.values()),
        ...Array.from(l1Links.values()));

    // set L2 model
    let l2Model = new DiagramModel();
    l2Model.addAll(
        ...Array.from(l2Nodes.values()),
        ...Array.from(l2EntryNodes.values()),
        ...Array.from(l2ExtNodes.values()),
        ...l2Links);

    // set cell model
    let cellModel = new DiagramModel();
    cellModel.addAll(
        ...Array.from(cellNodes.values()),
        ...Array.from(cellEntryNodes.values()),
        ...Array.from(cellExtNodes.values()),
        ...Array.from(cellLinks.values()))

    return { levelOne: l1Model, levelTwo: l2Model, cellModel: cellModel };
}

function generateNodes(projectComponents: Map<string, ComponentModel>, projectPackages: Map<string, boolean>) {
    projectPackages.forEach((shouldRender, packageName) => {
        if (shouldRender && projectComponents.has(packageName)) {
            untrackedPkgComponents = [];
            const packageModel: ComponentModel = projectComponents.get(packageName);
            const services: Map<string, Service> = new Map(Object.entries(packageModel.services));
            services.forEach((service) => {
                if (!service.serviceId) {
                    service.serviceId.id = uuid();
                    service.annotation = { ...service.annotation, id: service.serviceId.id };
                }

                if (!service.path && (!service.annotation.label || validateUUID(service.annotation.label))
                    && validateUUID(service.annotation.id)) {
                    service.annotation.label = generateLabels(packageModel.packageId.name, service.serviceId.id);
                }

                // create the L1 service nodes
                const l1Node = new ServiceNodeModel(service, Level.ONE, packageModel.version);
                l1Nodes.set(service.serviceId.id, l1Node);

                // create the cell diagram nodes
                const cellNode = new ServiceNodeModel(service, Level.ONE, packageModel.version, extractGateways(service));
                cellNodes.set(service.serviceId.id, cellNode);

                // create the L2 service nodes
                const l2Node = new ServiceNodeModel(service, Level.TWO, packageModel.version);
                l2Nodes.set(service.serviceId.id, l2Node);
            });

            if (packageModel.functionEntryPoint) {
                const { functionEntryPoint, version } = packageModel;
                const l1EntryNode = new EntryNodeModel(packageName, functionEntryPoint, Level.ONE, version);
                l1EntryNodes.set(packageName, l1EntryNode);

                const cellEntryNode = new EntryNodeModel(packageName, functionEntryPoint, Level.ONE, version);
                cellEntryNodes.set(packageName, cellEntryNode);

                const l2EntryNode = new EntryNodeModel(packageName, functionEntryPoint, Level.TWO, version);
                l2EntryNodes.set(packageName, l2EntryNode);
            }
        }
    });
}

function generateLinks(projectComponents: Map<string, ComponentModel>, projectPackages: Map<string, boolean>) {
    projectPackages.forEach((shouldRender, packageName) => {
        if (shouldRender && projectComponents.has(packageName)) {
            const services: Map<string, Service> = new Map(Object.entries(projectComponents.get(packageName).services));
            const dependencies: CMDependency[] = projectComponents.get(packageName).dependencies;

            services.forEach((service) => {
                let l1SourceNode: ServiceNodeModel = l1Nodes.get(service.serviceId.id);
                let l2SourceNode: ServiceNodeModel = l2Nodes.get(service.serviceId.id);
                let cellSourceNode: ServiceNodeModel = cellNodes.get(service.serviceId.id);
                if (l1SourceNode && l2SourceNode && cellSourceNode) {
                    mapInteractions(l1SourceNode, l2SourceNode, cellSourceNode, service.resources);
                    mapInteractions(l1SourceNode, l2SourceNode, cellSourceNode, service.remoteFunctions);

                    if (service.dependencyIDs.length > 0) {
                        const dependencyIDs = service.dependencyIDs.map(d => d.id);
                        const serviceDependencies: CMDependency[] = dependencies.filter(dependency =>
                            dependencyIDs.includes(dependency.entryPointID.id));
                        mapDependencies(l1SourceNode, l2SourceNode, cellSourceNode, serviceDependencies);
                    }
                }
            });

            if (projectComponents.get(packageName).functionEntryPoint) {
                const l1EntryNode: EntryNodeModel = l1EntryNodes.get(packageName);
                const l2EntryNode: EntryNodeModel = l2EntryNodes.get(packageName);
                const cellEntryNode: EntryNodeModel = cellEntryNodes.get(packageName);
                const { interactions, dependencyIDs } = projectComponents.get(packageName).functionEntryPoint;
                mapEntryPointInteractions(l1EntryNode, l2EntryNode, cellEntryNode, interactions);

                if (dependencyIDs.length > 0) {
                    const depIDs = dependencyIDs.map(d => d.id);
                    const functionDependencies: CMDependency[] = dependencies.filter(dependency =>
                        depIDs.includes(dependency.entryPointID.id));
                    mapDependencies(l1EntryNode, l2EntryNode, cellEntryNode, functionDependencies);
                }
            }
        }
    });
}

function mapDependencies(l1Source: ServiceNodeModels, l2Source: ServiceNodeModels, cellSourceNode: ServiceNodeModels, dependencies: Dependency[]) {
    dependencies?.forEach((dependency) => {
        if (dependency.entryPointID && l1Nodes.has(dependency.entryPointID.id) && l2Nodes.has(dependency.entryPointID.id) && cellNodes.has(dependency.entryPointID.id)) {
            let linkID: string = `${l1Source.getID()}-${dependency.entryPointID.id}`;
            if (!l1Links.has(linkID)) {
                const l1TargetNode: ServiceNodeModel = l1Nodes.get(dependency.entryPointID.id);
                if (l1TargetNode) {
                    let link: ServiceLinkModel = setLinkPorts(l1Source, l1TargetNode, dependency.elementLocation);
                    if (link) {
                        l1Links.set(linkID, link);
                    }
                }

                const cellTargetNode: ServiceNodeModel = cellNodes.get(dependency.entryPointID.id);
                if (cellTargetNode) {
                    let cellLink: ServiceLinkModel = setLinkPorts(cellSourceNode, cellTargetNode, dependency.elementLocation);
                    if (cellLink) {
                        cellLinks.set(linkID, cellLink);
                    }
                }
            }

            const l2TargetNode: ServiceNodeModel = l2Nodes.get(dependency.entryPointID.id);
            if (l2TargetNode) {
                let link: ServiceLinkModel = setLinkPorts(l2Source, l2TargetNode, dependency.elementLocation);
                if (link) {
                    l2Links.push(link);
                }
            }
        } else if (dependency.entryPointID.id || dependency.connectorType) {
            mapExtServices(l1Source, l2Source, cellSourceNode, dependency);
        }
    })
}

function mapInteractions(l1Source: ServiceNodeModel, l2Source: ServiceNodeModel, cellSourceNode: ServiceNodeModel,
    functions: ResourceFunction[] | RemoteFunction[]) {
    functions.forEach((sourceFunction: ResourceFunction | RemoteFunction) => {
        sourceFunction.interactions.forEach(interaction => {
            if (l1Nodes.has(interaction.resourceId.serviceId) && l2Nodes.has(interaction.resourceId.serviceId) && cellNodes.has(interaction.resourceId.serviceId)) {
                mapLinksByLevel(l1Source, l2Source, cellSourceNode, interaction, sourceFunction);
            } else if (interaction.resourceId?.serviceId || interaction.connectorType) {
                mapExtServices(l1Source, l2Source, cellSourceNode, interaction, sourceFunction);
            }
        });
    })
}

function mapLinksByLevel(l1Source: ServiceNodeModel, l2Source: ServiceNodeModel, cellSource: ServiceNodeModel, interaction: Interaction,
    sourceFunction: ResourceFunction | RemoteFunction) {
    // create L1 service links if not created already
    let linkID: string = `${l1Source.getID()}-${interaction.resourceId.serviceId}`;
    if (!l1Links.has(linkID)) {
        let l1Target: ServiceNodeModel = l1Nodes.get(interaction.resourceId.serviceId);
        if (l1Target) {
            let link: ServiceLinkModel = setLinkPorts(l1Source, l1Target, interaction.elementLocation);
            if (link) {
                l1Links.set(linkID, link);
            }
        }
    }

    // create cell diagram links if not created already
    if (!cellLinks.has(linkID)) {
        let cellTarget: ServiceNodeModel = cellNodes.get(interaction.resourceId.serviceId);
        if (cellTarget) {
            let cellLink: ServiceLinkModel = setLinkPorts(cellSource, cellTarget, interaction.elementLocation);
            if (cellLink) {
                cellLinks.set(linkID, cellLink);
            }
        }
    }

    // creating L2 service links
    let l2Target: ServiceNodeModel = l2Nodes.get(interaction.resourceId.serviceId);
    if (l2Target) {
        let link: ServiceLinkModel = setLinkPorts(l2Source, l2Target, interaction.elementLocation, interaction, sourceFunction);
        if (link) {
            l2Links.push(link);
        }
    }
}

export function createLinks(sourcePort: ServicePortModel, targetPort: ServicePortModel, link: ServiceLinkModel): ServiceLinkModel {
    if (targetPort.getNode() instanceof ServiceNodeModel) {
        (targetPort.getNode() as ServiceNodeModel).setIsLinked();
    }
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}

function setLinkPorts(sourceNode: ServiceNodeModels, targetNode: ServiceNodeModel, location: Location, interaction?: Interaction,
    sourceFunction?: RemoteFunction | ResourceFunction): ServiceLinkModel {
    let sourcePort: ServicePortModel = undefined;
    let targetPort: ServicePortModel = undefined;

    // Differentiates L2 links
    if (sourceFunction && interaction) {
        let sourcePortID = isResource(sourceFunction) ? `right-${sourceFunction.resourceId.action}/${sourceFunction.identifier}`
            : `right-${sourceFunction.name}`;
        sourcePort = sourceNode.getPortFromID(sourcePortID);

        // since HTTP and GraphQL can both have either resource or remote functions
        if (targetNode.serviceType !== ServiceTypes.GRPC && targetNode.nodeObject.resources.length > 0) {
            targetPort = targetNode.getPortFromID(`left-${interaction.resourceId.action}/${interaction.resourceId.path}`);
        }
        if (!targetPort && targetNode.nodeObject.remoteFunctions.length > 0) {
            targetPort = targetNode.getPortFromID(`left-${interaction.resourceId.action}`);
        }
    }

    // Also redirects L2 links to service heads, if the interacting resources cannot be detected
    if (!sourcePort) {
        sourcePort = sourceNode.getPortFromID(`right-${sourceNode.getID()}`);
    }
    if (!targetPort) {
        targetPort = targetNode.getPortFromID(`left-${targetNode.getID()}`);
    }

    if (sourcePort && targetPort) {
        let link: ServiceLinkModel = new ServiceLinkModel(sourceFunction ? Level.TWO : Level.ONE, location,
            `service-link-${sourceNode?.nodeObject?.annotation?.label || sourceNode?.nodeObject?.annotation?.id}-${targetNode?.nodeObject?.annotation?.label
                || targetNode?.nodeObject?.annotation?.id}`);
        return createLinks(sourcePort, targetPort, link);
    }
}

function mapExtServices(l1Source: ServiceNodeModels, l2Source: ServiceNodeModels, cellSource: ServiceNodeModels,
    interaction: Interaction | Dependency, callingFunction?: ResourceFunction | RemoteFunction) {
    const identifier: string = ('resourceId' in interaction ? interaction.resourceId.serviceId : interaction.entryPointID.id)
        || interaction.connectorType;
    const label: string = getExternalNodeLabel(interaction);

    // create L1 external service node if not available
    let l1ExtService: ExtServiceNodeModel;
    if (l1ExtNodes.has(identifier)) {
        l1ExtService = l1ExtNodes.get(identifier);
    } else {
        l1ExtService = new ExtServiceNodeModel(identifier, label);
        l1ExtNodes.set(identifier, l1ExtService);
    }

    // maps L1 links to external services
    let l1Link: ServiceLinkModel = mapExtLinks(l1Source, l1ExtService, interaction.elementLocation, undefined);
    if (l1Link) {
        l1Links.set(`${l1Source.getID()}${identifier}`, l1Link);
    }

    // create cell external service node if not available
    let cellExtService: ExtServiceNodeModel;
    if (cellExtNodes.has(identifier)) {
        cellExtService = cellExtNodes.get(identifier);
    } else {
        cellExtService = new ExtServiceNodeModel(identifier, label);
        cellExtNodes.set(identifier, cellExtService);
    }

    // maps cell links to external services
    let cellLink: ServiceLinkModel = mapExtLinks(cellSource, cellExtService, interaction.elementLocation, undefined);
    if (cellLink) {
        cellLinks.set(`${cellSource.getID()}${identifier}`, cellLink);
    }

    // create L2 external service nodes and links
    let l2ExtService: ExtServiceNodeModel;
    if (l2ExtNodes.has(identifier)) {
        l2ExtService = l2ExtNodes.get(identifier);
    } else {
        l2ExtService = new ExtServiceNodeModel(identifier, label);
        l2ExtNodes.set(identifier, l2ExtService);
    }

    let sourcePortID: string = !callingFunction ? undefined : isResource(callingFunction) ?
        `right-${callingFunction.resourceId.action}/${callingFunction.identifier}` : `right-${callingFunction.name}`;
    let l2Link: ServiceLinkModel = mapExtLinks(l2Source, l2ExtService, interaction.elementLocation, sourcePortID);
    if (l2Link) {
        l2Links.push(l2Link);
    }
}

function mapExtLinks(source: ServiceNodeModels, target: ExtServiceNodeModel, location: Location, sourcePortID?: string)
    : ServiceLinkModel {
    let sourcePort: ServicePortModel;
    let targetPort: ServicePortModel = target.getPortFromID(`left-${target.getID()}`);

    if (sourcePortID) {
        sourcePort = source.getPortFromID(sourcePortID);
    }
    if (!sourcePort) {
        sourcePort = source.getPortFromID(`right-${source.getID()}`);
    }

    if (sourcePort && targetPort) {
        let link: ServiceLinkModel = new ServiceLinkModel(sourcePortID ? Level.TWO : Level.ONE, location);
        return createLinks(sourcePort, targetPort, link);
    }
}

function mapEntryPointInteractions(l1Source: EntryNodeModel, l2Source: EntryNodeModel, cellSource: EntryNodeModel, interactions: Interaction[]) {
    interactions?.forEach((interaction) => {
        if (l1Nodes.has(interaction.resourceId.serviceId) && l2Nodes.has(interaction.resourceId.serviceId)) {
            const linkID: string = `${l1Source.getID()}-${interaction.resourceId.serviceId}`;
            if (!l1Links.has(linkID) && !cellLinks.has(linkID)) {
                const l1Target: ServiceNodeModel = l1Nodes.get(interaction.resourceId.serviceId);
                const l1Link: ServiceLinkModel = generateEntryPointLinks(l1Source, l1Target, interaction, Level.ONE);
                l1Links.set(linkID, l1Link);

                const cellTarget: ServiceNodeModel = cellNodes.get(interaction.resourceId.serviceId);
                const cellLink: ServiceLinkModel = generateEntryPointLinks(cellSource, cellTarget, interaction, Level.ONE);
                cellLinks.set(linkID, cellLink);
            }

            const l2Target: ServiceNodeModel = l2Nodes.get(interaction.resourceId.serviceId);
            const l2Link: ServiceLinkModel = generateEntryPointLinks(l2Source, l2Target, interaction, Level.TWO);
            l2Links.push(l2Link);
        } else if (interaction.resourceId?.serviceId || interaction.connectorType) {
            mapExtServices(l1Source, l2Source, cellSource, interaction);
        }
    });
}

function generateEntryPointLinks(source: EntryNodeModel, target: ServiceNodeModel, interaction: Interaction, level: Level): ServiceLinkModel {
    let targetPort: ServicePortModel;
    if (level === Level.TWO && interaction) {
        // since HTTP and GraphQL can both have either resource or remote functions
        if (target.serviceType !== ServiceTypes.GRPC && target.nodeObject.resources.length > 0) {
            targetPort = target.getPortFromID(`left-${interaction.resourceId.action}/${interaction.resourceId.path}`);
        }
        if (!targetPort && target.nodeObject.remoteFunctions.length > 0) {
            targetPort = target.getPortFromID(`left-${interaction.resourceId.action}`);
        }
    }

    const sourcePort: ServicePortModel = source.getPortFromID(`right-${source.getID()}`);
    if (!targetPort) {
        targetPort = target.getPortFromID(`left-${target.getID()}`);
    }

    if (sourcePort && targetPort) {
        let link: ServiceLinkModel = new ServiceLinkModel(level, interaction.elementLocation);
        return createLinks(sourcePort, targetPort, link);
    }
}

function isResource(functionObject: ResourceFunction | RemoteFunction): functionObject is ResourceFunction {
    return (functionObject as ResourceFunction).resourceId !== undefined;
}

function generateLabels(packageName: string, serviceId: string): string {
    if (untrackedPkgComponents.length === 1 && l1Nodes.has(untrackedPkgComponents[0]) &&
        l2Nodes.has(untrackedPkgComponents[0]) && cellNodes.has(untrackedPkgComponents[0])) {
        [l1Nodes, l2Nodes, cellNodes].forEach((nodes) => {
            nodes.get(untrackedPkgComponents[0]).nodeObject.annotation.label = `${packageName} Component1`;
        });
    }
    const label: string = `${packageName} Component${untrackedPkgComponents.length > 0 ? untrackedPkgComponents.length + 1 : ''}`;
    untrackedPkgComponents.push(serviceId);
    return label;
}

function getExternalNodeLabel(interaction: Dependency | Interaction): string {
    let label: string = ('resourceId' in interaction ? interaction.resourceId.serviceLabel : interaction.serviceLabel)
        || interaction.connectorType;
    if (label === interaction.connectorType) {
        // removes prefix org name
        label = label.substring(label.indexOf('/') + 1);
        // remove suffix version
        label = label.substring(0, label.lastIndexOf(':'));
        if (label.toLowerCase().endsWith('client')) {
            label = label.slice(0, -6);
        }
    }
    return label;
}
