import { NodeModel, NodeModelGenerics } from "@projectstorm/react-diagrams";

export class GraphqlDesignNode extends NodeModel<NodeModelGenerics> {
    constructor(type: string, id: string) {
        super({
            type,
            id
        });
    }
}
