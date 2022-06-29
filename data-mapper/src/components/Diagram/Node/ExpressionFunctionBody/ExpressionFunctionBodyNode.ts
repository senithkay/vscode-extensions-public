import { ExpressionFunctionBody, RequiredParam, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperNodeModel } from "../model/DataMapperNode";
 
export const EXPR_FN_BODY_NODE_TYPE = "datamapper-node-expression-fn-body";

export class ExpressionFunctionBodyNode extends DataMapperNodeModel {
    constructor(
        public context: IDataMapperContext,
		public value: ExpressionFunctionBody,
		public typeDef: TypeDefinition) {
        super(
            context,
            value,
            typeDef,
            false,
            true,
            EXPR_FN_BODY_NODE_TYPE
        );
    }
}