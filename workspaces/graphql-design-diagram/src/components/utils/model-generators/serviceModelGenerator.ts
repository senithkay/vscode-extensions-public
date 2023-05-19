/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import { DiagramModel } from "@projectstorm/react-diagrams";

import { GraphqlBaseLinkModel } from "../../Link/BaseLink/GraphqlBaseLinkModel";
import { DefaultLinkModel } from "../../Link/DefaultLink/DefaultLinkModel";
import { GraphqlServiceLinkModel } from "../../Link/GraphqlServiceLink/GraphqlServiceLinkModel";
import { GraphqlDesignNode } from "../../Nodes/BaseNode/GraphqlDesignNode";
import { EnumNodeModel, ENUM_NODE } from "../../Nodes/EnumNode/EnumNodeModel";
import { GraphqlServiceNodeModel } from "../../Nodes/GraphqlServiceNode/GraphqlServiceNodeModel";
import { HierarchicalNodeModel } from "../../Nodes/HierarchicalResourceNode/HierarchicalNodeModel";
import { InterfaceNodeModel } from "../../Nodes/InterfaceNode/InterfaceNodeModel";
import { RecordNodeModel } from "../../Nodes/RecordNode/RecordNodeModel";
import { ServiceClassNodeModel } from "../../Nodes/ServiceClassNode/ServiceClassNodeModel";
import { UnionNodeModel } from "../../Nodes/UnionNode/UnionNodeModel";
import { GraphqlNodeBasePort } from "../../Port/GraphqlNodeBasePort";
import {
    EnumComponent,
    FunctionType,
    GraphqlDesignModel,
    HierarchicalResourceComponent,
    Interaction,
    InterfaceComponent,
    RecordComponent,
    RemoteFunction,
    ResourceFunction,
    Service,
    ServiceClassComponent,
    UnionComponent
} from "../../resources/model";


// all nodes in the diagram
let diagramNodes: Map<string, GraphqlDesignNode>;
// all links in the diagram
let nodeLinks: GraphqlBaseLinkModel[];

export function graphqlModelGenerator(graphqlModel: GraphqlDesignModel): DiagramModel {
    diagramNodes = new Map<string, GraphqlDesignNode>();
    nodeLinks = [];

    // generate the graphql service node
    graphqlServiceModelMapper(graphqlModel.graphqlService);
    // generate nodes for enums
    if (graphqlModel.enums) {
        const enums: Map<string, EnumComponent> = new Map(Object.entries(graphqlModel.enums));
        enumModelMapper(enums);
    }
    if (graphqlModel.records) {
        const records: Map<string, RecordComponent> = new Map(Object.entries(graphqlModel.records));
        recordModelMapper(records);
    }
    if (graphqlModel.serviceClasses) {
        const serviceClasses: Map<string, ServiceClassComponent> = new Map(Object.entries(graphqlModel.serviceClasses));
        serviceClassModelMapper(serviceClasses);
    }
    if (graphqlModel.unions) {
        const unions: Map<string, UnionComponent> = new Map(Object.entries(graphqlModel.unions));
        unionModelMapper(unions);
    }
    if (graphqlModel.interfaces) {
        const interfaces: Map<string, InterfaceComponent> = new Map(Object.entries(graphqlModel.interfaces));
        interfaceModelMapper(interfaces);
    }
    if (graphqlModel.hierarchicalResources) {
        const hierarchicalResources: Map<string, HierarchicalResourceComponent> = new Map(Object.entries(graphqlModel.hierarchicalResources));
        hierarchicalResourceModelMapper(hierarchicalResources);
    }

    generateLinks(graphqlModel);

    removeUnlinkedModels();

    const model = new DiagramModel();
    model.addAll(...Array.from(diagramNodes.values()), ...nodeLinks);
    return model;
}

function removeUnlinkedModels() {
    diagramNodes.forEach((node, key) => {
        if (node.getType() === ENUM_NODE) {
            let isLinked = false;
            for (const [nodeKey, value] of Object.entries(node.getPorts())) {
                if (Object.keys(value.getLinks()).length !== 0) {
                    isLinked = true;
                }
            }
            if (!isLinked) {
                diagramNodes.delete(key);
            }
        }
    });
}

function graphqlServiceModelMapper(service: Service) {
    const serviceNode: GraphqlServiceNodeModel = new GraphqlServiceNodeModel(service);
    diagramNodes.set(service.serviceName, serviceNode);
}

function enumModelMapper(enums: Map<string, EnumComponent>) {
    enums.forEach((enumObj, key) => {
        const enumNode = new EnumNodeModel(enumObj);
        diagramNodes.set(key, enumNode);
    });
}

function recordModelMapper(records: Map<string, RecordComponent>) {
    records.forEach((recordObj, key) => {
        if (!recordObj.isInputObject) {
            const recordNode = new RecordNodeModel(recordObj);
            diagramNodes.set(key, recordNode);
        }
    });
}

function serviceClassModelMapper(classes: Map<string, ServiceClassComponent>) {
    classes.forEach((classObj, key) => {
        const serviceClass = new ServiceClassNodeModel(classObj);
        diagramNodes.set(key, serviceClass);
    });
}

function unionModelMapper(unions: Map<string, UnionComponent>) {
    unions.forEach((unionObj, key) => {
        const unionType = new UnionNodeModel(unionObj);
        diagramNodes.set(key, unionType);
    });
}

function interfaceModelMapper(interfaces: Map<string, InterfaceComponent>) {
    interfaces.forEach((interfaceObj, key) => {
        const interfaceType = new InterfaceNodeModel(interfaceObj);
        diagramNodes.set(key, interfaceType);
    });
}

function hierarchicalResourceModelMapper(hierarchicalResources: Map<string, HierarchicalResourceComponent>) {
    hierarchicalResources.forEach((hierarchicalResourceObj, key) => {
        const hierarchicalResource = new HierarchicalNodeModel(hierarchicalResourceObj);
        diagramNodes.set(key, hierarchicalResource);
    });
}

function generateLinks(graphqlModel: GraphqlDesignModel) {
    // create links for graphqlService
    generateLinksForGraphqlService(graphqlModel.graphqlService);

    if (graphqlModel.unions) {
        const unions: Map<string, UnionComponent> = new Map(Object.entries(graphqlModel.unions));
        generateLinksForUnions(unions);
    }
    if (graphqlModel.interfaces) {
        const interfaces: Map<string, InterfaceComponent> = new Map(Object.entries(graphqlModel.interfaces));
        generateLinksForInterfaces(interfaces);
    }
    if (graphqlModel.records) {
        const records: Map<string, RecordComponent> = new Map(Object.entries(graphqlModel.records));
        generateLinksForRecords(records);
    }
    if (graphqlModel.serviceClasses) {
        const serviceClasses: Map<string, ServiceClassComponent> = new Map(Object.entries(graphqlModel.serviceClasses));
        generateLinksForServiceClasses(serviceClasses);
    }
    if (graphqlModel.hierarchicalResources) {
        const hierarchicalResources: Map<string, HierarchicalResourceComponent> = new Map(Object.entries(graphqlModel.hierarchicalResources));
        generateLinksForHierarchicalResources(hierarchicalResources);
    }
}

function generateLinksForGraphqlService(service: Service) {
    const sourceNode: GraphqlDesignNode = diagramNodes.get(service.serviceName);
    if (service.resourceFunctions) {
        service.resourceFunctions.forEach(resource => {
            mapFunctionInteraction(sourceNode, resource, FunctionType.QUERY);
        });
    }
    if (service.remoteFunctions) {
        service.remoteFunctions.forEach(remote => {
            mapFunctionInteraction(sourceNode, remote, FunctionType.MUTATION);
        });
    }
}

function generateLinksForUnions(unions: Map<string, UnionComponent>) {
    unions.forEach(union => {
        union.possibleTypes.forEach(interaction => {
            if (diagramNodes.has(interaction.componentName)) {
                const targetNode: GraphqlDesignNode = diagramNodes.get(interaction.componentName);
                if (targetNode) {
                    const sourceNode: GraphqlDesignNode = diagramNodes.get(union.name);
                    const link: GraphqlBaseLinkModel = setPossibleTypeLinks(sourceNode, targetNode, interaction);
                    nodeLinks.push(link);
                }
            }
        })
    })
}

function generateLinksForInterfaces(interfaces: Map<string, InterfaceComponent>) {
    interfaces.forEach(interfaceObj => {
        interfaceObj.possibleTypes.forEach(interaction => {
            if (diagramNodes.has(interaction.componentName)) {
                const targetNode: GraphqlDesignNode = diagramNodes.get(interaction.componentName);
                if (targetNode) {
                    const sourceNode: GraphqlDesignNode = diagramNodes.get(interfaceObj.name);
                    const link: GraphqlBaseLinkModel = setPossibleTypeLinks(sourceNode, targetNode, interaction);
                    nodeLinks.push(link);
                }
            }
        })
    })
}

function generateLinksForRecords(records: Map<string, RecordComponent>) {
    records.forEach(record => {
        if (!record.isInputObject) {
            record.recordFields.forEach(field => {
                field.interactions.forEach(interaction => {
                    if (diagramNodes.has(interaction.componentName)) {
                        const targetNode: GraphqlDesignNode = diagramNodes.get(interaction.componentName);
                        if (targetNode) {
                            const sourceNode: GraphqlDesignNode = diagramNodes.get(record.name);
                            const sourcePortId = field.name;
                            const link: GraphqlBaseLinkModel = setInteractionLinks(sourceNode, sourcePortId, targetNode, interaction);
                            nodeLinks.push(link);
                        }
                    }
                })
            })
        }
    })
}

function generateLinksForServiceClasses(serviceClasses: Map<string, ServiceClassComponent>) {
    serviceClasses.forEach(serviceClass => {
        serviceClass.functions.forEach(func => {
            func.interactions.forEach(interaction => {
                if (diagramNodes.has(interaction.componentName)) {
                    const targetNode: GraphqlDesignNode = diagramNodes.get(interaction.componentName);
                    if (targetNode) {
                        const sourceNode: GraphqlDesignNode = diagramNodes.get(serviceClass.serviceName);
                        const sourcePortId = func.identifier;
                        const link: GraphqlBaseLinkModel = setInteractionLinks(sourceNode, sourcePortId, targetNode, interaction);
                        nodeLinks.push(link);
                    }
                }
            })
        })
    })
}

function generateLinksForHierarchicalResources(hierarchicalResources: Map<string, HierarchicalResourceComponent>) {
    hierarchicalResources.forEach(resource => {
        resource.hierarchicalResources.forEach(hierrarchicalResource => {
            hierrarchicalResource.interactions.forEach(interaction => {
                if (diagramNodes.has(interaction.componentName)) {
                    const targetNode: GraphqlDesignNode = diagramNodes.get(interaction.componentName);
                    if (targetNode) {
                        const sourceNode: GraphqlDesignNode = diagramNodes.get(resource.name);
                        const sourcePortId = hierrarchicalResource.identifier;
                        const link: GraphqlBaseLinkModel = setInteractionLinks(sourceNode, sourcePortId, targetNode, interaction);
                        nodeLinks.push(link);
                    }
                }
            })
        })
    })
}

function setInteractionLinks(sourceNode: GraphqlDesignNode, sourcePortId: string, targetNode: GraphqlDesignNode, interaction: Interaction) {
    const sourcePort = sourceNode.getPortFromID(`right-${sourcePortId}`);
    const targetPort = targetNode.getPortFromID(`left-${interaction.componentName}`);
    if (sourcePort && targetPort) {
        const link: DefaultLinkModel = new DefaultLinkModel();
        return createLink(sourcePort, targetPort, link);
    }
}

function setPossibleTypeLinks(sourceNode: GraphqlDesignNode, targetNode: GraphqlDesignNode, interaction: Interaction) {
    const unionComponent = interaction.componentName;
    const sourcePort = sourceNode.getPortFromID(`right-${unionComponent}`);
    const targetPort = targetNode.getPortFromID(`left-${unionComponent}`);
    if (sourcePort && targetPort) {
        const link: DefaultLinkModel = new DefaultLinkModel();
        return createLink(sourcePort, targetPort, link);
    }
}

function mapFunctionInteraction(sourceNode: GraphqlDesignNode, func: ResourceFunction | RemoteFunction, functionType: FunctionType) {
    func.interactions.forEach(interaction => {
        if (diagramNodes.has(interaction.componentName)) {
            const targetNode: GraphqlDesignNode = diagramNodes.get(interaction.componentName);
            if (targetNode) {
                const link: GraphqlBaseLinkModel = setGraphqlServiceLinks(sourceNode, targetNode, func, functionType, interaction);
                nodeLinks.push(link);
            }
        }
    });
}

function setGraphqlServiceLinks(sourceNode: GraphqlDesignNode, targetNode: GraphqlDesignNode,
                                func: ResourceFunction | RemoteFunction, functionType: FunctionType, interaction?: Interaction) {
    let sourcePort: GraphqlNodeBasePort;
    let targetPort: GraphqlNodeBasePort;

    const compName = interaction.componentName;
    const sourcePortID = func.identifier;

    sourcePort = sourceNode.getPortFromID(`right-${sourcePortID}`);
    targetPort = targetNode.getPortFromID(`left-${compName}`);
    if (sourcePort && targetPort) {
        const link: GraphqlServiceLinkModel = new GraphqlServiceLinkModel(functionType);
        return createLink(sourcePort, targetPort, link);
    }
}

function createLink(sourcePort: GraphqlNodeBasePort, targetPort: GraphqlNodeBasePort, link: GraphqlBaseLinkModel) {
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}
