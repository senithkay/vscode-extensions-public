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
    FunctionDefinition,
    LetClause,
    LetVarDecl,
    NodePosition,
    SpecificField,
    STKindChecker,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

export interface FnDefPositions {
    fnNamePosition: LinePosition;
    returnTypeDescPosition: LinePosition;
}

export class RecordTypeFindingVisitor implements Visitor {
    private readonly expressionNodeRanges: ExpressionRange[];
    private readonly symbolNodesPositions: LinePosition[];
    private fnDefPositions: FnDefPositions;
    private readonly isArraysSupported: boolean;

    constructor(isArraysSupported: boolean) {
        this.expressionNodeRanges = []
        this.symbolNodesPositions = []
        this.fnDefPositions = {fnNamePosition: undefined, returnTypeDescPosition: undefined}
        this.isArraysSupported = isArraysSupported
    }

    public beginVisitFunctionDefinition(node: FunctionDefinition) {
        if (this.isArraysSupported) {
            this.fnDefPositions = {
                fnNamePosition: {
                    line: (node.functionName.position as NodePosition).startLine,
                    offset: (node.functionName.position as NodePosition).startColumn
                },
                returnTypeDescPosition: node.functionSignature?.returnTypeDesc ?
                    {
                        line: (node.functionSignature.returnTypeDesc.type.position as NodePosition).startLine,
                        offset: (node.functionSignature.returnTypeDesc.type.position as NodePosition).startColumn
                    } : null
            }
        } else {
            node.functionSignature.parameters.map((param: STNode) => {
                if (STKindChecker.isRequiredParam(param)) {
                    const paramPosition: NodePosition = STKindChecker.isQualifiedNameReference(param.typeName)
                        ? param.typeName.identifier.position as NodePosition
                        : param.position as NodePosition as NodePosition;
                    this.symbolNodesPositions.push({
                        line: paramPosition.startLine,
                        offset: paramPosition.startColumn
                    });
                }
            });
            if (node.functionSignature?.returnTypeDesc) {
                const typePosition: NodePosition = STKindChecker.isQualifiedNameReference(node.functionSignature.returnTypeDesc.type)
                    ? node.functionSignature.returnTypeDesc.type.identifier.position as NodePosition
                    : node.functionSignature.returnTypeDesc.type.position as NodePosition;
                this.symbolNodesPositions.push({
                    line: typePosition.startLine,
                    offset: typePosition.startColumn
                });
            }
        }
    }

    public beginVisitFromClause(node: FromClause) {
        const typePosition: NodePosition = node.expression.position as NodePosition;
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

    public beginVisitSpecificField(node: SpecificField) {
        const fieldNamePosition: NodePosition = node.fieldName.position as NodePosition;
        this.symbolNodesPositions.push({
            line: fieldNamePosition.startLine,
            offset: fieldNamePosition.startColumn
        });
    }

    public beginVisitLetClause(node: LetClause){
        const typePosition: NodePosition = (node.letVarDeclarations[0] as LetVarDecl)?.expression?.position as NodePosition;
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

    public getExpressionNodesRanges(){
        return this.expressionNodeRanges;
    }

    public getSymbolNodesPositions(){
        return this.symbolNodesPositions;
    }

    public getFnDefPositions(){
        return this.fnDefPositions;
    }
}

