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
import { ExpressionRange, LinePosition } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FromClause,
    FunctionSignature,
    SpecificField,
    STKindChecker,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

export class RecordTypeFindingVisitor implements Visitor {
    private readonly expressionNodeRanges: ExpressionRange[];
    private readonly symbolNodesPositions: LinePosition[];

    constructor() {
        this.expressionNodeRanges = []
        this.symbolNodesPositions = []
    }

    public beginVisitFunctionSignature(node: FunctionSignature, parent?: STNode) {
        node.parameters.map((param: STNode) => {
            if (STKindChecker.isRequiredParam(param)) {
                const paramPosition = param.position;
                this.symbolNodesPositions.push({
                    line: paramPosition.startLine,
                    offset: paramPosition.startColumn
                });
            }
        });
        if (node?.returnTypeDesc) {
            const typePosition = node.returnTypeDesc.type.position;
            this.symbolNodesPositions.push({
                line: typePosition.startLine,
                offset: typePosition.startColumn
            });
        }
    }

    public beginVisitFromClause(node: FromClause, parent?: STNode) {
        const typePosition = node.expression.position;
        this.expressionNodeRanges.push({
            startLine: {
                line: typePosition.startLine,
                offset: typePosition.startColumn
            },
            endLine: {
                line: typePosition.endLine,
                offset: typePosition.endColumn
            }
        });
    }

    public beginVisitSpecificField(node: SpecificField, parent?: STNode) {
        const fieldNamePosition = node.fieldName.position;
        this.symbolNodesPositions.push({
            line: fieldNamePosition.startLine,
            offset: fieldNamePosition.startColumn
        });
    }

    public getExpressionNodesRanges(){
        return this.expressionNodeRanges;
    }

    public getSymbolNodesPositions(){
        return this.symbolNodesPositions;
    }
}

