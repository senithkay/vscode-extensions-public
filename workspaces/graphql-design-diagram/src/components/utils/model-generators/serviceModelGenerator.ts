import { DiagramModel } from "@projectstorm/react-diagrams";

import { GraphqlServiceLinkModel } from "../../Link/GraphqlServiceLink/GraphqlServiceLinkModel";
import { GraphqlDesignNode } from "../../Nodes/BaseNode/GraphqlDesignNode";
import { GraphqlServiceNodeModel } from "../../Nodes/GraphqlServiceNode/GraphqlServiceNodeModel";
import { GraphqlNodeBasePort } from "../../Port/GraphqlNodeBasePort";
import {
    FunctionType,
    GraphqlDesignModel,
    Interaction,
    RemoteFunction,
    ResourceFunction,
    Service
} from "../../resources/model";

let serviceNode : GraphqlServiceNodeModel;
let serviceLinks: GraphqlServiceLinkModel[];
let diagramNodes: Map<string, GraphqlDesignNode>;

export function graphqlModelGenerator(graphqlModel: GraphqlDesignModel) : DiagramModel {
    diagramNodes = new Map<string, GraphqlDesignNode>();
    // generate the graphql service node
    graphqlServiceModelMapper(graphqlModel.graphqlService);
    // if (graphqlModel.graphqlService) {
    //     graphqlServiceModelMapper(graphqlModel.graphqlService);
    // }
    // generate nodes for enums, records, services

    // generated linked nodes - service/records/enums
    generateLinks(graphqlModel);


    const model = new DiagramModel();
    model.addAll(...Array.from(diagramNodes.values()), ...serviceLinks);
    return model;
}

function graphqlServiceModelMapper(service: Service) {
        serviceNode = new GraphqlServiceNodeModel(service);
        diagramNodes.set(service.serviceName, serviceNode);
}

function generateLinks(graphqlModel: GraphqlDesignModel){
    // TODO : add impl
    serviceLinks = [];

    graphqlModel.graphqlService.resourceFunctions.forEach(resource => {
        mapFunctionInteraction(resource);
    });

}

function mapFunctionInteraction(func : ResourceFunction | RemoteFunction) {
    func.interactions.forEach(interaction => {
        if (diagramNodes.has(interaction.componentName)) {
            const targetNode: GraphqlDesignNode = diagramNodes.get(interaction.componentName);
            if (targetNode){
                const link : GraphqlServiceLinkModel = setLinks(serviceNode, targetNode, func, interaction);
                serviceLinks.push(link);
            }
        }
    })
}

function setLinks(sourceNode: GraphqlDesignNode, targetNode: GraphqlDesignNode, func: ResourceFunction | RemoteFunction, interaction?: Interaction){
    let sourcePort: GraphqlNodeBasePort;
    let targetPort: GraphqlNodeBasePort;
    const compName = interaction.componentName;

    const sourcePortID = func.identifier;
    sourcePort = sourceNode.getPortFromID(sourcePortID);
    targetPort =  targetNode.getPortFromID(`left-${compName}`);
    if (sourcePort && targetPort) {
        const link : GraphqlServiceLinkModel = new GraphqlServiceLinkModel(FunctionType.QUERY);
        return createLink(sourcePort, targetPort, link);
    }


}

function createLink(sourcePort: GraphqlNodeBasePort, targetPort: GraphqlNodeBasePort, link : GraphqlServiceLinkModel){
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}
