import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { RequiredParam } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const REQ_PARAM_NODE_TYPE = "datamapper-node-required-param";

export class RequiredParamNode extends DataMapperNodeModel {
    public typeDef: FormField;

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
        const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
        this.typeDef = recordTypeDescriptors.getTypeDescriptor({
            name: this.value.typeName.source.trim(),
            position: {
                startLine: this.value.typeName.position.startLine,
                startColumn: this.value.typeName.position.startColumn,
                endLine: this.value.typeName.position.startLine,
                endColumn: this.value.typeName.position.startColumn
            }
        });

        if (this.typeDef && this.typeDef.typeName === 'record') {
            const fields = this.typeDef.fields;
            fields.forEach((subField) => {
                this.addPortsForFormField(subField, "OUT", this.value.paramName.value, this.value.paramName.value);
            });
        }
    }

    async initLinks() {
        // Currently we create links from "IN" ports and back tracing the inputs.
    }
}
