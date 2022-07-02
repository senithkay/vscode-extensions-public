import { ExpressionFunctionBody, FunctionDefinition, STKindChecker, STNode, Visitor } from "@wso2-enterprise/syntax-tree";
import { langClientPromise } from "../../../stories/utils";
import { DataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { getTypeDefinitionForTypeDesc } from "../../../utils/st-utils";
import { ExpressionFunctionBodyNode, RequiredParamNode } from "../Node";
import { DataMapperNodeModel } from "../Node/model/DataMapperNode";

export class NodeInitVisitor implements Visitor {

    private inputNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];

    constructor(
        private context: DataMapperContext
    ) {}

    async beginVisitFunctionDefinition?(node: FunctionDefinition, parent?: STNode): Promise<void> {
        // create output node
        const typeDesc = node.functionSignature.returnTypeDesc?.type;
        const typeDef = await getTypeDefinitionForTypeDesc(this.context.filePath, typeDesc, langClientPromise);
        
        this.outputNode = new ExpressionFunctionBodyNode(
            this.context,
            node.functionBody as ExpressionFunctionBody, // TODO fix once we support other forms of functions
            typeDef
        );
        this.outputNode.setPosition(800, 100);

        // create input nodes
        const params = node.functionSignature.parameters;
        for (let i = 0; i < params.length; i++) {
            const param = params[i];
            if (STKindChecker.isRequiredParam(param)) {
                const paramTypeDef = await getTypeDefinitionForTypeDesc(this.context.filePath, param.typeName, langClientPromise);
                const paramNode = new RequiredParamNode(
                    this.context,
                    param,
                    paramTypeDef
                );
                paramNode.setPosition(100, 100 + i * 400); // 400 is an arbitary value, need to calculate exact heigt;
                this.inputNodes.push(paramNode);
            } else {
                // TODO for other param types
            }
        }
    }

    endVisitFunctionDefinition?(node: FunctionDefinition, parent?: STNode): void {

    }
    
    getNodes() {
        const nodes = [...this.inputNodes, ...this.intermediateNodes];
        if (this.outputNode) {
            nodes.push(this.outputNode);
        }
        return nodes;
    }
}