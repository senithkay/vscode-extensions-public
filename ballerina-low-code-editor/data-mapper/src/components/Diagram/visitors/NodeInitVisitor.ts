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
import { PrimitiveBalType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    CaptureBindingPattern,
    ExpressionFunctionBody,
    FunctionDefinition,
    LetClause,
    LetExpression,
    LetVarDecl,
    ListConstructor,
    MappingConstructor,
    NodePosition,
    QueryExpression,
    SelectClause,
    SimpleNameReference,
    SpecificField,
    STKindChecker,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { DataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { isPositionsEquals } from "../../../utils/st-utils";
import { SelectionState } from "../../DataMapper/DataMapper";
import {
    MappingConstructorNode,
    QueryExpressionNode,
    RequiredParamNode
} from "../Node";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { ExpandedMappingHeaderNode } from "../Node/ExpandedMappingHeader";
import { FromClauseNode } from "../Node/FromClause";
import { LetClauseNode } from "../Node/LetClause";
import { LetExpressionNode } from "../Node/LetExpression";
import { LinkConnectorNode } from "../Node/LinkConnector";
import { ListConstructorNode } from "../Node/ListConstructor";
import { PrimitiveTypeNode } from "../Node/PrimitiveType";
import { RightAnglePortModel } from "../Port/RightAnglePort/RightAnglePortModel";
import { EXPANDED_QUERY_INPUT_NODE_PREFIX, FUNCTION_BODY_QUERY, OFFSETS } from "../utils/constants";
import {
    getInputNodes,
    getTypeOfOutput,
    isComplexExpression
} from "../utils/dm-utils";

export class NodeInitVisitor implements Visitor {

    private inputNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];
    private mapIdentifiers: STNode[] = [];
    private isWithinQuery = 0;

    constructor(
        private context: DataMapperContext,
        private selection: SelectionState
    ) { }

    beginVisitFunctionDefinition(node: FunctionDefinition) {
        const typeDesc = node.functionSignature?.returnTypeDesc && node.functionSignature.returnTypeDesc.type;
        let isFnBodyQueryExpr = false;
        if (typeDesc) {
            if (STKindChecker.isExpressionFunctionBody(node.functionBody)) {
                const returnType = getTypeOfOutput(typeDesc, this.context.ballerinaVersion);

                if (returnType) {
                    if (returnType.typeName === PrimitiveBalType.Record) {
                        this.outputNode = new MappingConstructorNode(
                            this.context,
                            node.functionBody,
                            typeDesc
                        );
                    } else if (returnType.typeName === PrimitiveBalType.Array) {
                        const bodyExpr = STKindChecker.isLetExpression(node.functionBody.expression)
                            ? node.functionBody.expression.expression
                            : node.functionBody.expression;
                        if (STKindChecker.isQueryExpression(bodyExpr)
                            && this.context.selection.selectedST.fieldPath === FUNCTION_BODY_QUERY)
                        {
                            isFnBodyQueryExpr = true;
                            const selectClause = bodyExpr.selectClause;
                            if (returnType?.memberType && returnType.memberType.typeName === PrimitiveBalType.Record) {
                                this.outputNode = new MappingConstructorNode(
                                    this.context,
                                    selectClause,
                                    typeDesc,
                                    bodyExpr
                                );
                            } else if (returnType?.memberType && returnType.memberType.typeName === PrimitiveBalType.Array) {
                                this.outputNode = new ListConstructorNode(
                                    this.context,
                                    selectClause,
                                    typeDesc,
                                    bodyExpr
                                );
                            } else {
                                this.outputNode = new PrimitiveTypeNode(
                                    this.context,
                                    selectClause,
                                    typeDesc,
                                    bodyExpr
                                );
                            }

                            const fromClauseNode = new FromClauseNode(
                                this.context,
                                bodyExpr.queryPipeline.fromClause
                            );
                            fromClauseNode.setPosition(OFFSETS.SOURCE_NODE.X, 0);
                            this.inputNodes.push(fromClauseNode);
                            //
                            // const letClauses =
                            //     node.functionBody.expression.queryPipeline.intermediateClauses?.filter(
                            //         (item) =>
                            //             STKindChecker.isLetClause(item) &&
                            //             (
                            //                 (item.letVarDeclarations[0] as LetVarDecl)
                            //                     ?.expression as SimpleNameReference
                            //             )?.name?.value !== "EXPRESSION"
                            //     );
                            //
                            // for (const [index, item] of letClauses.entries()) {
                            //     const paramNode = new LetClauseNode(this.context, item as LetClause);
                            //     paramNode.setPosition(OFFSETS.SOURCE_NODE.X, 0);
                            //     this.inputNodes.push(paramNode);
                            // }
                            //
                            // const queryNode = new ExpandedMappingHeaderNode(this.context, node.functionBody.expression);
                            // queryNode.setLocked(true)
                            // queryNode.setPosition(OFFSETS.QUERY_MAPPING_HEADER_NODE.X, OFFSETS.QUERY_MAPPING_HEADER_NODE.Y);
                            // this.intermediateNodes.push(queryNode);
                        } else {
                            this.outputNode = new ListConstructorNode(
                                this.context,
                                node.functionBody,
                                typeDesc
                            );
                        }
                    } else {
                        this.outputNode = new PrimitiveTypeNode(
                            this.context,
                            node.functionBody,
                            typeDesc
                        );
                    }
                    this.outputNode.setPosition(OFFSETS.TARGET_NODE.X, OFFSETS.TARGET_NODE.Y);
                }
            }
        }
        // create input nodes
        if (!isFnBodyQueryExpr) {
            const params = node.functionSignature.parameters;
            if (params.length) {
                for (
                    const param of params) {
                    if (STKindChecker.isRequiredParam(param)) {
                        const paramNode = new RequiredParamNode(
                            this.context,
                            param,
                            param.typeName
                        );
                        paramNode.setPosition(OFFSETS.SOURCE_NODE.X, 0);
                        this.inputNodes.push(paramNode);
                    } else {
                        // TODO for other param types
                    }
                }
            }
        }
    }

    beginVisitQueryExpression?(node: QueryExpression, parent?: STNode) {
        // TODO: Implement a way to identify the selected query expr without using the positions since positions might change with imports, etc.
        const selectedSTNode = this.selection.selectedST.stNode;
        const nodePosition: NodePosition = node.position as NodePosition;
        if (STKindChecker.isSpecificField(selectedSTNode)
            && nodePosition.startLine === (selectedSTNode.valueExpr.position as NodePosition).startLine
            && nodePosition.startColumn === (selectedSTNode.valueExpr.position as NodePosition).startColumn) {
            if (parent && STKindChecker.isSpecificField(parent) && STKindChecker.isIdentifierToken(parent.fieldName)) {
                const intermediateClausesHeight = node.queryPipeline.intermediateClauses.length * 80;
                const yPosition = 50 + intermediateClausesHeight;
                // create output node
                const exprType = getTypeOfOutput(parent.fieldName, this.context.ballerinaVersion);

                if (exprType?.memberType && exprType.memberType.typeName === PrimitiveBalType.Record) {
                    this.outputNode = new MappingConstructorNode(
                        this.context,
                        node.selectClause,
                        parent.fieldName,
                        node
                    );
                } else if (exprType?.memberType && exprType.memberType.typeName === PrimitiveBalType.Array) {
                    this.outputNode = new ListConstructorNode(
                        this.context,
                        node.selectClause,
                        parent.fieldName,
                        node
                    );
                } else {
                    this.outputNode = new PrimitiveTypeNode(
                        this.context,
                        node.selectClause,
                        parent.fieldName,
                        node
                    );
                }

                this.outputNode.setPosition(OFFSETS.TARGET_NODE.X + 80, yPosition + OFFSETS.TARGET_NODE.Y);

                const expandedHeaderPorts: RightAnglePortModel[] = [];

                // create input nodes
                const fromClauseNode = new FromClauseNode(this.context, node.queryPipeline.fromClause);
                fromClauseNode.setPosition(OFFSETS.SOURCE_NODE.X + 80, yPosition);
                this.inputNodes.push(fromClauseNode);
                fromClauseNode.initialYPosition = yPosition;

                const fromClauseNodeValueLabel = (
                    node.queryPipeline.fromClause?.typedBindingPattern?.bindingPattern as CaptureBindingPattern
                )?.variableName?.value;
                const fromClausePort = new RightAnglePortModel(true, `${EXPANDED_QUERY_INPUT_NODE_PREFIX}.${fromClauseNodeValueLabel}`);
                expandedHeaderPorts.push(fromClausePort);
                fromClauseNode.addPort(fromClausePort);

                const letClauses = node.queryPipeline.intermediateClauses?.filter(
                    (item) =>
                        STKindChecker.isLetClause(item) &&
                        ((item.letVarDeclarations[0] as LetVarDecl)?.expression as SimpleNameReference)?.name?.value !==
                        "EXPRESSION"
                );

                for (const [, item] of letClauses.entries()) {
                    const paramNode = new LetClauseNode(this.context, item as LetClause);
                    paramNode.setPosition(OFFSETS.SOURCE_NODE.X + 80, 0);
                    this.inputNodes.push(paramNode);

                    const letClauseValueLabel = (
                        ((item as LetClause)?.letVarDeclarations[0] as LetVarDecl)?.typedBindingPattern
                            ?.bindingPattern as CaptureBindingPattern
                    )?.variableName?.value;
                    const letClausePort = new RightAnglePortModel(true, `${EXPANDED_QUERY_INPUT_NODE_PREFIX}.${letClauseValueLabel}`);
                    expandedHeaderPorts.push(letClausePort);
                    paramNode.addPort(letClausePort);
                }

                const queryNode = new ExpandedMappingHeaderNode(this.context, node);
                queryNode.setLocked(true);
                queryNode.setPosition(OFFSETS.QUERY_MAPPING_HEADER_NODE.X, OFFSETS.QUERY_MAPPING_HEADER_NODE.Y);
                this.intermediateNodes.push(queryNode);
                queryNode.targetPorts = expandedHeaderPorts;
            }
        } else if (this.context.selection.selectedST.fieldPath !== FUNCTION_BODY_QUERY) {
            const queryNode = new QueryExpressionNode(this.context, node, parent);
            if (this.isWithinQuery === 0) {
                this.intermediateNodes.push(queryNode);
            }
            this.isWithinQuery += 1;
        } else {
            if (STKindChecker.isFunctionDefinition(selectedSTNode)
                && STKindChecker.isExpressionFunctionBody(selectedSTNode.functionBody))
            {
                const queryExpr = selectedSTNode.functionBody.expression;
                if (!isPositionsEquals(queryExpr.position, node.position) && this.isWithinQuery === 0) {
                    const queryNode = new QueryExpressionNode(this.context, node, parent);
                    this.intermediateNodes.push(queryNode);
                    this.isWithinQuery += 1;
                }
            }

        }
    }

    beginVisitLetExpression(node: LetExpression, parent?: STNode) {
        const hasExpanded = this.selection.prevST.length > 0;
        if (hasExpanded) {
            return;
        }
        const letVarDeclarations = node.letVarDeclarations;
        for (const decl of letVarDeclarations) {
            if (STKindChecker.isLetVarDecl(decl)) {
                const letExprNode = new LetExpressionNode(
                    this.context,
                    decl
                );
                letExprNode.setPosition(OFFSETS.SOURCE_NODE.X, 0);
                this.inputNodes.push(letExprNode);
            }
        }
    }

    beginVisitSpecificField(node: SpecificField, parent?: STNode) {
        const selectedSTNode = this.selection.selectedST.stNode;
        if ((selectedSTNode.position as NodePosition).startLine !== (node.position as NodePosition).startLine
            && (selectedSTNode.position as NodePosition).startColumn !== (node.position as NodePosition).startColumn) {
            this.mapIdentifiers.push(node)
        }
        if (this.isWithinQuery === 0
            && node.valueExpr
            && !STKindChecker.isMappingConstructor(node.valueExpr)
            && !STKindChecker.isListConstructor(node.valueExpr)
        ) {
            const inputNodes = getInputNodes(node.valueExpr);
            if (inputNodes.length > 1
                || (inputNodes.length === 1 && isComplexExpression(node.valueExpr))) {
                const linkConnectorNode = new LinkConnectorNode(
                    this.context,
                    node,
                    node.fieldName.value as string,
                    parent,
                    inputNodes,
                    this.mapIdentifiers.slice(0)
                );
                this.intermediateNodes.push(linkConnectorNode);
            }
        }
    }

    beginVisitListConstructor(node: ListConstructor, parent?: STNode): void {
        this.mapIdentifiers.push(node);
        if (this.isWithinQuery === 0 && node.expressions) {
            node.expressions.forEach((expr) => {
                if (!STKindChecker.isMappingConstructor(expr) && !STKindChecker.isListConstructor(expr)) {
                    const inputNodes = getInputNodes(expr);
                    if (inputNodes.length > 1
                        || (inputNodes.length === 1 && isComplexExpression(expr))) {
                        const linkConnectorNode = new LinkConnectorNode(
                            this.context,
                            expr,
                            "",
                            parent,
                            inputNodes,
                            [...this.mapIdentifiers, expr],
                            true
                        );
                        this.intermediateNodes.push(linkConnectorNode);
                    }
                }
            })
        }

    }

    beginVisitSelectClause(node: SelectClause, parent?: STNode): void {
        if (this.isWithinQuery === 0
            && !STKindChecker.isMappingConstructor(node.expression)
            && !STKindChecker.isListConstructor(node.expression))
        {
            const inputNodes = getInputNodes(node.expression);
            if (inputNodes.length > 1) {
                const linkConnectorNode = new LinkConnectorNode(
                    this.context,
                    node.expression,
                    "",
                    parent,
                    inputNodes,
                    [...this.mapIdentifiers, node.expression]
                );
                this.intermediateNodes.push(linkConnectorNode);
            }
        }
    }

    beginVisitExpressionFunctionBody(node: ExpressionFunctionBody, parent?: STNode): void {
        if (!STKindChecker.isMappingConstructor(node.expression)
            && !STKindChecker.isListConstructor(node.expression)
            && !STKindChecker.isLetExpression(node.expression))
        {
            const inputNodes = getInputNodes(node.expression);
            if (inputNodes.length > 1) {
                const linkConnectorNode = new LinkConnectorNode(
                    this.context,
                    node.expression,
                    "",
                    parent,
                    inputNodes,
                    [node.expression]
                );
                this.intermediateNodes.push(linkConnectorNode);
            }
        }
    }

    beginVisitMappingConstructor(node: MappingConstructor): void {
        this.mapIdentifiers.push(node);
    }

    endVisitQueryExpression?() {
        if (this.isWithinQuery > 0) {
            this.isWithinQuery -= 1;
        }
    };

    endVisitSpecificField() {
        if (this.mapIdentifiers.length > 0) {
            this.mapIdentifiers.pop()
        }
    }

    endVisitListConstructor() {
        if (this.mapIdentifiers.length > 0) {
            this.mapIdentifiers.pop()
        }
    }

    endVisitMappingConstructor() {
        if (this.mapIdentifiers.length > 0) {
            this.mapIdentifiers.pop()
        }
    }

    getNodes() {
        const nodes = [...this.inputNodes];
        if (this.outputNode) {
            nodes.push(this.outputNode);
        }
        nodes.push(...this.intermediateNodes);
        return nodes;
    }
}
