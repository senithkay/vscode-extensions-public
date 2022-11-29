import { Point } from "@projectstorm/geometry";
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, RequiredParam, STKindChecker } from "@wso2-enterprise/syntax-tree";

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
        this.numberOfFields = 1;
    }

    initPorts(): void {
        const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
        const paramPosition = STKindChecker.isQualifiedNameReference(this.value.typeName)
            ? this.value.typeName.identifier.position as NodePosition
            : this.value.typeName.position as NodePosition;
        this.typeDef = recordTypeDescriptors.getTypeDescriptor({
            startLine: paramPosition.startLine,
            startColumn: paramPosition.startColumn,
            endLine: paramPosition.startLine,
            endColumn: paramPosition.startColumn
        });

        if (this.typeDef) {
            const parentPort = this.addPortsForHeaderField(this.typeDef, this.value.paramName.value, "OUT", undefined, this.context.collapsedFields);

            if (this.typeDef.typeName === PrimitiveBalType.Record) {
                const fields = this.typeDef.fields;
                fields.forEach((subField) => {
                    this.numberOfFields += this.addPortsForInputRecordField(subField, "OUT", this.value.paramName.value, '',
                        parentPort, this.context.collapsedFields, parentPort.collapsed);
                });
            } else {
                this.numberOfFields += this.addPortsForInputRecordField(this.typeDef, "OUT", this.value.paramName.value,
                    '', parentPort, this.context.collapsedFields, parentPort.collapsed);
            }
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
