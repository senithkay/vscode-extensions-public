import { PortModelAlignment } from "@projectstorm/react-diagrams";
import { GraphqlNodeBasePort } from "../../Port/GraphqlNodeBasePort";
import { UnionComponent } from "../../resources/model";
import { GraphqlDesignNode } from "../BaseNode/GraphqlDesignNode";

export const UNION_NODE = "unionNode";

export class UnionNodeModel extends GraphqlDesignNode {
    readonly unionObject : UnionComponent;


    constructor(unionObject: UnionComponent) {
        super(UNION_NODE, unionObject.name);
        this.unionObject = unionObject;

        this.addPort(new GraphqlNodeBasePort(this.unionObject.name, PortModelAlignment.LEFT));
        this.addPort(new GraphqlNodeBasePort(this.unionObject.name, PortModelAlignment.RIGHT));
        this.addPort(new GraphqlNodeBasePort(this.unionObject.name, PortModelAlignment.TOP));

        this.unionObject.possibleTypes?.forEach(possibleType => {
            this.addPort(new GraphqlNodeBasePort(possibleType.componentName, PortModelAlignment.LEFT));
            this.addPort(new GraphqlNodeBasePort(possibleType.componentName, PortModelAlignment.RIGHT));
        })
    }
}
