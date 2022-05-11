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

import { BlockStatement, FunctionBodyBlock, FunctionDefinition, IfElseStatement, NamedWorkerDeclaration, STKindChecker, STNode, traversNode, Visitor } from "@wso2-enterprise/syntax-tree";
import { IFELSE_SVG_HEIGHT, IFELSE_SVG_HEIGHT_WITH_SHADOW } from "../Components/RenderingComponents/IfElse/IfElseSVG";

import { BlockViewState, EndViewState, FunctionViewState, IfViewState, StatementViewState, ViewState } from "../ViewState";
import { WorkerDeclarationViewState } from "../ViewState/worker-declaration";

import { DefaultConfig } from "./default";
import { ConflictRestrictSpace, DEFAULT_WORKER_NAME, SendRecievePairInfo, SizingVisitor } from "./sizing-visitor";

export class ConflictResolutionVisitor implements Visitor {
    private matchedPairInfo: SendRecievePairInfo[];
    private workerNames: string[];
    private hasConflict: boolean;
    private endPointPositions: ConflictRestrictSpace[];
    private workerCount: number;
    private evaluatingIf: boolean;

    constructor(matchedPairInfo: SendRecievePairInfo[], workerCount: number) {
        this.matchedPairInfo = matchedPairInfo;
        this.workerNames = [];
        this.hasConflict = false;
        this.workerCount = workerCount;
        this.endPointPositions = [];
        this.evaluatingIf = false;
    }

    public conflictFound() {
        return this.hasConflict;
    }

    public resetConflictStatus() {
        this.hasConflict = false;
        this.endPointPositions = [];
    }

    beginVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode): void {
        this.workerNames.push(DEFAULT_WORKER_NAME);
        this.visitBlockStatement(node, parent);
    }

    endVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode): void {
        this.workerNames = [];
    }

    beginVisitNamedWorkerDeclaration(node: NamedWorkerDeclaration, parent?: STNode): void {
        this.workerNames.push(node.workerName.value);
        this.visitBlockStatement(node.workerBody, node);
    }

    // beginVisitBlockStatement(node: BlockStatement, parent?: STNode): void {
    // }

    private visitBlockStatement(node: BlockStatement, parent?: STNode, height: number = 0) {
        const blockViewState: BlockViewState = node.viewState as BlockViewState;
        node.statements.forEach((statementNode, statementIndex) => {
            const statementViewState: StatementViewState = statementNode.viewState as StatementViewState;
            if (STKindChecker.isIfElseStatement(statementNode)) {
                const ifViewState: IfViewState = statementNode.viewState as IfViewState;
                const ifStatementStartHeight = height + ifViewState.bBox.offsetFromTop + IFELSE_SVG_HEIGHT + DefaultConfig.offSet;
                this.fixIfElseStatementConflicts(statementNode, ifStatementStartHeight);
            }
            let updatedAsConflict = false;
            const statementBoxStartHeight = height + statementViewState.bBox.offsetFromTop;
            const statementBoxEndHeight = statementBoxStartHeight + statementViewState.bBox.h;

            if (!this.hasConflict) {
                updatedAsConflict = this.fixIfConflictWithEndPoint(statementBoxStartHeight, statementBoxEndHeight,
                    statementViewState, statementIndex);
                if (!this.hasConflict) {
                    updatedAsConflict = this.fixIfConflictsWithMessage(statementBoxStartHeight, statementBoxEndHeight,
                        statementViewState, statementIndex);
                }
            }

            if (!updatedAsConflict) {
                let relatedPairInfo;
                let linkedViewState;

                if (statementViewState.isSend) {
                    relatedPairInfo = this.matchedPairInfo.find(pairInfo =>
                        pairInfo.sourceIndex === statementIndex
                        && pairInfo.sourceName === this.workerNames[this.workerNames.length - 1]);

                    linkedViewState = relatedPairInfo.targetViewState as StatementViewState;
                }

                if (statementViewState.isReceive) {
                    relatedPairInfo = this.matchedPairInfo.find(pairInfo =>
                        pairInfo.targetIndex === statementIndex
                        && pairInfo.targetName === this.workerNames[this.workerNames.length - 1]);

                    linkedViewState = relatedPairInfo.sourceViewState as StatementViewState;
                }

                if (relatedPairInfo && linkedViewState) {
                    if (height + statementViewState.bBox.offsetFromTop > relatedPairInfo.pairHeight) {
                        const newOffset = (height + statementViewState.bBox.offsetFromTop) - relatedPairInfo.pairHeight;

                        linkedViewState.bBox.offsetFromTop += newOffset;
                        relatedPairInfo.pairHeight += newOffset;
                        relatedPairInfo.restrictedSpace.y1 += newOffset;
                        relatedPairInfo.restrictedSpace.y2 += newOffset;
                    }
                }
            }

            if (statementViewState.isEndpoint || statementViewState.isAction) {
                this.endPointPositions.push({
                    x1: this.workerNames.length - 1,
                    x2: this.workerCount + 1,
                    y1: height + statementViewState.bBox.offsetFromTop,
                    y2: height + statementViewState.bBox.offsetFromTop + statementViewState.bBox.h
                })
            }

            height += statementViewState.getHeight();
        });

        if (parent
            && (STKindChecker.isFunctionDefinition(parent) || STKindChecker.isNamedWorkerDeclaration(parent))
            && !blockViewState.isEndComponentAvailable) {
            const parentViewState = parent.viewState as FunctionViewState | WorkerDeclarationViewState;
            const endViewState = parentViewState.end as EndViewState;
            if (endViewState) {
                const endBlockStartHeight = height + endViewState.bBox.offsetFromTop;
                const endBlockEndHeight = endBlockStartHeight + endViewState.bBox.h;
                if (!this.hasConflict) {
                    this.fixIfConflictWithEndPoint(endBlockStartHeight, endBlockEndHeight,
                        endViewState as StatementViewState, node.statements.length);

                    if (!this.hasConflict) {
                        this.fixIfConflictsWithMessage(endBlockStartHeight, endBlockEndHeight,
                            endViewState as StatementViewState, node.statements.length);
                    }
                }
            }
        }
    }

    private fixIfElseStatementConflicts(node: IfElseStatement, height: number) {
        this.visitBlockStatement(node.ifBody, undefined, height);
        if (node.elseBody) {
            this.evaluatingIf = true;
        }
        if (node.elseBody && STKindChecker.isElseBlock(node.elseBody) && STKindChecker.isIfElseStatement(node.elseBody.elseBody)) {
            this.fixIfElseStatementConflicts(node.elseBody.elseBody, height);
        } else if (node.elseBody && STKindChecker.isElseBlock(node.elseBody) && STKindChecker.isBlockStatement(node.elseBody.elseBody)) {
            this.visitBlockStatement(node.elseBody.elseBody, undefined, height)
            this.evaluatingIf = false;
            traversNode(node, new SizingVisitor());
        }
    }

    private fixIfConflictsWithMessage(boxStartHeight: number, boxEndHeight: number, viewState: StatementViewState, statementIndex: number): boolean {
        let updatedAsConflict: boolean = false;

        this.matchedPairInfo.forEach(matchedPair => {
            const restrictedSpaceCoords = matchedPair.restrictedSpace;

            if (((boxStartHeight >= restrictedSpaceCoords.y1 && boxStartHeight <= restrictedSpaceCoords.y2)
                || (boxEndHeight >= restrictedSpaceCoords.y1 && boxEndHeight <= restrictedSpaceCoords.y2))
                && ((this.workerNames.length - 1 > restrictedSpaceCoords.x1
                    && this.workerNames.length - 1 < restrictedSpaceCoords.x2) || this.evaluatingIf)) {
                this.hasConflict = true;
                updatedAsConflict = true;
                const newOffset = (restrictedSpaceCoords.y2 - boxStartHeight) + DefaultConfig.offSet * 2;

                viewState.bBox.offsetFromTop += newOffset;

                let relatedPairInfo: SendRecievePairInfo;
                let linkedViewState: StatementViewState;
                if (viewState.isSend) {
                    relatedPairInfo = this.matchedPairInfo.find(pairInfo =>
                        pairInfo.sourceIndex === statementIndex
                        && pairInfo.sourceName === this.workerNames[this.workerNames.length - 1]);

                    linkedViewState = relatedPairInfo.targetViewState as StatementViewState;
                }

                if (viewState.isReceive) {
                    relatedPairInfo = this.matchedPairInfo.find(pairInfo =>
                        pairInfo.targetIndex === statementIndex
                        && pairInfo.targetName === this.workerNames[this.workerNames.length - 1]);

                    linkedViewState = relatedPairInfo.sourceViewState as StatementViewState;
                }

                if (relatedPairInfo && linkedViewState) {
                    linkedViewState.bBox.offsetFromTop += newOffset;
                    relatedPairInfo.pairHeight += newOffset;
                    relatedPairInfo.restrictedSpace.y1 += newOffset;
                    relatedPairInfo.restrictedSpace.y2 += newOffset;
                }
            }
        });


        return updatedAsConflict;
    }

    private fixIfConflictWithEndPoint(boxStartHeight: number, boxEndHeight: number, viewState: StatementViewState,
        statementIndex: number): boolean {
        let updatedAsConflict = false;
        this.endPointPositions.forEach(position => {
            if (((boxStartHeight >= position.y1 && boxStartHeight <= position.y2)
                || (boxEndHeight >= position.y1 && boxEndHeight <= position.y2))
                && ((this.workerNames.length - 1 > position.x1
                    && this.workerNames.length - 1 < position.x2) || this.evaluatingIf)) {

                this.hasConflict = true;
                updatedAsConflict = true;
                const newOffset = (position.y2 - boxStartHeight) + DefaultConfig.offSet * 2;

                viewState.bBox.offsetFromTop += newOffset;

                let relatedPairInfo: SendRecievePairInfo;
                let linkedViewState: StatementViewState;
                if (viewState.isSend) {
                    relatedPairInfo = this.matchedPairInfo.find(pairInfo =>
                        pairInfo.sourceIndex === statementIndex
                        && pairInfo.sourceName === this.workerNames[this.workerNames.length - 1]);

                    linkedViewState = relatedPairInfo.targetViewState as StatementViewState;
                }

                if (viewState.isReceive) {
                    relatedPairInfo = this.matchedPairInfo.find(pairInfo =>
                        pairInfo.targetIndex === statementIndex
                        && pairInfo.targetName === this.workerNames[this.workerNames.length - 1]);

                    linkedViewState = relatedPairInfo.sourceViewState as StatementViewState;
                }

                if (relatedPairInfo && linkedViewState) {
                    linkedViewState.bBox.offsetFromTop += newOffset;
                    relatedPairInfo.pairHeight += newOffset;
                    relatedPairInfo.restrictedSpace.y1 += newOffset;
                    relatedPairInfo.restrictedSpace.y2 += newOffset;
                }
            }
        })

        return updatedAsConflict;
    }
}
