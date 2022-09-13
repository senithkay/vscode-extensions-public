import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { RequiredParam } from "@wso2-enterprise/syntax-tree";
import { Point } from "@projectstorm/geometry";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const REQ_PARAM_NODE_TYPE = "datamapper-node-required-param";

export class RequiredParamNode extends DataMapperNodeModel {
    public typeDef: Type;
    public x: number;
    public numberOfFields:  number;

    constructor(
        public context: IDataMapperContext,
        public value: RequiredParam,
        public typeDesc: TypeDescriptor) {
        super(
            context,
            REQ_PARAM_NODE_TYPE
        );
        this.numberOfFields = 0;
    }

    async initPorts() {
        const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
        this.typeDef = recordTypeDescriptors.getTypeDescriptor({
            startLine: this.value.typeName.position.startLine,
            startColumn: this.value.typeName.position.startColumn,
            endLine: this.value.typeName.position.startLine,
            endColumn: this.value.typeName.position.startColumn
        });

        if (this.typeDef && this.typeDef.typeName === PrimitiveBalType.Record) {
            const fields = this.typeDef.fields;
            fields.forEach((subField) => {
                this.numberOfFields += this.addPortsForInputRecordField(subField, "OUT", this.value.paramName.value, this.value.paramName.value);
            });
        }
    }

    async initLinks() {
        // Currently we create links from "IN" ports and back tracing the inputs.
    }

    setPosition(point: Point): void;
    setPosition(x: number, y: number): void;
    setPosition(x: unknown, y?: unknown): void {
        if ( typeof x === 'number' && typeof y === 'number'){
            if (!this.x){
                this.x = x;
            }
            super.setPosition(this.x,y);
        }
    }
}
