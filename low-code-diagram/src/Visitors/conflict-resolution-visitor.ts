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

import { BlockStatement, FunctionBodyBlock, IfElseStatement, NamedWorkerDeclaration, STKindChecker, STNode, Visitor } from "@wso2-enterprise/syntax-tree";

import { BlockViewState, EndViewState, FunctionViewState, StatementViewState } from "../ViewState";
import { WorkerDeclarationViewState } from "../ViewState/worker-declaration";

import { DefaultConfig } from "./default";
import { ConflictRestrictSpace, DEFAULT_WORKER_NAME, SendRecievePairInfo } from "./sizing-visitor";

export class ConflictResolutionVisitor implements Visitor {
    private matchedPairInfo: SendRecievePairInfo[];
    private workerNames: string[];
    private hasConflict: boolean;
    private endPointPositions: ConflictRestrictSpace[];
    private workerCount: number;

    constructor(matchedPairInfo: SendRecievePairInfo[], workerCount: number) {
        this.matchedPairInfo = matchedPairInfo;
        this.workerNames = [];
        this.hasConflict = false;
        this.workerCount = workerCount;
        this.endPointPositions = [];
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
    }

    endVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode): void {
        this.endVisitBlockStatement(node, parent);
        this.workerNames = [];
    }

    beginVisitNamedWorkerDeclaration(node: NamedWorkerDeclaration, parent?: STNode): void {
        this.workerNames.push(node.workerName.value);
    }

    endVisitNamedWorkerDeclaration(node: NamedWorkerDeclaration, parent?: STNode): void {
    }

    beginVisitIfElseStatement(node: IfElseStatement, parent?: STNode): void {

    }

    endVisitBlockStatement(node: BlockStatement, parent?: STNode): void {
        const blockViewState: BlockViewState = node.viewState as BlockViewState;
        let height: number = 0;
        node.statements.forEach((statementNode, statementIndex) => {
            const statementVS: StatementViewState = statementNode.viewState as StatementViewState;
            const statementBoxStartHeight = height + statementVS.bBox.offsetFromTop;
            const statementBoxEndHeight = statementBoxStartHeight + statementVS.bBox.h;
            let updatedAsConflict = false;

            if (!this.hasConflict) {
                console.log('>>>', this.endPointPositions);
                this.endPointPositions.forEach(endPointRange => {
                    updatedAsConflict = this.fixIfConflicts(statementBoxStartHeight,
                        statementBoxEndHeight, endPointRange, statementVS, statementIndex);
                })
            }

            if (!this.hasConflict) {
                this.matchedPairInfo.forEach(matchedPair => {
                    updatedAsConflict = this.fixIfConflicts(statementBoxStartHeight,
                        statementBoxEndHeight, matchedPair.restrictedSpace, statementVS, statementIndex);
                });

            }

            if (!updatedAsConflict && (statementVS.isSend || statementVS.isReceive)) {
                let correspondingPair;

                if (statementVS.isSend) {
                    correspondingPair = this.matchedPairInfo.find(pairInfo =>
                        pairInfo.sourceName === this.workerNames[this.workerNames.length - 1]
                        && pairInfo.sourceIndex === statementIndex);
                }

                if (statementVS.isReceive) {
                    correspondingPair = this.matchedPairInfo.find(pairInfo =>
                        pairInfo.targetName === this.workerNames[this.workerNames.length - 1]
                        && pairInfo.targetIndex === statementIndex);
                }

                if (correspondingPair && correspondingPair.pairHeight !== statementBoxStartHeight) {
                    const newOffset = statementBoxStartHeight - correspondingPair.pairHeight;
                    correspondingPair.pairHeight += newOffset;
                    const viewStateToUpdate = statementVS.isSend ?
                        correspondingPair.targetViewState : correspondingPair.sourceViewState;
                    viewStateToUpdate.bBox.offsetFromTop += newOffset;
                    correspondingPair.restrictedSpace.y1 += newOffset;
                    correspondingPair.restrictedSpace.y2 += newOffset;
                }
            }

            if (statementVS.isEndpoint) {
                this.endPointPositions.push({
                    y1: height + statementVS.bBox.offsetFromTop,
                    y2: height + statementVS.bBox.offsetFromTop + statementVS.bBox.h,
                    x1: this.workerNames.length - 1,
                    x2: this.workerCount + 1
                })
            }

            height += statementVS.getHeight();
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
                    this.matchedPairInfo.forEach(matchedPair => {
                        if (endBlockStartHeight <= matchedPair.restrictedSpace.y2
                            && endBlockStartHeight >= matchedPair.restrictedSpace.y1
                            && this.workerNames.length - 1 > matchedPair.restrictedSpace.x1
                            && this.workerNames.length - 1 < matchedPair.restrictedSpace.x2) {

                            // debugger;
                            const newOffset = matchedPair.restrictedSpace.y2 - endBlockStartHeight + DefaultConfig.offSet;
                            endViewState.bBox.offsetFromTop += newOffset;

                            let correspondingPair;

                            if (endViewState.isSend) {
                                correspondingPair = this.matchedPairInfo.find(pairInfo =>
                                    pairInfo.sourceName === this.workerNames[this.workerNames.length - 1]
                                    && pairInfo.sourceIndex === node.statements.length);
                            }


                            if (correspondingPair) {
                                correspondingPair.pairHeight += newOffset;
                                const viewStateToUpdate = endViewState.isSend ?
                                    correspondingPair.targetViewState : correspondingPair.sourceViewState;
                                viewStateToUpdate.bBox.offsetFromTop += newOffset;
                                correspondingPair.restrictedSpace.y1 += newOffset;
                                correspondingPair.restrictedSpace.y2 += newOffset;
                            }
                            this.hasConflict = true;
                        }
                    });
                }
            }
        }

    }

    private fixIfConflicts(statementBoxStartHeight: number, statementBoxEndHeight: number, 
                           restrictedSpace: ConflictRestrictSpace, statementVS: StatementViewState, 
                           statementIndex: number) {

        let updatedAsConflict: boolean = false;
        if (((statementBoxStartHeight <= restrictedSpace.y2
            && statementBoxStartHeight >= restrictedSpace.y1)
            || (statementBoxEndHeight <= restrictedSpace.y2
                && statementBoxEndHeight >= restrictedSpace.y1))
            && this.workerNames.length - 1 > restrictedSpace.x1
            && this.workerNames.length - 1 < restrictedSpace.x2) {

            const newOffset = restrictedSpace.y2 - statementBoxStartHeight + DefaultConfig.offSet;
            statementVS.bBox.offsetFromTop += newOffset;

            let correspondingPair;

            if (statementVS.isSend) {
                correspondingPair = this.matchedPairInfo.find(pairInfo =>
                    pairInfo.sourceName === this.workerNames[this.workerNames.length - 1]
                    && pairInfo.sourceIndex === statementIndex);
            }

            if (statementVS.isReceive) {
                correspondingPair = this.matchedPairInfo.find(pairInfo =>
                    pairInfo.targetName === this.workerNames[this.workerNames.length - 1]
                    && pairInfo.targetIndex === statementIndex);
            }

            if (correspondingPair) {
                correspondingPair.pairHeight += newOffset;
                const viewStateToUpdate = statementVS.isSend ?
                    correspondingPair.targetViewState : correspondingPair.sourceViewState;
                viewStateToUpdate.bBox.offsetFromTop += newOffset;
                correspondingPair.restrictedSpace.y1 += newOffset;
                correspondingPair.restrictedSpace.y2 += newOffset;
            }
            updatedAsConflict = true;
            this.hasConflict = true;
        }
        return updatedAsConflict;
    }
}
