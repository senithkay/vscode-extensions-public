import {
    CaptureBindingPattern,
    ExpressionFunctionBody,
    FunctionDefinition,
    LetClause,
    LetVarDecl,
    ListConstructor,
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
import { LinkConnectorNode } from "../Node/LinkConnector";
import { PrimitiveTypeNode } from "../Node/PrimitiveType";
import { RightAnglePortModel } from "../Port/RightAnglePort/RightAnglePortModel";
import { EXPANDED_QUERY_INPUT_NODE_PREFIX, OFFSETS } from "../utils/constants";
import { getInputNodes, isComplexExpression } from "../utils/dm-utils";

export class NodeInitVisitor implements Visitor {

    private inputNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];
    private specificFields: SpecificField[] = [];
    private isWithinQuery = 0;

    constructor(
        private context: DataMapperContext,
        private selection: SelectionState
    ) { }

    beginVisitFunctionDefinition(node: FunctionDefinition) {
        const typeDesc = node.functionSignature.returnTypeDesc?.type;
        if (typeDesc) {
            this.outputNode = new MappingConstructorNode(
                this.context,
                node.functionBody as ExpressionFunctionBody,
                typeDesc
            );
            this.outputNode.setPosition(OFFSETS.TARGET_NODE.X, OFFSETS.TARGET_NODE.Y);
        }
        // create input nodes
        const params = node.functionSignature.parameters;
        if (params.length) {
            for (const param of params) {
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
                this.outputNode = STKindChecker.isMappingConstructor(node.selectClause.expression)
                                ? new MappingConstructorNode(this.context, node.selectClause, parent.fieldName)
                                : new PrimitiveTypeNode(this.context, node.selectClause, parent.fieldName);

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
        } else {
            const queryNode = new QueryExpressionNode(this.context, node, parent);
            this.intermediateNodes.push(queryNode);
            this.isWithinQuery += 1;
        }
    }

    beginVisitSpecificField(node: SpecificField, parent?: STNode) {
        const selectedSTNode = this.selection.selectedST.stNode;
        if ((selectedSTNode.position as NodePosition).startLine !== (node.position as NodePosition).startLine
            && (selectedSTNode.position as NodePosition).startColumn !== (node.position as NodePosition).startColumn) {
            this.specificFields.push(node)
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
                    const inputNodes = getInputNodes(expr);

                    if (inputNodes.length > 1
                        || (inputNodes.length === 1 && isComplexExpression(expr))) {
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
            const inputNodes = getInputNodes(node.expression);
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

    endVisitQueryExpression?() {
        this.isWithinQuery -= 1;
    }

    endVisitSpecificField() {
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
