import { PrimitiveBalType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    BinaryExpression,
    ExpressionFunctionBody,
    FunctionDefinition,
    LetClause,
    LetVarDecl,
    ListConstructor,
    MappingConstructor,
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
import { isArraysSupported } from "../../DataMapper/utils";
import {
    MappingConstructorNode,
    QueryExpressionNode,
    RequiredParamNode
} from "../Node";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { ExpandedMappingHeaderNode } from "../Node/ExpandedMappingHeader";
import { FromClauseNode } from "../Node/FromClause";
import { LetClauseNode } from "../Node/LetClause";
import { LinkConnectorNode } from "../Node/LinkConnector";
import { ListConstructorNode } from "../Node/ListConstructor";
import { PrimitiveTypeNode } from "../Node/PrimitiveType";
import { FUNCTION_BODY_QUERY, OFFSETS } from "../utils/constants";
import { getFieldAccessNodes, getSimpleNameRefNodes, isComplexExpression } from "../utils/dm-utils";
import { RecordTypeDescriptorStore } from "../utils/record-type-descriptor-store";

export class NodeInitVisitor implements Visitor {

    private inputNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];
    private mapIdentifiers: STNode[] = [];
    private isWithinQuery: number = 0;

    constructor(
        private context: DataMapperContext,
        private selection: SelectionState
    ) { }

    beginVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode) {
        const typeDesc = node.functionSignature?.returnTypeDesc.type;
        let typeDescPosition = typeDesc.position;
        let isFnBodyQueryExpr = false;
        if (!isArraysSupported(this.context.ballerinaVersion)
            && STKindChecker.isQualifiedNameReference(typeDesc))
        {
            typeDescPosition = typeDesc.identifier.position;
        }
        if (typeDesc) {
            if (STKindChecker.isExpressionFunctionBody(node.functionBody)) {
                const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
                const returnType = recordTypeDescriptors.getTypeDescriptor({
                    startLine: typeDescPosition.startLine,
                    startColumn: typeDescPosition.startColumn,
                    endLine: typeDescPosition.startLine,
                    endColumn: typeDescPosition.startColumn
                });
                if (returnType.typeName === PrimitiveBalType.Record) {
                    this.outputNode = new MappingConstructorNode(
                        this.context,
                        node.functionBody,
                        typeDesc
                    );
                } else if (returnType.typeName === PrimitiveBalType.Array) {
                    if (STKindChecker.isQueryExpression(node.functionBody.expression)
                        && this.context.selection.selectedST.fieldPath === FUNCTION_BODY_QUERY)
                    {
                        isFnBodyQueryExpr = true;
                        const selectClause = node.functionBody.expression.selectClause;
                        if (STKindChecker.isMappingConstructor(selectClause.expression)) {
                            this.outputNode = new MappingConstructorNode(
                                this.context,
                                selectClause,
                                typeDesc,
                                node.functionBody.expression
                            );
                        } else if (STKindChecker.isListConstructor(selectClause.expression)) {
                            this.outputNode = new ListConstructorNode(
                                this.context,
                                selectClause,
                                typeDesc,
                                node.functionBody.expression
                            );
                        } else {
                            this.outputNode = new PrimitiveTypeNode(
                                this.context,
                                selectClause,
                                typeDesc,
                                node.functionBody.expression
                            );
                        }

                        const fromClauseNode = new FromClauseNode(
                            this.context,
                            node.functionBody.expression.queryPipeline.fromClause
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
            }
            this.outputNode.setPosition(OFFSETS.TARGET_NODE.X, OFFSETS.TARGET_NODE.Y);
        }
        // create input nodes
        if (!isFnBodyQueryExpr) {
            const params = node.functionSignature.parameters;
            if (!!params.length) {
                for (let i = 0; i < params.length; i++) {
                    const param = params[i];
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

    beginVisitBinaryExpression(node: BinaryExpression, parent?: STNode) {
    };

    beginVisitQueryExpression?(node: QueryExpression, parent?: STNode) {
        // TODO: Implement a way to identify the selected query expr without using the positions since positions might change with imports, etc.
        const selectedSTNode = this.selection.selectedST.stNode;
        if (STKindChecker.isSpecificField(selectedSTNode)
            && node.position.startLine === selectedSTNode.valueExpr.position.startLine
            && node.position.startColumn === selectedSTNode.valueExpr.position.startColumn) {
            if (parent && STKindChecker.isSpecificField(parent) && STKindChecker.isIdentifierToken(parent.fieldName)) {
                const intermediateClausesHeight = node.queryPipeline.intermediateClauses.length * 65;
                const addInitialClauseHeight = 65;
                const yPosition = 50 + (intermediateClausesHeight || addInitialClauseHeight);
                // create output node
                const fieldNamePosition = parent.fieldName.position;
                const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
                const exprType = recordTypeDescriptors.getTypeDescriptor({
                    startLine: fieldNamePosition.startLine,
                    startColumn: fieldNamePosition.startColumn,
                    endLine: fieldNamePosition.startLine,
                    endColumn: fieldNamePosition.startColumn
                });

                if (exprType.memberType.typeName === PrimitiveBalType.Record) {
                    this.outputNode = new MappingConstructorNode(
                        this.context,
                        node.selectClause,
                        parent.fieldName,
                        node
                    );
                } else if (exprType.memberType.typeName === PrimitiveBalType.Array) {
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

                this.outputNode.setPosition(OFFSETS.TARGET_NODE.X, yPosition + OFFSETS.TARGET_NODE.Y);

                // create input nodes
                const fromClauseNode = new FromClauseNode(
                    this.context,
                    node.queryPipeline.fromClause
                );
                fromClauseNode.setPosition(OFFSETS.SOURCE_NODE.X, yPosition);
                this.inputNodes.push(fromClauseNode);
                fromClauseNode.initialYPosition = yPosition;

                const letClauses =
                    node.queryPipeline.intermediateClauses?.filter(
                        (item) =>
                            STKindChecker.isLetClause(item) &&
                            (
                                (item.letVarDeclarations[0] as LetVarDecl)
                                    ?.expression as SimpleNameReference
                            )?.name?.value !== "EXPRESSION"
                    );

                for (let [index, item] of letClauses.entries()) {
                    const paramNode = new LetClauseNode(this.context, item as LetClause);
                    paramNode.setPosition(OFFSETS.SOURCE_NODE.X, 0);
                    this.inputNodes.push(paramNode);
                }

                const queryNode = new ExpandedMappingHeaderNode(this.context, node);
                queryNode.setLocked(true)
                queryNode.setPosition(OFFSETS.QUERY_MAPPING_HEADER_NODE.X, OFFSETS.QUERY_MAPPING_HEADER_NODE.Y);
                this.intermediateNodes.push(queryNode);
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
    };

    beginVisitSpecificField(node: SpecificField, parent?: STNode) {
        const selectedSTNode = this.selection.selectedST.stNode;
        if (selectedSTNode.position.startLine !== node.position.startLine
            && selectedSTNode.position.startColumn !== node.position.startColumn) {
            this.mapIdentifiers.push(node)
        }
        if (this.isWithinQuery === 0
            && node.valueExpr
            && !STKindChecker.isMappingConstructor(node.valueExpr)
            && !STKindChecker.isListConstructor(node.valueExpr)
        ) {
            const fieldAccessNodes = getFieldAccessNodes(node.valueExpr);
            const simpleNameRefNodes = getSimpleNameRefNodes(selectedSTNode, node.valueExpr);
            const inputNodes = [...fieldAccessNodes, ...simpleNameRefNodes];
            if (inputNodes.length > 1
                || (inputNodes.length === 1 && isComplexExpression(node.valueExpr))) {
                const linkConnectorNode = new LinkConnectorNode(
                    this.context,
                    node,
                    node.fieldName.value,
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
                    const fieldAccessNodes = getFieldAccessNodes(expr);
                    const simpleNameRefNodes = getSimpleNameRefNodes(this.selection.selectedST.stNode, expr);
                    const inputNodes = [...fieldAccessNodes, ...simpleNameRefNodes];
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
            const fieldAccessNodes = getFieldAccessNodes(node.expression);
            const simpleNameRefNodes = getSimpleNameRefNodes(this.selection.selectedST.stNode, node.expression);
            const inputNodes = [...fieldAccessNodes, ...simpleNameRefNodes];
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
            && !STKindChecker.isListConstructor(node.expression))
        {
            const fieldAccessNodes = getFieldAccessNodes(node.expression);
            const simpleNameRefNodes = getSimpleNameRefNodes(this.selection.selectedST.stNode, node.expression);
            const inputNodes = [...fieldAccessNodes, ...simpleNameRefNodes];
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

    beginVisitMappingConstructor(node: MappingConstructor, parent?: STNode): void {
        this.mapIdentifiers.push(node);
    }

    endVisitQueryExpression?(node: QueryExpression, parent?: STNode) {
        if (this.isWithinQuery > 0) {
            this.isWithinQuery -= 1;
        }
    };

    endVisitBinaryExpression(node: BinaryExpression, parent?: STNode) {

    };

    endVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
    }

    endVisitSpecificField(node: SpecificField, parent?: STNode) {
        if (this.mapIdentifiers.length > 0) {
            this.mapIdentifiers.pop()
        }
    }

    endVisitListConstructor(node: ListConstructor, parent?: STNode) {
        if (this.mapIdentifiers.length > 0) {
            this.mapIdentifiers.pop()
        }
    }

    endVisitMappingConstructor(node: MappingConstructor, parent?: STNode) {
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
