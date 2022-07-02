import { BinaryExpression, ExpressionFunctionBody, FunctionDefinition, STKindChecker, STNode, Visitor } from "@wso2-enterprise/syntax-tree";
import { langClientPromise } from "../../../stories/utils";
import { DataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { getTypeDefinitionForTypeDesc } from "../../../utils/st-utils";
import { ExpressionFunctionBodyNode, RequiredParamNode } from "../Node";
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
        // const typeDef = await getTypeDefinitionForTypeDesc(this.context.filePath, typeDesc, langClientPromise);
        
        this.outputNode = new ExpressionFunctionBodyNode(
            this.context,
            node.functionBody as ExpressionFunctionBody, // TODO fix once we support other forms of functions
            typeDesc
        );
        this.outputNode.setPosition(800, 100);

        // create input nodes
        const params = node.functionSignature.parameters;
        for (let i = 0; i < params.length; i++) {
            const param = params[i];
            if (STKindChecker.isRequiredParam(param)) {
                // const paramTypeDef = await getTypeDefinitionForTypeDesc(this.context.filePath, param.typeName, langClientPromise);
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
        const binaryNode = new BinaryExpressionNode(this.context, node);
        binaryNode.setPosition(400, 200);
        this.intermediateNodes.push(binaryNode);
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