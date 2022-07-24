import { RecordTypeDesc, RequiredParam, STKindChecker, traversNode, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { getTypeDefinitionForTypeDesc } from "../../../../utils/st-utils";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { RecordTypeFindingVisitor } from "../../visitors/RecordTypeFindingVisitor";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const REQ_PARAM_NODE_TYPE = "datamapper-node-required-param";

export class RequiredParamNode extends DataMapperNodeModel {
	public typeDef: TypeDefinition;
    constructor(
        public context: IDataMapperContext,
		public value: RequiredParam,
		public typeDesc: TypeDescriptor) {
        super(
            context,
            REQ_PARAM_NODE_TYPE
        );
    }

    async initPorts() {
        this.typeDef = await getTypeDefinitionForTypeDesc(this.typeDesc, this.context);
        const recordTypeDesc = this.typeDef.typeDescriptor as RecordTypeDesc;

		const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
		await recordTypeDescriptors.retrieveTypeDescriptors(recordTypeDesc, this.context)
        
		recordTypeDesc.fields.forEach((subField) => {
			if (STKindChecker.isRecordField(subField)) {
				this.addPorts(subField, "OUT", this.value.paramName.value, this.value.paramName.value);
			}
		});
    }

    async initLinks() {
        // Currently we create links from "IN" ports and back tracing the inputs.
    }
}