import { BinaryExpression, STNode, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const BINARY_EXPR_NODE_TYPE = "datamapper-node-binary-expr";

export class BinaryExpressionNode extends DataMapperNodeModel {
    constructor(
        public context: IDataMapperContext,
		public value: BinaryExpression,
        public parentNode: STNode) {
        super(
            context,
            BINARY_EXPR_NODE_TYPE
        );
    }

    initPorts(): void {
        // this.addPorts(this.typeDef.typeDescriptor as RecordTypeDesc, "OUT");
    }

    initLinks(): void {
        // Currently we create links from "IN" ports and back tracing the inputs.
    }
}