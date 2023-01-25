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
import { GraphqlServiceLinkModel } from "../../Link/GraphqlServiceLink/GraphqlServiceLinkModel";
import { GraphqlDesignNode } from "../../Nodes/BaseNode/GraphqlDesignNode";
import { EnumNodeModel } from "../../Nodes/EnumNode/EnumNodeModel";
import { GraphqlServiceNodeModel } from "../../Nodes/GraphqlServiceNode/GraphqlServiceNodeModel";
import { RecordNodeModel } from "../../Nodes/RecordNode/RecordNodeModel";
import { ServiceClassNodeModel } from "../../Nodes/ServiceClassNode/ServiceClassNodeModel";
import { UnionNodeModel } from "../../Nodes/UnionNode/UnionNodeModel";
import { GraphqlNodeBasePort } from "../../Port/GraphqlNodeBasePort";
import {
    EnumComponent,
    FunctionType,
    GraphqlDesignModel,
    Interaction, RecordComponent,
    RemoteFunction,
    ResourceFunction,
    Service, ServiceClassComponent, UnionComponent
} from "../../resources/model";


// all nodes in the diagram
let diagramNodes: Map<string, GraphqlDesignNode>;
// all links in the diagram
let nodeLinks: GraphqlBaseLinkModel[];

export function graphqlModelGenerator(graphqlModel: GraphqlDesignModel) : DiagramModel {
    diagramNodes = new Map<string, GraphqlDesignNode>();
    nodeLinks = [];

    // generate the graphql service node
    graphqlServiceModelMapper(graphqlModel.graphqlService);
    // generate nodes for enums
    if (graphqlModel.enums){
        const enums : Map<string, EnumComponent> = new Map(Object.entries(graphqlModel.enums));
        enumModelMapper(enums);
    }
    if (graphqlModel.records){
        const records: Map<string, RecordComponent> = new Map(Object.entries(graphqlModel.records));
        recordModelMapper(records);
    }
    if (graphqlModel.serviceClasses){
        const serviceClasses : Map<string, ServiceClassComponent> = new Map(Object.entries(graphqlModel.serviceClasses));
        serviceClassModelMapper(serviceClasses);
    }
    if (graphqlModel.unions){
        const unions : Map<string, UnionComponent> = new Map(Object.entries(graphqlModel.unions));
        unionModelMapper(unions);
    }
    // TODO: generate nodes for service-classes/ unions

    // TODO:  generate secondary links for - service/records/enums/unions
    generateLinks(graphqlModel);


    const model = new DiagramModel();
    model.addAll(...Array.from(diagramNodes.values()), ...nodeLinks);
    return model;
}

function graphqlServiceModelMapper(service: Service) {
        const serviceNode: GraphqlServiceNodeModel = new GraphqlServiceNodeModel(service);
        diagramNodes.set(service.serviceName, serviceNode);
}

function enumModelMapper(enums: Map<string, EnumComponent>) {
    enums.forEach((enumObj, key) => {
        const enumNode = new EnumNodeModel(enumObj);
        diagramNodes.set(key, enumNode);
    })
}

function recordModelMapper(records: Map<string, RecordComponent>) {
    records.forEach((recordObj, key) => {
        const recordNode = new RecordNodeModel(recordObj);
        diagramNodes.set(key, recordNode);
    })
}

function serviceClassModelMapper(classes: Map<string, ServiceClassComponent>) {
    classes.forEach((classObj, key) => {
        const serviceClass = new ServiceClassNodeModel(classObj);
        diagramNodes.set(key, serviceClass);
    })
}

function unionModelMapper(unions: Map<string, UnionComponent>) {
    unions.forEach((unionObj, key) => {
        const unionType = new UnionNodeModel(unionObj);
        diagramNodes.set(key, unionType);
    })
}

function generateLinks(graphqlModel: GraphqlDesignModel){
    // create links for graphqlService
    generateLinksForGraphqlService(graphqlModel.graphqlService);

    // TODO: create links for records, service-class

}

function generateLinksForGraphqlService(service: Service) {
    const sourceNode: GraphqlDesignNode = diagramNodes.get(service.serviceName);
    if (service.resourceFunctions){
        service.resourceFunctions.forEach(resource => {
            mapFunctionInteraction(sourceNode, resource, FunctionType.QUERY);
        })
    }
    if (service.remoteFunctions){
        service.remoteFunctions.forEach(remote => {
            mapFunctionInteraction(sourceNode, remote, FunctionType.MUTATION);
        })
    }
}

function mapFunctionInteraction(sourceNode: GraphqlDesignNode, func : ResourceFunction | RemoteFunction, functionType: FunctionType) {
    func.interactions.forEach(interaction => {
        if (diagramNodes.has(interaction.componentName)) {
            const targetNode: GraphqlDesignNode = diagramNodes.get(interaction.componentName);
            if (targetNode){
                const link : GraphqlBaseLinkModel = setGraphqlServiceLinks(sourceNode, targetNode, func, functionType, interaction);
                nodeLinks.push(link);
            }
        }
    })
}

function setGraphqlServiceLinks(sourceNode: GraphqlDesignNode, targetNode: GraphqlDesignNode,
                                func: ResourceFunction | RemoteFunction, functionType: FunctionType, interaction?: Interaction){
    let sourcePort: GraphqlNodeBasePort;
    let targetPort: GraphqlNodeBasePort;

    const compName = interaction.componentName;
    const sourcePortID = func.identifier;

    sourcePort = sourceNode.getPortFromID(`right-${sourcePortID}`);
    targetPort =  targetNode.getPortFromID(`left-${compName}`);
    if (sourcePort && targetPort) {
        const link : GraphqlServiceLinkModel = new GraphqlServiceLinkModel(functionType);
        return createLink(sourcePort, targetPort, link);
    }
}

function createLink(sourcePort: GraphqlNodeBasePort, targetPort: GraphqlNodeBasePort, link : GraphqlBaseLinkModel){
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}
