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
    BlockStatement, ForeachStatement, FunctionBodyBlock, FunctionDefinition, IfElseStatement, NodePosition, STKindChecker, STNode, Visitor, WhileStatement
} from "@wso2-enterprise/syntax-tree";

import { BlockViewState, CollapseViewState, FunctionViewState, StatementViewState, ViewState } from "../ViewState";

import { DefaultConfig } from "./default";
import { isPositionWithinRange } from "./util";

export class CollapseInitVisitor implements Visitor {
    private position: NodePosition;
    constructor(position: NodePosition) {
        this.position = position;
    }

    beginVisitFunctionDefinition(node: FunctionDefinition) {
        const viewState: FunctionViewState = node.viewState as FunctionViewState;
        const trigger = viewState.trigger;
        const end = viewState?.end?.bBox;

        trigger.offsetFromBottom = DefaultConfig.interactionModeOffset;
        trigger.offsetFromTop = DefaultConfig.interactionModeOffset;
        end.offsetFromBottom = DefaultConfig.interactionModeOffset;
        end.offsetFromTop = DefaultConfig.interactionModeOffset;
    }

    endVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode): void {
        console.log('function body >>>', node, parent);
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
        console.log('normal body >>>', node, parent);
        this.endVisitBlock(node);
    }

    endVisitBlock(node: BlockStatement) {
        const blockViewState = node.viewState as BlockViewState;
        if (node.statements.length > 0) {
            let range: NodePosition = {
                startLine: node.statements[0].position.startLine,
                endLine: node.statements[0].position.startLine,
                startColumn: node.statements[0].position.startColumn,
                endColumn: node.statements[0].position.endColumn
            }

            node.statements.forEach((statement, statementIndex) => {
                const statementVS = statement.viewState as StatementViewState;
                statementVS.bBox.offsetFromBottom = DefaultConfig.interactionModeOffset;
                statementVS.bBox.offsetFromTop = DefaultConfig.interactionModeOffset;
                if (isPositionWithinRange(statement.position, this.position)) {
                    if (!(statementVS.isAction || statementVS.isEndpoint || this.isSkippedConstruct(statement)) || statementVS.collapsed) {
                        statementVS.collapsed = true;
                        range.endLine = statement.position.endLine;
                        range.endColumn = statement.position.endColumn;
                        if (statementIndex === node.statements.length - 1) {
                            const collapseVS = new CollapseViewState();
                            collapseVS.range = { ...range };
                            blockViewState.collapsedViewStates.push(collapseVS);
                        }
                    } else {
                        if (!blockViewState.containsAction) {
                            blockViewState.containsAction = statementVS.isAction || statementVS.isEndpoint;
                        }

                        if (!(range.startLine === statement.position.startLine
                            && range.endLine === statement.position.endLine
                            && range.startColumn === statement.position.startColumn
                            && range.endColumn === statement.position.endColumn)) {

                            const collapseVS = new CollapseViewState();
                            collapseVS.range = { ...range };
                            blockViewState.collapsedViewStates.push(collapseVS);
                        }

                        if (statementIndex !== node.statements.length - 1) {
                            range = {
                                startLine: node.statements[statementIndex + 1].position.startLine,
                                endLine: node.statements[statementIndex + 1].position.endLine,
                                startColumn: node.statements[statementIndex + 1].position.startColumn,
                                endColumn: node.statements[statementIndex + 1].position.endColumn,
                            }
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
