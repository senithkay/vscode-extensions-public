import { NodePosition, STKindChecker, STNode, Visitor } from "@wso2-enterprise/syntax-tree";

export class STNodeFindingVisitor implements Visitor {
    private position: NodePosition;
    private stNode: STNode;

    public beginVisitSTNode(node: STNode, parent?: STNode) {
        if (!this.stNode) {
            const isPositionsEquals = node.position?.startLine === this.position?.startLine &&
                node.position?.startColumn === this.position?.startColumn &&
                node.position?.endLine === this.position?.endLine &&
                node.position?.endColumn === this.position?.endColumn
            if (isPositionsEquals) {
                this.stNode = node;
            }
        }
    }

    getSTNode(): STNode {
        const newModel = this.stNode;
        this.stNode = undefined;
        return newModel;
    }

    setPosition(position: NodePosition) {
        this.position = position;
    }
}

export const visitor = new STNodeFindingVisitor();
