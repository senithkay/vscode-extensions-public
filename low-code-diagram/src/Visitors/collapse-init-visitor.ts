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
    BlockStatement, FunctionBodyBlock, IfElseStatement, NodePosition, STKindChecker, STNode, Visitor
} from "@wso2-enterprise/syntax-tree";

import { BlockViewState, CollapseViewState, StatementViewState } from "../ViewState";

import { isNodeWithinRange } from "./util";

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
                if (!this.isSkippedConstruct(statement) && isNodeWithinRange(statement.position, this.position)) {
                    if (!(statementVS.isAction || statementVS.isEndpoint)) {
                        statementVS.collapsed = true;
                        range.endLine = statement.position.endLine;
                        range.endColumn = statement.position.endColumn;
                        if (statementIndex === node.statements.length - 1) {
                            const collapseVS = new CollapseViewState();
                            collapseVS.range = { ...range };
                            blockViewState.collapsedViewStates.push(collapseVS);
                        }
                    } else {
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
        return STKindChecker.isIfElseStatement(node);
    }
}
