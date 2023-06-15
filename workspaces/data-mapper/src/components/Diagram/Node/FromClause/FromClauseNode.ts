/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
import { Point } from "@projectstorm/geometry";
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    CaptureBindingPattern,
    FromClause,
    NodePosition,
    RecordTypeDesc,
    STKindChecker
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { EXPANDED_QUERY_SOURCE_PORT_PREFIX } from "../../utils/constants";
import { getOptionalArrayField, getSearchFilteredInput, getTypeFromStore } from "../../utils/dm-utils";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const QUERY_EXPR_SOURCE_NODE_TYPE = "datamapper-node-record-type-desc";

export class FromClauseNode extends DataMapperNodeModel {

    public sourceTypeDesc: RecordTypeDesc;
    public typeDef: Type;
    public sourceBindingPattern: CaptureBindingPattern;
    public x: number;
    public y: number;
    public numberOfFields:  number;

    constructor(
        public context: IDataMapperContext,
        public value: FromClause) {
        super(
            context,
            QUERY_EXPR_SOURCE_NODE_TYPE
        );
        this.numberOfFields = 1;
    }

    initPorts(): void {
        if (this.sourceBindingPattern) {
            const name = this.sourceBindingPattern.variableName.value;
            if (this.typeDef){
                const parentPort = this.addPortsForHeaderField(this.typeDef, name, "OUT", EXPANDED_QUERY_SOURCE_PORT_PREFIX, this.context.collapsedFields);

                if (this.typeDef.typeName === PrimitiveBalType.Record) {
                    const fields = this.typeDef.fields;
                    fields.forEach((subField) => {
                        this.numberOfFields += this.addPortsForInputRecordField(subField, "OUT", this.sourceBindingPattern.variableName.value,
                            EXPANDED_QUERY_SOURCE_PORT_PREFIX, parentPort,
                            this.context.collapsedFields, parentPort.collapsed);
                    });
                }
            }
        }
    }

    async initLinks() {
        // Currently, we create links from "IN" ports and back tracing the inputs.
    }

    public getSourceType() {
        const bindingPattern = this.value.typedBindingPattern.bindingPattern;
        if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
            this.sourceBindingPattern = bindingPattern;
        }
        let type: Type;
        // tslint:disable-next-line: prefer-conditional-expression
        if (STKindChecker.isBinaryExpression(this.value.expression)
            && STKindChecker.isElvisToken(this.value.expression.operator)) {
            type = getOptionalArrayField(getTypeFromStore(this.value.expression.lhsExpr.position as NodePosition));
        } else {
            type = getTypeFromStore(this.value.expression.position as NodePosition);
        }

        if (type && type?.memberType && type.typeName === PrimitiveBalType.Array) {
            this.typeDef = getSearchFilteredInput(type.memberType, this.sourceBindingPattern?.variableName?.value);
        }
        return this.typeDef;
    }

    setPosition(point: Point): void;
    setPosition(x: number, y: number): void;
    setPosition(x: unknown, y?: unknown): void {
        if (typeof x === 'number' && typeof y === 'number') {
            if (!this.x || !this.y) {
                this.x = x;
                this.y = y;
                super.setPosition(x, y);
            }
        }
    }
}
