import { QueryExpression, STNode } from "@wso2-enterprise/syntax-tree";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperNodeModel } from "../model/DataMapperNode";

export const QUERY_EXPR_NODE_TYPE = "datamapper-node-query-expr";

export class QueryExpressionNode extends DataMapperNodeModel {
    constructor(
        public context: IDataMapperContext,
		public value: QueryExpression,
        public parentNode: STNode) {
        super(
            context,
            QUERY_EXPR_NODE_TYPE
        );
    }

    initPorts(): void {
        // this.addPorts(this.typeDef.typeDescriptor as RecordTypeDesc, "OUT");
    }

    initLinks(): void {
        // Currently we create links from "IN" ports and back tracing the inputs.
    }
}