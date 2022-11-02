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
    FunctionDefinition,
    SpecificField,
    STKindChecker,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { DataMapperViewState } from "../../../utils/data-mapper-view-state";
import { DMNode } from "../../DataMapper/DataMapper";

export class SelectedSTFindingVisitor implements Visitor {

    private node: SpecificField | FunctionDefinition;

    private updatedPrevST: DMNode[];

    private pathSegmentIndex: number;

    constructor(
        private prevST: DMNode[],
    ) {
        this.updatedPrevST = [];
        this.pathSegmentIndex = 1; // Field path always starts with the record root name
    }

    beginVisitSTNode(node: FunctionDefinition | SpecificField, parent?: STNode) {
        const item = this.prevST[0];

        if (item && item.stNode && STKindChecker.isSpecificField(item.stNode)) {
           const pathSegments = item.fieldPath.split('.');
           if (STKindChecker.isSpecificField(node) && node.fieldName.value === pathSegments[this.pathSegmentIndex]) {
               this.pathSegmentIndex++;
           } else if (STKindChecker.isListConstructor(node) && !isNaN(+pathSegments[this.pathSegmentIndex])) {
                node.expressions.forEach((exprNode, index) => {
                    if (!STKindChecker.isCommaToken(exprNode)) {
                        (exprNode.dataMapperViewState as DataMapperViewState).elementIndex = index / 2;
                    }
                });
           } else if (node.dataMapperViewState) {
               const elementIndex = (node.dataMapperViewState as DataMapperViewState).elementIndex;
               if (elementIndex === +pathSegments[this.pathSegmentIndex]) {
                   this.pathSegmentIndex++;
               }
           } else {
               return;
           }
        }

        if (item?.stNode && node && (STKindChecker.isFunctionDefinition(node) || STKindChecker.isSpecificField(node))) {
            if (
                STKindChecker.isSpecificField(node) &&
                STKindChecker.isSpecificField(item.stNode) &&
                node.fieldName.value === item.stNode.fieldName?.value
            ) {
                this.updatedPrevST = [...this.updatedPrevST, { ...this.prevST.shift(), stNode: node }]
                this.pathSegmentIndex = 1;
            } else if (
                STKindChecker.isFunctionDefinition(node) &&
                STKindChecker.isFunctionDefinition(item.stNode) &&
                node.functionName.value === item.stNode.functionName?.value
            ) {
                this.updatedPrevST = [...this.updatedPrevST, { ...this.prevST.shift(), stNode: node }]
            }
        }
    }

    getST() {
        const selectedST = this.updatedPrevST.pop();
        return {
            selectedST,
            prevST: this.updatedPrevST,
        };
    }
}
