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

import { BlockStatement, FunctionBodyBlock, FunctionDefinition, IfElseStatement, NamedWorkerDeclaration, STNode, Visitor } from "@wso2-enterprise/syntax-tree";

import { StatementViewState, ViewState } from "../ViewState";

import { DefaultConfig } from "./default";
import { DEFAULT_WORKER_NAME, SendRecievePairInfo } from "./sizing-visitor";

export class ConflictResolutionVisitor implements Visitor {
    private matchedPairInfo: SendRecievePairInfo[];
    private workerNames: string[];
    private hasConflict: boolean;

    constructor(matchedPairInfo: SendRecievePairInfo[]) {
        this.matchedPairInfo = matchedPairInfo;
        this.workerNames = [];
        this.hasConflict = false;
    }

    public conflictFound() {
        return this.hasConflict;
    }

    public resetConflictStatus() {
        this.hasConflict = false;
    }

    beginVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode): void {
        this.endVisitBlockStatement(node);
        this.workerNames.push(DEFAULT_WORKER_NAME);
    }

    endVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode): void {
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
        let height: number = 0;
        node.statements.forEach((statementNode, i) => {
            const statementVS: StatementViewState = statementNode.viewState as StatementViewState;
            const statementBoxStartHeight = height + statementVS.bBox.offsetFromTop;
            let updatedAsConflict = false;

            if (!this.hasConflict) {
                this.matchedPairInfo.forEach(matchedPair => {
                    if (statementBoxStartHeight <= matchedPair.restrictedSpace.y2
                        && statementBoxStartHeight >= matchedPair.restrictedSpace.y1
                        && this.workerNames.length - 1 > matchedPair.restrictedSpace.x1
                        && this.workerNames.length - 1 < matchedPair.restrictedSpace.x2) {

                        // debugger;
                        const newOffset = matchedPair.restrictedSpace.y2 - statementBoxStartHeight + DefaultConfig.offSet;
                        statementVS.bBox.offsetFromTop += newOffset;

                        let correspondingPair;

                        if (statementVS.isSend) {
                            correspondingPair = this.matchedPairInfo.find(pairInfo =>
                                pairInfo.sourceName === this.workerNames[this.workerNames.length - 1]
                                && pairInfo.sourceIndex === i);
                        }

                        if (statementVS.isReceive) {
                            correspondingPair = this.matchedPairInfo.find(pairInfo =>
                                pairInfo.targetName === this.workerNames[this.workerNames.length - 1]
                                && pairInfo.targetIndex === i);
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
                });
            }

            if (!updatedAsConflict && (statementVS.isSend || statementVS.isReceive)) {
                let correspondingPair;

                if (statementVS.isSend) {
                    correspondingPair = this.matchedPairInfo.find(pairInfo =>
                        pairInfo.sourceName === this.workerNames[this.workerNames.length - 1]
                        && pairInfo.sourceIndex === i);
                }

                if (statementVS.isReceive) {
                    correspondingPair = this.matchedPairInfo.find(pairInfo =>
                        pairInfo.targetName === this.workerNames[this.workerNames.length - 1]
                        && pairInfo.targetIndex === i);
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

            height += statementVS.getHeight();
        })
    }
}
