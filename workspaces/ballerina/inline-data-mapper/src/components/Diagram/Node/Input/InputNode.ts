/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Point } from "@projectstorm/geometry";

import { useDMCollapsedFieldsStore, useDMSearchStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { IDMType, TypeKind } from "@wso2-enterprise/ballerina-core";
import { getSearchFilteredInput } from "../../utils/search-utils";

export const INPUT_NODE_TYPE = "datamapper-node-input";
const NODE_ID = "input-node";

export class InputNode extends DataMapperNodeModel {
    public dmType: IDMType;
    public numberOfFields:  number;
    public x: number;
    private _paramName: string;
    private _originalType: IDMType;

    constructor(
        public context: IDataMapperContext,
        public value: any,
        public hasNoMatchingFields?: boolean
    ) {
        super(
            NODE_ID,
            context,
            INPUT_NODE_TYPE
        );
        this.numberOfFields = 1;
        if (!hasNoMatchingFields) {
            // this._originalType = this.context.inputTrees
            //     .find(inputTree => getTypeName(inputTree) === this.value.getType().getText());
            this.dmType = this._originalType;
            this._paramName = "this.value.getName()";
        }
    }

    async initPorts() {
        this.numberOfFields = 1;
        this.dmType = this.getSearchFilteredType();
        this.hasNoMatchingFields = !this.dmType;

        if (this.dmType) {
            const collapsedFields = useDMCollapsedFieldsStore.getState().collapsedFields;
            const parentPort = this.addPortsForHeader(this.dmType, this._paramName, "OUT", undefined, collapsedFields);

            if (this.dmType.kind === TypeKind.Record) {
                const fields = this.dmType.fields;
                fields.forEach((subField) => {
                    this.numberOfFields += this.addPortsForInputField(
                        subField, "OUT", this._paramName, this._paramName, '',
                        parentPort, collapsedFields, parentPort.collapsed, subField.optional
                    );
                });
            } else {
                this.addPortsForInputField(
                    this.dmType, "OUT", this._paramName, this._paramName,  '',
                    parentPort, collapsedFields, parentPort.collapsed, this.dmType.optional
                );
            }
        }
    }

    public getSearchFilteredType() {
        if (this.value) {
            const searchValue = useDMSearchStore.getState().inputSearch;

            const matchesParamName = "this.value.getName()".toLowerCase().includes(searchValue?.toLowerCase());
            const type = matchesParamName
                ? this._originalType
                : getSearchFilteredInput(this._originalType, this._paramName);
            return type;
        }
    }

    async initLinks() {
        // Links are always created from "IN" ports by backtracing the inputs.
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
