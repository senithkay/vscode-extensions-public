import { RecordTypeDesc, RequiredParam, STKindChecker, traversNode, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { getTypeDefinitionForTypeDesc } from "../../../../utils/st-utils";
import { RecordTypeDescriptors } from "../../utils/record-type-descriptors";
import { RecordTRypeFindingVisitor } from "../../visitors/RecordTypeFindingVisitor";
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

        const visitor = new RecordTRypeFindingVisitor(this.context);
        traversNode(recordTypeDesc, visitor)

		const simpleNameReferneceNodes = visitor.getSimpleNameReferneceNodes()

		const recordTypeDescriptors = RecordTypeDescriptors.getClient();
		await recordTypeDescriptors.retrieveTypeDescriptors(simpleNameReferneceNodes,this.context)
        
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