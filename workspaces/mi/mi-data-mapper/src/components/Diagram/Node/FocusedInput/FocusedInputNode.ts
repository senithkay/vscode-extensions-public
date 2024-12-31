/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Point } from "@projectstorm/geometry";
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";
import { CallExpression, Node, ParameterDeclaration } from "ts-morph";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { FOCUSED_INPUT_SOURCE_PORT_PREFIX } from "../../utils/constants";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { getSearchFilteredInput } from "../../utils/search-utils";
import { useDMCollapsedFieldsStore } from "../../../../store/store";

export const FOCUSED_INPUT_NODE_TYPE = "datamapper-node-focused-input";
const NODE_ID = "focused-input-node";

export class FocusedInputNode extends DataMapperNodeModel {
    public dmType: DMType;
    public numberOfFields:  number;
    public x: number;
    public y: number;
    public nodeLabel: string;
    public hasNoMatchingFields: boolean;
    public innerParam: ParameterDeclaration;

    constructor(
        public context: IDataMapperContext,
        public value: CallExpression,
        public originalType: DMType
    ) {
        super(
            NODE_ID,
            context,
            FOCUSED_INPUT_NODE_TYPE
        );
        this.dmType = this.originalType;
        this.numberOfFields = 1;

        const firstArg = value.getArguments()[0];

        if (firstArg && Node.isArrowFunction(firstArg)) {
            // Constraint: Inner fuction should have only one parameter.
            this.innerParam = firstArg && firstArg.getParameters()[0];
            this.nodeLabel = this.innerParam && this.innerParam.getName();
        }
    }

    initPorts(): void {
        this.dmType = this.getSearchFilteredType();
        this.hasNoMatchingFields = !this.dmType;

        if (this.dmType) {
            const isCollapsedField = useDMCollapsedFieldsStore.getState().isCollapsedField;
            const parentPort = this.addPortsForHeader(
                this.dmType, this.nodeLabel, "OUT", FOCUSED_INPUT_SOURCE_PORT_PREFIX, isCollapsedField
            );

            if (this.dmType.kind === TypeKind.Interface) {
                const fields = this.dmType.fields;
                fields.forEach((subField) => {
                    this.numberOfFields += this.addPortsForInputField(
                        subField, "OUT", this.nodeLabel, this.nodeLabel, FOCUSED_INPUT_SOURCE_PORT_PREFIX,
                        parentPort, isCollapsedField, parentPort.collapsed, subField.optional
                    );
                });
            } else if (this.dmType.kind === TypeKind.Array) {
                this.dmType.fieldName = this.nodeLabel;
                const arrItemField = { ...this.dmType.memberType, fieldName: `<${this.dmType.fieldName}Item>` };
                this.numberOfFields += this.addPortsForPreviewField(
                    arrItemField, "OUT", this.nodeLabel, this.nodeLabel, FOCUSED_INPUT_SOURCE_PORT_PREFIX,
                    parentPort, isCollapsedField, parentPort.collapsed, arrItemField.optional
                );
            }
        }
    }

    async initLinks() {
        // Links are always created from "IN" ports by backtracing the inputs.
    }

    public getSearchFilteredType() {
        if (this.originalType
            && this.originalType?.memberType
            && this.originalType.kind === TypeKind.Array
        ) {
            return getSearchFilteredInput(this.originalType.memberType, this.nodeLabel);
        }
    }

    setPosition(point: Point): void;
    setPosition(x: number, y: number): void;
    setPosition(x: unknown, y?: unknown): void {
        if (typeof x === 'number' && typeof y === 'number') {
            if (!this.x){
                this.x = x;
            }
            super.setPosition(this.x, y);
        }
    }
}
