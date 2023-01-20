import { PortModelAlignment } from "@projectstorm/react-diagrams";

import { GraphqlNodeBasePort } from "../../Port/GraphqlNodeBasePort";
import { EnumComponent } from "../../resources/model";
import { GraphqlDesignNode } from "../BaseNode/GraphqlDesignNode";

export const ENUM_NODE = "enumNode";
export class EnumNodeModel extends GraphqlDesignNode {
    readonly enumObject : EnumComponent;

    constructor(enumObject: EnumComponent) {
        super(ENUM_NODE, enumObject.name);
        this.enumObject = enumObject;

        this.addPort(new GraphqlNodeBasePort(this.enumObject.name, PortModelAlignment.LEFT));
        this.addPort(new GraphqlNodeBasePort(this.enumObject.name, PortModelAlignment.RIGHT));
        this.addPort(new GraphqlNodeBasePort(this.enumObject.name, PortModelAlignment.TOP));

        // no ports added for enum fields as the type of the enum fields will be primitive types without links
    }
}
