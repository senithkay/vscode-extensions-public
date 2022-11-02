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
    SimpleNameReference,
    STKindChecker,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

export class SimpleNameReferencesFindingVisitor implements Visitor {
    private possibleReferences: string[];
    private readonly simpleNameReferenceNodes: SimpleNameReference[];
    private queryExpressionDepth: number;

    constructor(possibleReferences: string[]) {
        this.possibleReferences = possibleReferences;
        this.simpleNameReferenceNodes = [];
        this.queryExpressionDepth = 0;
    }

    public beginVisitSimpleNameReference(node: SimpleNameReference, parent?: STNode) {
        if (STKindChecker.isIdentifierToken(node.name)
            && (parent && !STKindChecker.isFieldAccess(parent) && !STKindChecker.isOptionalFieldAccess(parent))
            && this.possibleReferences.includes(node.name.value))
        {
            this.simpleNameReferenceNodes.push(node);
        }
    }

    public getSimpleNameReferenceNodes(){
        return this.simpleNameReferenceNodes;
    }

}
