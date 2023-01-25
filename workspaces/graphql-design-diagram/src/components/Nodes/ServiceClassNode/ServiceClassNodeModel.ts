import { PortModelAlignment } from "@projectstorm/react-diagrams";

import { GraphqlNodeBasePort } from "../../Port/GraphqlNodeBasePort";
import { ServiceClassComponent } from "../../resources/model";
import { GraphqlDesignNode } from "../BaseNode/GraphqlDesignNode";

export const SERVICE_CLASS_NODE = "serviceClassNode";

export class ServiceClassNodeModel extends GraphqlDesignNode {
    readonly classObject: ServiceClassComponent;


    constructor(classObject: ServiceClassComponent) {
        super(SERVICE_CLASS_NODE, classObject.serviceName);
        this.classObject = classObject;

        this.addPort(new GraphqlNodeBasePort(this.classObject.serviceName, PortModelAlignment.LEFT));
        this.addPort(new GraphqlNodeBasePort(this.classObject.serviceName, PortModelAlignment.RIGHT));
        this.addPort(new GraphqlNodeBasePort(this.classObject.serviceName, PortModelAlignment.TOP));

        this.classObject.functions?.forEach(classFunction => {
            this.addPort(new GraphqlNodeBasePort(classFunction.identifier, PortModelAlignment.LEFT));
            this.addPort(new GraphqlNodeBasePort(classFunction.identifier, PortModelAlignment.RIGHT));
        })
    }
}
