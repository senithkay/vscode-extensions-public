import {
    BinaryExpression,
    ExpressionFunctionBody,
    FunctionDefinition,
    QueryExpression,
    SpecificField,
    STKindChecker,
    STNode,
    traversNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { DataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { SelectionState } from "../../DataMapper/DataMapper";
import {
    QueryExpressionNode,
    RequiredParamNode
} from "../Node";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { ExpandedMappingHeaderNode } from "../Node/ExpandedMappingHeader";
import { FromClauseNode } from "../Node/FromClause";
import { LinkConnectorNode } from "../Node/LinkConnector";
import { MappingConstructorNode } from "../Node/MappingConstructor";

import { FieldAccessFindingVisitor } from "./FieldAccessFindingVisitor";

const draftFunctionName = 'XChoreoLCReturnType';

export class NodeInitVisitor implements Visitor {

    private inputNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];
    private specificFields: SpecificField[] = [];
    private isWithinQuery: number = 0;

    constructor(
        private context: DataMapperContext,
        private selection: SelectionState
    ) {}

    beginVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode){
        const typeDesc = node.functionSignature.returnTypeDesc?.type;
        if (typeDesc) {
            this.outputNode = new MappingConstructorNode(
                this.context,
                node.functionBody as ExpressionFunctionBody,
                typeDesc
            );
            this.outputNode.setPosition(1000, 100);
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
                    paramNode.setPosition(100, 100 + i * 400); // 400 is an arbitary value, need to calculate exact heigt;
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
        if (STKindChecker.isSpecificField(this.selection.selectedST)
            && node.position.startLine === this.selection.selectedST.valueExpr.position.startLine
            && node.position.startColumn === this.selection.selectedST.valueExpr.position.startColumn)
        {
            if (parent && STKindChecker.isSpecificField(parent) && STKindChecker.isIdentifierToken(parent.fieldName)) {
                // create output node
                this.outputNode = new MappingConstructorNode(
                    this.context,
                    node.selectClause,
                    parent.fieldName
                );

                this.outputNode.setPosition(1000, 100);

                // create input nodes
                const fromClauseNode = new FromClauseNode(
                    this.context,
                    node.queryPipeline.fromClause
                );
                fromClauseNode.setPosition(100, 100);
                this.inputNodes.push(fromClauseNode);

                const queryNode = new ExpandedMappingHeaderNode(this.context, node);
                queryNode.setPosition(385, 10);
                this.intermediateNodes.push(queryNode);
            }
        } else {
            const queryNode = new QueryExpressionNode(this.context, node, parent);
            queryNode.setPosition(440, 1200);
            this.intermediateNodes.push(queryNode);
            this.isWithinQuery += 1;
        }
    };

    beginVisitSpecificField(node: SpecificField, parent?: STNode) {
        this.specificFields.push(node)
        if (this.isWithinQuery === 0
            && node.valueExpr
            && !STKindChecker.isMappingConstructor(node.valueExpr)
            && !STKindChecker.isListConstructor(node.valueExpr)
        ) {
            const fieldAccessFindingVisitor : FieldAccessFindingVisitor = new FieldAccessFindingVisitor();
            traversNode(node.valueExpr, fieldAccessFindingVisitor);
            const fieldAccesseNodes = fieldAccessFindingVisitor.getFieldAccesseNodes();
            if (fieldAccesseNodes.length > 1){
                const linkConnectorNode = new LinkConnectorNode(this.context, node, parent, fieldAccesseNodes, this.specificFields.slice(0));
                linkConnectorNode.setPosition(440, 1200);
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
        this.specificFields.pop()
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
