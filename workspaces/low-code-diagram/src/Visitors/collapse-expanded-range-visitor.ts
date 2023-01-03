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

import { COLLAPSE_SVG_HEIGHT } from "../Components/RenderingComponents/ForEach/ColapseButtonSVG";
import { BlockViewState, CollapseViewState, StatementViewState } from "../ViewState";

import { DefaultConfig } from "./default";
import { isPositionWithinRange } from "./util";

export class CollapseExpandedRangeVisitor implements Visitor {
    private expandRange: NodePosition;

    constructor(expandRange: NodePosition) {
        this.expandRange = expandRange;
    }

    beginVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode): void {
        const blockViewState: BlockViewState = node.viewState as BlockViewState;

        if (blockViewState.hasWorkerDecl) {
            this.collapseMatchingRange(blockViewState.collapsedViewStates, node.namedWorkerDeclarator.workerInitStatements);
        }

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
        const blockVS: BlockViewState = node.viewState as BlockViewState;
        const collapsedViewStates: CollapseViewState[] = blockVS.collapsedViewStates;
        const statements: STNode[] = node.statements;

        this.collapseMatchingRange(collapsedViewStates, statements);
    }

    private collapseMatchingRange(collapsedViewStates: CollapseViewState[], statements: STNode[]) {
        collapsedViewStates.forEach(collapsedVS => {
            if (isPositionWithinRange(collapsedVS.range, this.expandRange)) {
                collapsedVS.collapsed = true;
                collapsedVS.bBox.h = COLLAPSE_SVG_HEIGHT;
            }
        });

        statements.forEach(statement => {
            const stmtVS: StatementViewState = statement.viewState as StatementViewState;
            if (isPositionWithinRange(statement.position, this.expandRange)) {
                stmtVS.collapsed = true;
                stmtVS.bBox.offsetFromTop = DefaultConfig.interactionModeOffset;
                stmtVS.bBox.offsetFromBottom = DefaultConfig.interactionModeOffset;
            }
        });
    }
}
