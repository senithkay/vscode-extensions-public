/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import {
    BlockStatement, ElseBlock, ForeachStatement, FunctionBodyBlock, FunctionDefinition, IfElseStatement, NamedWorkerDeclaration, NodePosition, STKindChecker, STNode, Visitor, WhileStatement
} from "@wso2-enterprise/syntax-tree";

import { BlockViewState, CollapseViewState, FunctionViewState, IfViewState, StatementViewState, ViewState } from "../ViewState";
import { WorkerDeclarationViewState } from "../ViewState/worker-declaration";

import { DefaultConfig } from "./default";
import { isPositionWithinRange } from "./util";

export class CollapseInitVisitor implements Visitor {
    private position: NodePosition;
    constructor(position: NodePosition) {
        this.position = position;
    }

    beginVisitFunctionDefinition(node: FunctionDefinition): void {
        const viewState: FunctionViewState = node.viewState as FunctionViewState;
        const trigger = viewState.trigger;
        const end = viewState?.end?.bBox;

        trigger.offsetFromBottom = DefaultConfig.interactionModeOffset;
        trigger.offsetFromTop = DefaultConfig.interactionModeOffset;
        end.offsetFromBottom = DefaultConfig.interactionModeOffset;
        end.offsetFromTop = DefaultConfig.interactionModeOffset;
    }

    beginVisitNamedWorkerDeclaration(node: NamedWorkerDeclaration, parent?: STNode): void {
        const viewState: WorkerDeclarationViewState = node.viewState as WorkerDeclarationViewState;
        const trigger = viewState.trigger;
        const end = viewState?.end?.bBox;

        trigger.offsetFromBottom = DefaultConfig.interactionModeOffset;
        trigger.offsetFromTop = DefaultConfig.interactionModeOffset;
        end.offsetFromBottom = DefaultConfig.interactionModeOffset;
        end.offsetFromTop = DefaultConfig.interactionModeOffset;
    }

    endVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode): void {
        this.endVisitBlock(node);
    }

    endVisitWhileStatement(node: WhileStatement, parent?: STNode): void {
        const whileViewstate = node.viewState as StatementViewState;
        const whileBodyBlock = node.whileBody as BlockStatement;
        const whileBodyVS = whileBodyBlock.viewState as BlockViewState;
        whileViewstate.collapsed = !whileBodyVS.containsAction;
    }

    endVisitForeachStatement(node: ForeachStatement, parent?: STNode): void {
        const foreachViewstate = node.viewState as StatementViewState;
        const foreachBodyBlock = node.blockStatement as BlockStatement;
        const foreachBodyVS = foreachBodyBlock.viewState as BlockViewState;
        foreachViewstate.collapsed = !foreachBodyVS.containsAction;
    }

    endVisitBlockStatement(node: BlockStatement, parent?: STNode): void {
        this.endVisitBlock(node);
    }

    endVisitIfElseStatement(node: IfElseStatement): void {
        const ifElseVS: ViewState = node.viewState as ViewState;
        const ifBodyBlock: BlockStatement = node.ifBody as BlockStatement;
        const ifBodyVS = ifBodyBlock.viewState as BlockViewState;
        const elseBody: ElseBlock = node.elseBody as ElseBlock;
        ifElseVS.collapsed = !ifBodyVS.containsAction;

        if (elseBody && elseBody.elseBody) {
            if (STKindChecker.isIfElseStatement(elseBody.elseBody)) {
                const elseVS = elseBody.elseBody.viewState as ViewState;
                ifElseVS.collapsed = ifElseVS.collapsed && elseVS.collapsed;
            }

            if (STKindChecker.isBlockStatement(elseBody.elseBody)) {
                const elseVS = elseBody.elseBody.viewState as BlockViewState;
                ifElseVS.collapsed = ifElseVS.collapsed && !elseVS.containsAction;
            }
        }
    }

    endVisitBlock(node: BlockStatement | FunctionBodyBlock) {
        const blockViewState = node.viewState as BlockViewState;

        if (STKindChecker.isFunctionBodyBlock(node) && node.namedWorkerDeclarator
            && node.namedWorkerDeclarator.workerInitStatements.length > 0) {
            this.populateBlockVSWithCollapseVS(node.namedWorkerDeclarator.workerInitStatements, blockViewState);
        }

        this.populateBlockVSWithCollapseVS(node.statements, blockViewState);
    }

    private populateBlockVSWithCollapseVS(statements: STNode[], blockViewState: BlockViewState) {
        if (statements.length > 0) {
            let range: NodePosition = {
                startLine: statements[0].position.startLine,
                endLine: statements[0].position.startLine,
                startColumn: statements[0].position.startColumn,
                endColumn: statements[0].position.endColumn
            };

            statements.forEach((statement, statementIndex) => {
                const statementVS = statement.viewState as StatementViewState;
                statementVS.bBox.offsetFromBottom = DefaultConfig.interactionModeOffset;
                statementVS.bBox.offsetFromTop = DefaultConfig.interactionModeOffset;
                if (isPositionWithinRange(statement.position, this.position)) {
                    if (!(statementVS.isAction || statementVS.isEndpoint || statementVS.isSend || statementVS.isReceive
                        || this.isSkippedConstruct(statement)) || statementVS.collapsed) {
                        statementVS.collapsed = true;
                        range.endLine = statement.position.endLine;
                        range.endColumn = statement.position.endColumn;
                        if (statementIndex === statements.length - 1) {
                            const collapseVS = new CollapseViewState();
                            collapseVS.range = { ...range };
                            blockViewState.collapsedViewStates.push(collapseVS);
                        }
                    } else {
                        if (!blockViewState.containsAction) {
                            blockViewState.containsAction = statementVS.isAction || statementVS.isEndpoint
                                || statementVS.isSend || statementVS.isReceive;
                        }

                        if (!(range.startLine === statement.position.startLine
                            && range.endLine === statement.position.endLine
                            && range.startColumn === statement.position.startColumn
                            && range.endColumn === statement.position.endColumn)) {

                            const collapseVS = new CollapseViewState();
                            collapseVS.range = { ...range };
                            if (statementIndex > 0) blockViewState.collapsedViewStates.push(collapseVS);
                        }

                        if (statementIndex !== statements.length - 1) {
                            range = {
                                startLine: statements[statementIndex + 1].position.startLine,
                                endLine: statements[statementIndex + 1].position.endLine,
                                startColumn: statements[statementIndex + 1].position.startColumn,
                                endColumn: statements[statementIndex + 1].position.endColumn,
                            };
                        }
                    }
                }
            });
        }
    }

    private isSkippedConstruct(node: STNode): boolean {
        return STKindChecker.isWhileStatement(node)
            || STKindChecker.isForeachStatement(node)
            || STKindChecker.isIfElseStatement(node);
    }
}
