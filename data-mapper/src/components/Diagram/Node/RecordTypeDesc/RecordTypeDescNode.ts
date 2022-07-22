import { RecordTypeDesc, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const RECORD_TYPE_DESC_NODE_TYPE = "datamapper-node-record-type-desc";

export class RecordTypeDescNode extends DataMapperNodeModel {
    constructor(
        public context: IDataMapperContext,
		      public value: RecordTypeDesc) {
        super(
            context,
            RECORD_TYPE_DESC_NODE_TYPE
        );
    }

    async initPorts() {
		this.value.fields.forEach((subField) => {
			if (STKindChecker.isRecordField(subField)) {
				this.addPorts(subField, "OUT", "recordTypeDesc");
			}
		});
    }

    async initLinks() {
        // Currently we create links from "IN" ports and back tracing the inputs.
    }
}
