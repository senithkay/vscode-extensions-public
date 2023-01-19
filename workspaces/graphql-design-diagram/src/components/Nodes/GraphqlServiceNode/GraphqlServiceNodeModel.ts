import { NodeModel, NodeModelGenerics, PortModelAlignment } from "@projectstorm/react-diagrams";

import { GraphqlNodeBasePort } from "../../Port/GraphqlNodeBasePort";
import { Service } from "../../resources/model";
import { GraphqlDesignNode } from "../BaseNode/GraphqlDesignNode";

export const GRAPHQL_SERVICE_NODE = "graphqlServiceNode";

export class GraphqlServiceNodeModel extends GraphqlDesignNode {
    readonly serviceObject: Service;


    // TODO:
    //  check for empty service names
    constructor(serviceObject: Service) {
        super(GRAPHQL_SERVICE_NODE, serviceObject.serviceName);
        this.serviceObject = serviceObject;

        this.addPort(new GraphqlNodeBasePort(this.serviceObject.serviceName, PortModelAlignment.LEFT));
        this.addPort(new GraphqlNodeBasePort(this.serviceObject.serviceName, PortModelAlignment.RIGHT));
        this.addPort(new GraphqlNodeBasePort(this.serviceObject.serviceName, PortModelAlignment.TOP));

        this.serviceObject.resourceFunctions.forEach(resource => {
            this.addPort(new GraphqlNodeBasePort(resource.identifier, PortModelAlignment.LEFT));
            this.addPort(new GraphqlNodeBasePort(resource.identifier, PortModelAlignment.RIGHT));
        });
        if (this.serviceObject.remoteFunctions){
            this.serviceObject.remoteFunctions.forEach(remoteFunc => {
                this.addPort(new GraphqlNodeBasePort(remoteFunc.identifier, PortModelAlignment.LEFT));
                this.addPort(new GraphqlNodeBasePort(remoteFunc.identifier, PortModelAlignment.RIGHT));
            })
        }
    }
}
