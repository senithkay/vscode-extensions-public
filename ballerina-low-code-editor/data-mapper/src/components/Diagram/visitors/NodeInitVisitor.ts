import { PrimitiveBalType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    BinaryExpression,
    FunctionDefinition,
    LetClause,
    LetVarDecl,
    ListConstructor,
    QueryExpression,
    SelectClause,
    SimpleNameReference,
    SpecificField,
    STKindChecker,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { DataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
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
import { getFieldAccessNodes, getSimpleNameRefNodes } from "../utils/dm-utils";
import { RecordTypeDescriptorStore } from "../utils/record-type-descriptor-store";

export class NodeInitVisitor implements Visitor {

    private inputNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];
    private specificFields: SpecificField[] = [];
    private isWithinQuery: number = 0;

    constructor(
        private context: DataMapperContext,
        private selection: SelectionState
    ) { }

    beginVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode) {
        const typeDesc = node.functionSignature?.returnTypeDesc.type;
        let typeDescPosition = typeDesc.position;
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
                        const selectClause = node.functionBody.expression.selectClause;
                        if (STKindChecker.isMappingConstructor(selectClause.expression)) {
                            this.outputNode = new MappingConstructorNode(
                                this.context,
                                selectClause,
                                typeDesc
                            );
                        } else {
                            this.outputNode = new PrimitiveTypeNode(
                                this.context,
                                selectClause,
                                typeDesc
                            );
                        }
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
                if (STKindChecker.isMappingConstructor(node.selectClause.expression)) {
                    this.outputNode = new MappingConstructorNode(
                        this.context,
                        node.selectClause,
                        parent.fieldName
                    );
                } else {
                    this.outputNode = new PrimitiveTypeNode(
                        this.context,
                        node.selectClause,
                        parent.fieldName
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
            this.intermediateNodes.push(queryNode);
            this.isWithinQuery += 1;
        }
    };

    beginVisitSpecificField(node: SpecificField, parent?: STNode) {
        const selectedSTNode = this.selection.selectedST.stNode;
        if (selectedSTNode.position.startLine !== node.position.startLine
            && selectedSTNode.position.startColumn !== node.position.startColumn) {
            this.specificFields.push(node)
        }
        if (this.isWithinQuery === 0
            && node.valueExpr
            && !STKindChecker.isMappingConstructor(node.valueExpr)
            && !STKindChecker.isListConstructor(node.valueExpr)
        ) {
            const fieldAccessNodes = getFieldAccessNodes(node.valueExpr);
            const simpleNameRefNodes = getSimpleNameRefNodes(selectedSTNode, node.valueExpr);
            const inputNodes = [...fieldAccessNodes, ...simpleNameRefNodes];
            if (inputNodes.length > 1) {
                const linkConnectorNode = new LinkConnectorNode(
                    this.context,
                    node,
                    node.fieldName.value,
                    parent,
                    inputNodes,
                    this.specificFields.slice(0)
                );
                this.intermediateNodes.push(linkConnectorNode);
            }
        }
    }

    beginVisitListConstructor(node: ListConstructor, parent?: STNode): void {
        if (this.isWithinQuery === 0 && node.expressions) {
            node.expressions.forEach((expr) => {
                if (!STKindChecker.isMappingConstructor(expr)) {
                    const fieldAccessNodes = getFieldAccessNodes(expr);
                    const simpleNameRefNodes = getSimpleNameRefNodes(this.selection.selectedST.stNode, expr);
                    const inputNodes = [...fieldAccessNodes, ...simpleNameRefNodes];
                    if (inputNodes.length > 1) {
                        const linkConnectorNode = new LinkConnectorNode(
                            this.context,
                            expr,
                            "",
                            parent,
                            inputNodes,
                            [...this.specificFields, expr],
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
                    [...this.specificFields, node.expression]
                );
                this.intermediateNodes.push(linkConnectorNode);
            }
        }
    }

    endVisitQueryExpression?(node: QueryExpression, parent?: STNode) {
        this.isWithinQuery -= 1;

    };

    endVisitBinaryExpression(node: BinaryExpression, parent?: STNode) {

    };

    endVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
    }

    endVisitSpecificField(node: SpecificField, parent?: STNode) {
        if (this.specificFields.length > 0) {
            this.specificFields.pop()
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
