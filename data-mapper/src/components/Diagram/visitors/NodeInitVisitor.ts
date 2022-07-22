import {
    BinaryExpression,
    ExpressionFunctionBody,
    FunctionDefinition,
    QueryExpression, RecordTypeDesc,
    STKindChecker,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { DataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { SelectionState } from "../../DataMapper/DataMapper";
import {
    AddInputTypeNode,
    AddOutputTypeNode,
    ExpressionFunctionBodyNode,
    QueryExpressionNode,
    RequiredParamNode
} from "../Node";
import { BinaryExpressionNode } from "../Node/BinaryExpression/BinaryExpressionNode";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { RecordTypeDescNode } from "../Node/RecordTypeDesc";
import { SelectClauseNode } from "../Node/SelectClause";
import { isPositionsEquals } from "../utils";

const draftFunctionName = 'XChoreoLCReturnType';

export class NodeInitVisitor implements Visitor {

    private inputNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];

    constructor(
        private context: DataMapperContext,
        private selection: SelectionState
    ) {}

    beginVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode){
        const typeDesc = node.functionSignature.returnTypeDesc?.type;
        const hasOutputTypeDescDefined = STKindChecker.isSimpleNameReference(typeDesc) && !typeDesc.name.isMissing;
        const hasDraftOutputTypeDescDefined = STKindChecker.isSimpleNameReference(typeDesc)
            && STKindChecker.isIdentifierToken(typeDesc.name)
            && typeDesc.name.value === draftFunctionName;

        // create output node
        if (!hasOutputTypeDescDefined || hasDraftOutputTypeDescDefined) {
            this.outputNode = new AddOutputTypeNode(
                this.context
            );
        } else {
            this.outputNode = new ExpressionFunctionBodyNode(
                this.context,
                node.functionBody as ExpressionFunctionBody,
                typeDesc
            );
        }

        this.outputNode.setPosition(1000, 100);

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
        } else {
            const addInputTypeNode = new AddInputTypeNode(
                this.context
            );
            addInputTypeNode.setPosition(100, 100);
            this.inputNodes.push(addInputTypeNode);
        }
    }

    beginVisitBinaryExpression(node: BinaryExpression, parent?: STNode) {
        const binaryNode = new BinaryExpressionNode(this.context, node, parent);
        binaryNode.setPosition(400, 300);
        this.intermediateNodes.push(binaryNode);
    };

    beginVisitQueryExpression?(node: QueryExpression, parent?: STNode) {
        if (isPositionsEquals(node.position, this.selection.selectedST.position)) {
            // create output node
            const outputTypeDesc = this.selection.outST as RecordTypeDesc;
            this.outputNode = new SelectClauseNode(
                this.context,
                node.selectClause,
                outputTypeDesc
            );

            this.outputNode.setPosition(1000, 100);

            // create input nodes
            const inputTypeDesc = this.selection.inST as RecordTypeDesc;
            const recordNode = new RecordTypeDescNode(
                this.context,
                inputTypeDesc
            );
            recordNode.setPosition(100, 100 + 400); // 400 is an arbitary value, need to calculate exact heigt;
            this.inputNodes.push(recordNode);
        } else {
            const queryNode = new QueryExpressionNode(this.context, node, parent);
            queryNode.setPosition(440, 1200);
            this.intermediateNodes.push(queryNode);
        }
    };

    endVisitQueryExpression?(node: QueryExpression, parent?: STNode) {

    };

    endVisitBinaryExpression(node: BinaryExpression, parent?: STNode) {

    };

    endVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
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
