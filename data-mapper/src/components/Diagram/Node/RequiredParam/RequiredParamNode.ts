import { RecordTypeDesc, RequiredParam, TypeDefinition } from "@wso2-enterprise/syntax-tree";
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
            REQ_PARAM_NODE_TYPE
        );
    }

    initPorts(): void {
        this.addPorts(this.typeDef.typeDescriptor as RecordTypeDesc, "OUT");
    }

    initLinks(): void {
        // Currently we create links from "IN" ports and back tracing the inputs.
    }
}