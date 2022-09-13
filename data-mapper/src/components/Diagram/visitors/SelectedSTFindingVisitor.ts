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
    QueryExpression,
    SpecificField,
    STKindChecker,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

export class SelectedSTFindingVisitor implements Visitor {

    private node: SpecificField | FunctionDefinition;

    constructor(
        private selectedST: STNode
    ) {}

    beginVisitSTNode(node: FunctionDefinition | SpecificField, parent?: STNode){
        // TODO: Implement a way to identify the selectedST without using the positions since positions might change with imports, etc.
        if ((STKindChecker.isFunctionDefinition(node) || STKindChecker.isSpecificField(node))
            && node.position.startLine === this.selectedST.position.startLine
            && node.position.startColumn === this.selectedST.position.startColumn)
        {
            this.node = node;
        }
    }

    getST() {
        return this.node;
    }
}
