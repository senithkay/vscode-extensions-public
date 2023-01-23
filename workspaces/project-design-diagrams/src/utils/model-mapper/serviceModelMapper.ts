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
import { ComponentModel, Dependency, Interaction, Level, Location, RemoteFunction, ResourceFunction, Service, ServiceModels,
    ServiceTypes } from '../../resources';
import { ExtServiceNodeModel, ServiceLinkModel, ServiceNodeModel, ServicePortModel } from '../../components/service-interaction';
import { GatewayNodeModel } from "../../components/gateway/GatewayNode/GatewayNodeModel";
import { GatewayType } from "../../components/gateway/types";
import { GatewayPortModel } from "../../components/gateway/GatewayPort/GatewayPortModel";
import { GatewayLinkModel } from "../../components/gateway/GatewayLink/GatewayLinkModel";

let gwNodes: Map<string, GatewayNodeModel>;
let l1Nodes: Map<string, ServiceNodeModel>;
let l2Nodes: Map<string, ServiceNodeModel>;
let l1ExtNodes: Map<string, ExtServiceNodeModel>;
let l2ExtNodes: Map<string, ExtServiceNodeModel>;
let l1Links: Map<string, ServiceLinkModel | GatewayLinkModel>;
let l2Links: (ServiceLinkModel | GatewayLinkModel)[];

export function serviceModeller(projectComponents: Map<string, ComponentModel>, projectPackages: Map<string, boolean>): ServiceModels {
    // convert gateway to nodes
    gwNodes = new Map<string, GatewayNodeModel>();

    // convert services to nodes
    l1Nodes = new Map<string, ServiceNodeModel>();
    l2Nodes = new Map<string, ServiceNodeModel>();
    generateNodes(projectComponents, projectPackages);

    // convert interactions to links and detect external services
    l1ExtNodes = new Map<string, ExtServiceNodeModel>();
    l2ExtNodes = new Map<string, ExtServiceNodeModel>();
    l1Links = new Map<string, ServiceLinkModel | GatewayLinkModel>();
    l2Links = []
    generateLinks(projectComponents, projectPackages);

    // setup L1 model
    let l1Model = new DiagramModel();
    l1Model.addAll(...Array.from(gwNodes.values()), ...Array.from(l1Nodes.values()),
        ...Array.from(l1ExtNodes.values()), ...Array.from(l1Links.values()));

    // set L2 model
    let l2Model = new DiagramModel();
    l2Model.addAll(...Array.from(gwNodes.values()), ...Array.from(l2Nodes.values()),
        ...Array.from(l2ExtNodes.values()), ...l2Links);

    return {
        levelOne: l1Model,
        levelTwo: l2Model
    };
}

function addGWNodes() {
    // Add gateway nodes
    const northGW = new GatewayNodeModel('NORTH', 'Internet');
    const westGW = new GatewayNodeModel('WEST', 'Intranet');
    gwNodes.set('NORTH', northGW);
    gwNodes.set('WEST', westGW);
}

function generateNodes(projectComponents: Map<string, ComponentModel>, projectPackages: Map<string, boolean>) {
    addGWNodes();
    projectPackages.forEach((shouldRender, packageName) => {
        if (shouldRender && projectComponents.has(packageName)) {
            const services: Map<string, Service> = new Map(Object.entries(projectComponents.get(packageName).services));
            services.forEach((service) => {
                if (service.serviceId !== '') {
                    // create the L1 service nodes
                    const l1Node = new ServiceNodeModel(service, Level.ONE, extractGateways(service));
                    l1Nodes.set(service.serviceId, l1Node);

                    // create the L2 service nodes
                    const l2Node = new ServiceNodeModel(service, Level.TWO, extractGateways(service));
                    l2Nodes.set(service.serviceId, l2Node);
                }
            });
        }
    });
}

function extractGateways(service: Service): GatewayType[] {
    let gatewayTypes: GatewayType[] = [];
    if (service?.deploymentMetadata?.gateways?.internet?.isExposed) {
        // Internet type to North
        gatewayTypes.push("NORTH");
    }
    if (service?.deploymentMetadata?.gateways?.intranet?.isExposed) {
        // Intranet type to West
        gatewayTypes.push("WEST");;
    }
    return gatewayTypes;
}

function generateLinks(projectComponents: Map<string, ComponentModel>, projectPackages: Map<string, boolean>) {
    projectPackages.forEach((shouldRender, packageName) => {
        if (shouldRender && projectComponents.has(packageName)) {
            const services: Map<string, Service> = new Map(Object.entries(projectComponents.get(packageName).services));

            services.forEach((service) => {
                let l1SourceNode: ServiceNodeModel = l1Nodes.get(service.serviceId);
                let l2SourceNode: ServiceNodeModel = l2Nodes.get(service.serviceId);

                mapGWInteractions(l1SourceNode, l2SourceNode);

                if (l1SourceNode && l2SourceNode) {
                    mapInteractions(l1SourceNode, l2SourceNode, service.resources);
                    mapInteractions(l1SourceNode, l2SourceNode, service.remoteFunctions);

                    if (service.dependencies) {
                        mapDependencies(l1SourceNode, l2SourceNode, service.dependencies);
                    }
                }
            });
        }
    });
}

function mapGWInteractions(l1SourceNode: ServiceNodeModel, l2SourceNode: ServiceNodeModel) {
    l1SourceNode.getTargetGateways().forEach((gwType: GatewayType) => {
        mapL1GWInteraction(l1SourceNode, gwType);
    });
    l2SourceNode.getTargetGateways().forEach((gwType: GatewayType) => {
        mapL2GWInteraction(l2SourceNode, gwType);
    });
}

function mapL1GWInteraction(serviceModel: ServiceNodeModel, gwType: GatewayType) {
    const linkID: string = `${serviceModel.getID()}-${gwType}-in`;
    if ((serviceModel?.targetGateways.length > 0) && !l1Links.has(linkID)) {
        const link: GatewayLinkModel = new GatewayLinkModel(serviceModel.level);
        const sourceGW: GatewayNodeModel = gwNodes.get(gwType);
        const sourcePort: GatewayPortModel = sourceGW.getPortFromID(`${gwType}-in`);
        let targetPort;
        if (gwType === "WEST") {
            targetPort = serviceModel.getPortFromID(`left-gw-${serviceModel.serviceObject.serviceId}`);
        } else {
            targetPort = serviceModel.getPortFromID(`top-${serviceModel.serviceObject.serviceId}`);
        }
        l1Links.set(linkID, createLinks(sourcePort, targetPort, link));
    }
}

function mapL2GWInteraction(serviceModel: ServiceNodeModel, gwType: GatewayType) {
    if ((serviceModel?.targetGateways.length > 0)) {
        const link: GatewayLinkModel = new GatewayLinkModel(serviceModel.level);
        const sourceGW: GatewayNodeModel = gwNodes.get(gwType);
        const sourcePort: GatewayPortModel = sourceGW.getPortFromID(`${gwType}-in`);
        let targetPort;
        if (gwType === "WEST") {
            targetPort = serviceModel.getPortFromID(`left-gw-${serviceModel.serviceObject.serviceId}`);
        } else {
            targetPort = serviceModel.getPortFromID(`top-${serviceModel.serviceObject.serviceId}`);
        }
        l2Links.push(createLinks(sourcePort, targetPort, link));
    }
}

function mapDependencies(l1Source: ServiceNodeModel, l2Source: ServiceNodeModel, dependencies: Dependency[]) {
    dependencies.forEach((dependency) => {
        if (dependency.serviceId && l1Nodes.has(dependency.serviceId) && l2Nodes.has(dependency.serviceId)) {
            let linkID: string = `${l1Source.getID()}-${dependency.serviceId}`;
            if (!l1Links.has(linkID)) {
                const l1TargetNode: ServiceNodeModel = l1Nodes.get(dependency.serviceId);
                if (l1TargetNode) {
                    let link = setLinkPorts(l1Source, l1TargetNode, dependency.elementLocation);
                    if (link) {
                        l1Links.set(linkID, link);
                    }
                }
            }

            const l2TargetNode: ServiceNodeModel = l2Nodes.get(dependency.serviceId);
            if (l2TargetNode) {
                let link = setLinkPorts(l2Source, l2TargetNode, dependency.elementLocation);
                if (link) {
                    l2Links.push(link);
                }
            }
        } else if (dependency.connectorType) {
            mapExtServices(l1Source, l2Source, dependency.connectorType, dependency.elementLocation);
        }
    })
}

function mapInteractions(l1Source: ServiceNodeModel, l2Source: ServiceNodeModel, functions: ResourceFunction[] | RemoteFunction[]) {
    functions.forEach((sourceFunction: ResourceFunction | RemoteFunction) => {
        sourceFunction.interactions.forEach(interaction => {
            if (l1Nodes.has(interaction.resourceId.serviceId)) {
                mapLinksByLevel(l1Source, l2Source, interaction, sourceFunction);
            } else if (interaction.connectorType) {
                mapExtServices(l1Source, l2Source, interaction.connectorType, interaction.elementLocation, sourceFunction);
            }
        });
    })
}

function mapLinksByLevel(l1Source: ServiceNodeModel, l2Source: ServiceNodeModel, interaction: Interaction,
    sourceFunction: ResourceFunction | RemoteFunction) {
    // create L1 service links if not created already
    let linkID: string = `${l1Source.getID()}-${interaction.resourceId.serviceId}`;
    if (!l1Links.has(linkID)) {
        let l1Target: ServiceNodeModel = l1Nodes.get(interaction.resourceId.serviceId);
        if (l1Target) {
            let link = setLinkPorts(l1Source, l1Target, interaction.elementLocation);
            if (link) {
                l1Links.set(linkID, link);
            }
        }
    }

    // creating L2 service links
    let l2Target: ServiceNodeModel = l2Nodes.get(interaction.resourceId.serviceId);
    if (l2Target) {
        let link = setLinkPorts(l2Source, l2Target, interaction.elementLocation, interaction, sourceFunction);
        if (link) {
            l2Links.push(link);
        }
    }
}

function setLinkPorts(sourceNode: ServiceNodeModel, targetNode: ServiceNodeModel, location: Location, interaction?: Interaction,
    sourceFunction?: RemoteFunction | ResourceFunction): ServiceLinkModel | GatewayLinkModel {
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

function mapExtServices(l1Source: ServiceNodeModel, l2Source: ServiceNodeModel, connectorType: string, location: Location,
    callingFunction?: ResourceFunction | RemoteFunction) {
    // create L1 external service node if not available
    let l1ExtService: ExtServiceNodeModel;
    if (l1ExtNodes.has(connectorType)) {
        l1ExtService = l1ExtNodes.get(connectorType);
    } else {
        l1ExtService = new ExtServiceNodeModel(connectorType);
        l1ExtNodes.set(connectorType, l1ExtService);
    }

    // maps L1 links to external services
    let l1Link = mapExtLinks(l1Source, l1ExtService, location, undefined);
    if (l1Link) {
        l1Links.set(`${l1Source.getID()}${connectorType}`, l1Link);
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
    let l2Link = mapExtLinks(l2Source, l2ExtService, location, sourcePortID);
    if (l2Link) {
        l2Links.push(l2Link);
    }
}

function mapExtLinks(sourceNode: ServiceNodeModel, target: ExtServiceNodeModel, location: Location, sourcePortID?: string)
    : ServiceLinkModel | GatewayLinkModel {
    let sourcePort: ServicePortModel;
    let targetPort: ServicePortModel = target.getPortFromID(`left-${target.getID()}`);

    if (sourcePortID) {
        sourcePort = sourceNode.getPortFromID(sourcePortID);
    }
    if (!sourcePort) {
        sourcePort = sourceNode.getPortFromID(`right-${sourceNode.serviceObject.serviceId}`);
    }

    if (sourcePort && targetPort) {
        let link: ServiceLinkModel = new ServiceLinkModel(sourcePortID ? Level.TWO : Level.ONE, location);
        return createLinks(sourcePort, targetPort, link);
    }
}

function createLinks(sourcePort: ServicePortModel, targetPort: ServicePortModel | GatewayPortModel, link: ServiceLinkModel | GatewayLinkModel): ServiceLinkModel | GatewayLinkModel {
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}

function isResource(functionObject: ResourceFunction | RemoteFunction): functionObject is ResourceFunction {
    return (functionObject as ResourceFunction).resourceId !== undefined;
}
