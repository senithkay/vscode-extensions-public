import { RequiredParam, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperNodeModel } from "../model/DataMapperNode";

export const REQ_PARAM_NODE_TYPE = "datamapper-node-required-param";

export class RequiredParamNode extends DataMapperNodeModel {
    constructor(
        public context: IDataMapperContext,
		public value: RequiredParam,
		public typeDef: TypeDefinition) {
        super(
            context,
            value,
            typeDef,
            true,
            false,
            REQ_PARAM_NODE_TYPE
        );
    }
}