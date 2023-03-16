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

import { DiagramModel } from '@projectstorm/react-diagrams';
import { uniqueId } from 'lodash';
import {
    ComponentModel, Dependency, Interaction, Level, Location, RemoteFunction, ResourceFunction, Service, ServiceModels,
    ServiceTypes
} from '../../resources';
import { EntryNodeModel, ExtServiceNodeModel, ServiceLinkModel, ServiceNodeModel, ServicePortModel } from '../../components/service-interaction';
import { extractGateways } from "../utils";

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

export function serviceModeller(projectComponents: Map<string, ComponentModel>, projectPackages: Map<string, boolean>): ServiceModels {
    // convert services to nodes
    l1Nodes = new Map<string, ServiceNodeModel>();
    l2Nodes = new Map<string, ServiceNodeModel>();
    cellNodes = new Map<string, ServiceNodeModel>();
    l1EntryNodes = new Map<string, EntryNodeModel>();
    l2EntryNodes = new Map<string, EntryNodeModel>();
    cellEntryNodes = new Map<string, EntryNodeModel>();
    generateNodes(projectComponents, projectPackages);

    // convert interactions to links and detect external services
    l1ExtNodes = new Map<string, ExtServiceNodeModel>();
    l2ExtNodes = new Map<string, ExtServiceNodeModel>();
    cellExtNodes = new Map<string, ExtServiceNodeModel>();
    l1Links = new Map<string, ServiceLinkModel>();
    cellLinks = new Map<string, ServiceLinkModel>();
    l2Links = []
    generateLinks(projectComponents, projectPackages);

    // setup L1 model
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
            const packageModel: ComponentModel = projectComponents.get(packageName);
            const services: Map<string, Service> = new Map(Object.entries(packageModel.services));
            services.forEach((service) => {
                if (service.serviceId === '') {
                    service.serviceId = uniqueId(`${packageName}/${service.path}`);
                }
                // create the L1 service nodes
                const l1Node = new ServiceNodeModel(service, Level.ONE);
                l1Nodes.set(service.serviceId, l1Node);

                // create the cell diagram nodes
                const cellNode = new ServiceNodeModel(service, Level.ONE, extractGateways(service));
                cellNodes.set(service.serviceId, cellNode);

                // create the L2 service nodes
                const l2Node = new ServiceNodeModel(service, Level.TWO);
                l2Nodes.set(service.serviceId, l2Node);
            });

            if (packageModel.entryPoint) {
                const l1EntryNode = new EntryNodeModel(packageName, Level.ONE);
                l1EntryNodes.set(packageName, l1EntryNode);

                const cellEntryNode = new EntryNodeModel(packageName, Level.ONE);
                cellEntryNodes.set(packageName, cellEntryNode);

                const l2EntryNode = new EntryNodeModel(packageName, Level.TWO);
                l2EntryNodes.set(packageName, l2EntryNode);

                mapEntryPointInteractions(l1EntryNode, l2EntryNode, cellEntryNode, packageModel.entryPoint.interactions);
            }
        }
    });
}

function generateLinks(projectComponents: Map<string, ComponentModel>, projectPackages: Map<string, boolean>) {
    projectPackages.forEach((shouldRender, packageName) => {
        if (shouldRender && projectComponents.has(packageName)) {
            const services: Map<string, Service> = new Map(Object.entries(projectComponents.get(packageName).services));

            services.forEach((service) => {
                let l1SourceNode: ServiceNodeModel = l1Nodes.get(service.serviceId);
                let l2SourceNode: ServiceNodeModel = l2Nodes.get(service.serviceId);
                let cellSourceNode: ServiceNodeModel = cellNodes.get(service.serviceId);
                if (l1SourceNode && l2SourceNode && cellSourceNode) {
                    mapInteractions(l1SourceNode, l2SourceNode, cellSourceNode, service.resources);
                    mapInteractions(l1SourceNode, l2SourceNode, cellSourceNode, service.remoteFunctions);

                    if (service.dependencies) {
                        mapDependencies(l1SourceNode, l2SourceNode, cellSourceNode, service.dependencies);
                    }
                }
            });
        }
    });
}

function mapDependencies(l1Source: ServiceNodeModel, l2Source: ServiceNodeModel, cellSourceNode: ServiceNodeModel, dependencies: Dependency[]) {
    dependencies.forEach((dependency) => {
        if (dependency.serviceId && l1Nodes.has(dependency.serviceId) && l2Nodes.has(dependency.serviceId) && cellNodes.has(dependency.serviceId)) {
            let linkID: string = `${l1Source.getID()}-${dependency.serviceId}`;
            if (!l1Links.has(linkID)) {
                const l1TargetNode: ServiceNodeModel = l1Nodes.get(dependency.serviceId);
                if (l1TargetNode) {
                    let link: ServiceLinkModel = setLinkPorts(l1Source, l1TargetNode, dependency.elementLocation);
                    if (link) {
                        l1Links.set(linkID, link);
                    }
                }

                const cellTargetNode: ServiceNodeModel = cellNodes.get(dependency.serviceId);
                if (cellTargetNode) {
                    let cellLink: ServiceLinkModel = setLinkPorts(cellSourceNode, cellTargetNode, dependency.elementLocation);
                    if (cellLink) {
                        cellLinks.set(linkID, cellLink);
                    }
                }
            }

            const l2TargetNode: ServiceNodeModel = l2Nodes.get(dependency.serviceId);
            if (l2TargetNode) {
                let link: ServiceLinkModel = setLinkPorts(l2Source, l2TargetNode, dependency.elementLocation);
                if (link) {
                    l2Links.push(link);
                }
            }
        } else if (dependency.connectorType) {
            mapExtServices(l1Source, l2Source, cellSourceNode, dependency.connectorType, dependency.elementLocation);
        }
    })
}

function mapInteractions(l1Source: ServiceNodeModel, l2Source: ServiceNodeModel, cellSourceNode: ServiceNodeModel,
    functions: ResourceFunction[] | RemoteFunction[]) {
    functions.forEach((sourceFunction: ResourceFunction | RemoteFunction) => {
        sourceFunction.interactions.forEach(interaction => {
            if (l1Nodes.has(interaction.resourceId.serviceId) && l2Nodes.has(interaction.resourceId.serviceId) && cellNodes.has(interaction.resourceId.serviceId)) {
                mapLinksByLevel(l1Source, l2Source, cellSourceNode, interaction, sourceFunction);
            } else if (interaction.connectorType) {
                mapExtServices(l1Source, l2Source, cellSourceNode, interaction.connectorType, interaction.elementLocation, sourceFunction);
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
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}

function setLinkPorts(sourceNode: ServiceNodeModel, targetNode: ServiceNodeModel, location: Location, interaction?: Interaction,
    sourceFunction?: RemoteFunction | ResourceFunction): ServiceLinkModel {
    let sourcePort: ServicePortModel = undefined;
    let targetPort: ServicePortModel = undefined;

    // Differentiates L2 links
    if (sourceFunction && interaction) {
        let sourcePortID = isResource(sourceFunction) ? `right-${sourceFunction.resourceId.action}/${sourceFunction.identifier}`
            : `right-${sourceFunction.name}`;
        sourcePort = sourceNode.getPortFromID(sourcePortID);

        // since HTTP and GraphQL can both have either resource or remote functions
        if (targetNode.serviceType !== ServiceTypes.GRPC && targetNode.serviceObject.resources.length > 0) {
            targetPort = targetNode.getPortFromID(`left-${interaction.resourceId.action}/${interaction.resourceId.path}`);
        }
        if (!targetPort && targetNode.serviceObject.remoteFunctions.length > 0) {
            targetPort = targetNode.getPortFromID(`left-${interaction.resourceId.action}`);
        }
    }

    // Also redirects L2 links to service heads, if the interacting resources cannot be detected
    if (!sourcePort) {
        sourcePort = sourceNode.getPortFromID(`right-${sourceNode.serviceObject.serviceId}`);
    }
    if (!targetPort) {
        targetPort = targetNode.getPortFromID(`left-${targetNode.serviceObject.serviceId}`);
    }

    if (sourcePort && targetPort) {
        let link: ServiceLinkModel = new ServiceLinkModel(sourceFunction ? Level.TWO : Level.ONE, location);
        return createLinks(sourcePort, targetPort, link);
    }
}

function mapExtServices(l1Source: ServiceNodeModels, l2Source: ServiceNodeModels, cellSource: ServiceNodeModels,
    connectorType: string, location: Location, callingFunction?: ResourceFunction | RemoteFunction) {
    // create L1 external service node if not available
    let l1ExtService: ExtServiceNodeModel;
    if (l1ExtNodes.has(connectorType)) {
        l1ExtService = l1ExtNodes.get(connectorType);
    } else {
        l1ExtService = new ExtServiceNodeModel(connectorType);
        l1ExtNodes.set(connectorType, l1ExtService);
    }

    // maps L1 links to external services
    let l1Link: ServiceLinkModel = mapExtLinks(l1Source, l1ExtService, location, undefined);
    if (l1Link) {
        l1Links.set(`${l1Source.getID()}${connectorType}`, l1Link);
    }

    // create cell external service node if not available
    let cellExtService: ExtServiceNodeModel;
    if (cellExtNodes.has(connectorType)) {
        cellExtService = cellExtNodes.get(connectorType);
    } else {
        cellExtService = new ExtServiceNodeModel(connectorType);
        cellExtNodes.set(connectorType, cellExtService);
    }

    // maps cell links to external services
    let cellLink: ServiceLinkModel = mapExtLinks(cellSource, cellExtService, location, undefined);
    if (cellLink) {
        cellLinks.set(`${cellSource.getID()}${connectorType}`, cellLink);
    }

    // create L2 external service nodes and links
    let l2ExtService: ExtServiceNodeModel;
    if (l2ExtNodes.has(connectorType)) {
        l2ExtService = l2ExtNodes.get(connectorType);
    } else {
        l2ExtService = new ExtServiceNodeModel(connectorType);
        l2ExtNodes.set(connectorType, l2ExtService);
    }

    let sourcePortID: string = !callingFunction ? undefined : isResource(callingFunction) ?
        `right-${callingFunction.resourceId.action}/${callingFunction.identifier}` : `right-${callingFunction.name}`;
    let l2Link: ServiceLinkModel = mapExtLinks(l2Source, l2ExtService, location, sourcePortID);
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
    interactions.forEach((interaction) => {
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
        } else if (interaction.connectorType) {
            mapExtServices(l1Source, l2Source, cellSource, interaction.connectorType, interaction.elementLocation);
        }
    });
}

function generateEntryPointLinks(source: EntryNodeModel, target: ServiceNodeModel, interaction: Interaction, level: Level): ServiceLinkModel {
    let targetPort: ServicePortModel;
    if (level === Level.TWO && interaction) {
        // since HTTP and GraphQL can both have either resource or remote functions
        if (target.serviceType !== ServiceTypes.GRPC && target.serviceObject.resources.length > 0) {
            targetPort = target.getPortFromID(`left-${interaction.resourceId.action}/${interaction.resourceId.path}`);
        }
        if (!targetPort && target.serviceObject.remoteFunctions.length > 0) {
            targetPort = target.getPortFromID(`left-${interaction.resourceId.action}`);
        }
    }

    const sourcePort: ServicePortModel = source.getPortFromID(`right-${source.getID()}`);
    if (!targetPort) {
        targetPort = target.getPortFromID(`left-${target.serviceObject.serviceId}`);
    }

    if (sourcePort && targetPort) {
        let link: ServiceLinkModel = new ServiceLinkModel(level, interaction.elementLocation);
        return createLinks(sourcePort, targetPort, link);
    }
}

function isResource(functionObject: ResourceFunction | RemoteFunction): functionObject is ResourceFunction {
    return (functionObject as ResourceFunction).resourceId !== undefined;
}
