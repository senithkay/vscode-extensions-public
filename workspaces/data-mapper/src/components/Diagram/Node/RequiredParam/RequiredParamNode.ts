/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { Point } from "@projectstorm/geometry";
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, RequiredParam } from "@wso2-enterprise/syntax-tree";

import { useDMSearchStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { getSearchFilteredInput, getTypeOfInputParam } from "../../utils/dm-utils";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const REQ_PARAM_NODE_TYPE = "datamapper-node-required-param";

export class RequiredParamNode extends DataMapperNodeModel {
    public typeDef: Type;
    public x: number;
    public numberOfFields:  number;

    constructor(
        public context: IDataMapperContext,
        public value: RequiredParam,
        public typeDesc: TypeDescriptor,
        public hasNoMatchingFields?: boolean) {
        super(
            context,
            REQ_PARAM_NODE_TYPE
        );
        this.numberOfFields = 1;
    }

    async initPorts() {
        this.numberOfFields = 1;
        if (this.typeDef) {
            const parentPort = this.addPortsForHeaderField(this.typeDef, this.value.paramName.value, "OUT", undefined, this.context.collapsedFields);

            if (this.typeDef.typeName === PrimitiveBalType.Record) {
                const fields = this.typeDef.fields;
                fields.forEach((subField) => {
                    this.numberOfFields += this.addPortsForInputRecordField(subField, "OUT", this.value.paramName.value, '',
                        parentPort, this.context.collapsedFields, parentPort.collapsed);
                });
            } else {
                this.addPortsForInputRecordField(this.typeDef, "OUT", this.value.paramName.value,
                    '', parentPort, this.context.collapsedFields, parentPort.collapsed);
            }
        }
    }

    public getSourceType() {
        if (this.value) {
            const searchValue = useDMSearchStore.getState().inputSearch;
            const typeDef = getTypeOfInputParam(this.value, this.context.ballerinaVersion);

            const matchesParamName = this.value?.paramName?.value?.toLowerCase()?.includes(searchValue?.toLowerCase());
            this.typeDef = matchesParamName ? typeDef : getSearchFilteredInput(typeDef,  this.value?.paramName?.value);

            return this.typeDef
        }
    }

    async initLinks() {
        // Currently we create links from "IN" ports and back tracing the inputs.
    }

    setPosition(point: Point): void;
    setPosition(x: number, y: number): void;
    setPosition(x: unknown, y?: unknown): void {
        if (typeof x === 'number' && typeof y === 'number'){
            if (!this.x){
                this.x = x;
            }
            super.setPosition(this.x, y);
        }
    }
}
