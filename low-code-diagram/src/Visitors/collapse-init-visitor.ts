import {
    BlockStatement, FunctionBodyBlock, IfElseStatement, NodePosition, STKindChecker, STNode, Visitor
} from "@wso2-enterprise/syntax-tree";

import { StatementViewState } from "../ViewState";

export class CollapseInitVisitor implements Visitor {
    private position: NodePosition;
    constructor(position: NodePosition) {
        this.position = position;
    }

    beginVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode): void {
        this.beginVisitBlock(node);
    }

    beginVisitIfElseStatement(node: IfElseStatement, parent?: STNode) {
        this.beginVisitBlock(node.ifBody);
        if (node.elseBody && STKindChecker.isElseBlock(node.elseBody)
            && STKindChecker.isBlockStatement(node.elseBody.elseBody)) {
            this.beginVisitBlock(node.elseBody.elseBody)
        }
    }

    beginVisitBlockStatement(node: BlockStatement): void {
        this.beginVisitBlock(node);
    }

    beginVisitBlock(node: BlockStatement) {
        node.statements.forEach(statement => {
            const viewState = statement.viewState as StatementViewState;
            if (this.isNodeWithinPosition(statement) && !(viewState.isAction || viewState.isEndpoint)) {
                console.log('satisfied condition >>>', statement)
                viewState.collapsed = true;
            }
        })
    }

    private isNodeWithinPosition(node: STNode): boolean {
        const nodePosition: NodePosition = node.position as NodePosition;
        if (nodePosition.startLine > this.position.startLine
            && nodePosition.endLine < this.position.endLine) {
            return true;
        }

        // todo: handle other scenarios 
        return false;
    }
}
