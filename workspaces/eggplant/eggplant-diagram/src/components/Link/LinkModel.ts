import { DefaultLinkModel } from "@projectstorm/react-diagrams-defaults";
import { AdvanceLinkModel } from "./AdvanceLinkModel";

interface LinkOrigins {
    nodeId: string;
}

export class WorkerLinkModel extends AdvanceLinkModel {
    sourceNode: LinkOrigins;
    targetNode: LinkOrigins;
    id: string;

    constructor(id: string) {
        super(id, "link");
    }

    setId(id: string) {
        this.id = id;
    }

    setSourceNode(nodeId: string) {
        this.sourceNode = { nodeId };
    }

    setTargetNode(nodeId: string) {
        this.targetNode = { nodeId };
    }
}