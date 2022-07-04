import { BinaryExpression, ExpressionFunctionBody, FunctionDefinition, QueryExpression, STKindChecker, STNode, Visitor } from "@wso2-enterprise/syntax-tree";
import { langClientPromise } from "../../../stories/utils";
import { DataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { getTypeDefinitionForTypeDesc } from "../../../utils/st-utils";
import { ExpressionFunctionBodyNode, QueryExpressionNode, RequiredParamNode } from "../Node";
import { BinaryExpressionNode } from "../Node/BinaryExpression/BinaryExpressionNode";
import { DataMapperNodeModel } from "../Node/model/DataMapperNode";

export class NodeInitVisitor implements Visitor {

    private inputNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];

    constructor(
        private context: DataMapperContext
    ) {}

    beginVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode){
        // create output node
        const typeDesc = node.functionSignature.returnTypeDesc?.type;
        
        this.outputNode = new ExpressionFunctionBodyNode(
            this.context,
            node.functionBody as ExpressionFunctionBody, 
            typeDesc
        );
        this.outputNode.setPosition(1000, 100);

        // create input nodes
        const params = node.functionSignature.parameters;
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

    beginVisitBinaryExpression(node: BinaryExpression, parent?: STNode) {
        const binaryNode = new BinaryExpressionNode(this.context, node, parent);
        binaryNode.setPosition(400, 300);
        this.intermediateNodes.push(binaryNode);
    };

    beginVisitQueryExpression?(node: QueryExpression, parent?: STNode) {
        const queryNode = new QueryExpressionNode(this.context, node, parent);
        queryNode.setPosition(425, 250);
        this.intermediateNodes.push(queryNode);
    };
    
    endVisitQueryExpression?(node: QueryExpression, parent?: STNode) {

    };

    endVisitBinaryExpression(node: BinaryExpression, parent?: STNode) {

    };

    endVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
    }


    
    getNodes() {
        const nodes = [...this.inputNodes, ...this.intermediateNodes];
        if (this.outputNode) {
            nodes.push(this.outputNode);
        }
        return nodes;
    }
}