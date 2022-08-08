import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { RequiredParam, TypeDefinition } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const REQ_PARAM_NODE_TYPE = "datamapper-node-required-param";

export class RequiredParamNode extends DataMapperNodeModel {
	public typeDef: TypeDefinition;
	public typeDefNew: FormField;
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
		const langClient = await this.context.getEELangClient();
		const res2 = await langClient.getTypeFromSymbol({
			documentIdentifier: {
				uri: `file://${this.context.currentFile.path}`
			},
			positions: [
				{
					line: this.value.typeName.position.startLine,
					offset: this.value.typeName.position.startColumn
				}
			]
		});

	 // tslint:disable-next-line:no-console
	 console.log(JSON.stringify(res2));

		const { type } = res2.types[0];
		this.typeDefNew = type;

		if (type?.typeName && type.typeName === 'record') {
			const fields = type.fields;
			fields.forEach((subField) => {
				this.addPortsForField(subField, "OUT", this.value.paramName.value, this.value.paramName.value);
			});
		}

		// const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
		// await recordTypeDescriptors.retrieveTypeDescriptors(recordTypeDesc, this.context)

    }

 async initLinks() {
        // Currently we create links from "IN" ports and back tracing the inputs.
    }
}
