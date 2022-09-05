import {
    BlockStatement, ForeachStatement, FunctionBodyBlock, IfElseStatement, STKindChecker, STNode, Visitor, WhileStatement
} from "@wso2-enterprise/syntax-tree";

import { BlockViewState, StatementViewState } from "../ViewState";

export class CollapseInitVisitor implements Visitor {

    beginVisitFunctionBodyBlock(node: FunctionBodyBlock): void {
        this.visitBlock(node);
    }

    beginVisitIfElseStatement(node: IfElseStatement): void {
        this.visitBlock(node.ifBody);
        if (node.elseBody && STKindChecker.isBlockStatement(node.elseBody.elseBody)) {
            this.visitBlock(node.elseBody.elseBody);
        }
    }

    beginVisitForeachStatement(node: ForeachStatement): void {
        this.visitBlock(node.blockStatement);
    }

    beginVisitWhileStatement(node: WhileStatement): void {
        this.visitBlock(node.whileBody);
    }

    beginVisitBlockStatement(node: BlockStatement) {
        this.visitBlock(node);
    }

    private visitBlock(node: BlockStatement) {
        const viewState = node.viewState as BlockViewState;
        // const collapseRanges =
        node.statements.forEach((statement: STNode) => {
            if (!(STKindChecker.isIfElseStatement(statement)
                || STKindChecker.isForeachStatement(statement)
                || STKindChecker.isWhileStatement(statement))) {
                const statementVS = statement.viewState as StatementViewState;

                if (!statementVS.isAction || !statementVS.isEndpoint) {
                    statementVS.collapsed = true;
                }
            }
        })
    };
}
