import { DiagramModel } from "@projectstorm/react-diagrams";

import { GraphqlBaseLinkModel } from "../../Link/BaseLink/GraphqlBaseLinkModel";
import { GraphqlServiceLinkModel } from "../../Link/GraphqlServiceLink/GraphqlServiceLinkModel";
import { GraphqlDesignNode } from "../../Nodes/BaseNode/GraphqlDesignNode";
import { EnumNodeModel } from "../../Nodes/EnumNode/EnumNodeModel";
import { GraphqlServiceNodeModel } from "../../Nodes/GraphqlServiceNode/GraphqlServiceNodeModel";
import { GraphqlNodeBasePort } from "../../Port/GraphqlNodeBasePort";
import {
    EnumComponent,
    FunctionType,
    GraphqlDesignModel,
    Interaction,
    RemoteFunction,
    ResourceFunction,
    Service
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
    // TODO: generate nodes for records/ service-classes/ unions

    // generated linked nodes - service/records/enums
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
