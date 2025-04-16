/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Point } from "@projectstorm/geometry";
import { PrimitiveBalType, TypeField } from "@wso2-enterprise/ballerina-core";
import {
    CaptureBindingPattern,
    FieldAccess,
    JoinClause,
    NodePosition,
    OptionalFieldAccess,
    RecordTypeDesc,
    SimpleNameReference,
    STKindChecker
} from "@wso2-enterprise/syntax-tree";

import { useDMSearchStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { EXPANDED_QUERY_SOURCE_PORT_PREFIX } from "../../utils/constants";
import { getFilteredSubFields, getOptionalRecordField, getSearchFilteredInput } from "../../utils/dm-utils";
import { TypeDescriptorStore } from "../../utils/type-descriptor-store";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const QUERY_EXPR_JOIN_NODE_TYPE = "datamapper-node-record-type-desc-join";
const NODE_ID = "query-expr-join-node";

export class JoinClauseNode extends DataMapperNodeModel {

    public sourceTypeDesc: RecordTypeDesc;
    public typeDef: TypeField;
    public sourceBindingPattern: CaptureBindingPattern;
    public isOptional: boolean;
    public x: number;
    public numberOfFields:  number;

    constructor(
        public context: IDataMapperContext,
        public value: JoinClause) {
        super(
            `${NODE_ID}-${value.typedBindingPattern.bindingPattern.source.trim()}`,
            context,
            QUERY_EXPR_JOIN_NODE_TYPE
        );
        this.numberOfFields = 1;
    }

    initPorts(): void {
        if (this.sourceBindingPattern) {
            let name = this.sourceBindingPattern.variableName.value;
            if (this.isOptional && [PrimitiveBalType.Array, PrimitiveBalType.Record, PrimitiveBalType.Union].includes(this.typeDef.typeName as PrimitiveBalType)){
                name = `${name}?`
            }

            if (this.typeDef){
                const parentPort = this.addPortsForHeaderField(this.typeDef, name, "OUT", EXPANDED_QUERY_SOURCE_PORT_PREFIX, this.context.collapsedFields);

                const optionalRecordField = getOptionalRecordField(this.typeDef);
                if (optionalRecordField) {
                    optionalRecordField?.fields.forEach((subField) => {
                        this.numberOfFields += this.addPortsForInputRecordField(
                            subField, "OUT", name, name, EXPANDED_QUERY_SOURCE_PORT_PREFIX,
                            parentPort, this.context.collapsedFields, parentPort.collapsed, true
                        );
                    });
                } else if (this.typeDef.typeName === PrimitiveBalType.Record) {
                    const fields = this.typeDef.fields;
                    fields.forEach((subField) => {
                        this.numberOfFields += this.addPortsForInputRecordField(
                            subField, "OUT", name, name, EXPANDED_QUERY_SOURCE_PORT_PREFIX,
                                parentPort, this.context.collapsedFields, parentPort.collapsed
                            );
                    });
                } else {
                    this.numberOfFields += this.addPortsForInputRecordField(
                        this.typeDef, "OUT", name, name, EXPANDED_QUERY_SOURCE_PORT_PREFIX,
                            parentPort, this.context.collapsedFields, parentPort.collapsed
                        );
                }
            }
        }
    }

    async initLinks() {
        // Currently, we create links from "IN" ports and back tracing the inputs.
    }

    public getSourceType() {
        const expr = this.value.expression;
        const bindingPattern = this.value.typedBindingPattern.bindingPattern;
        if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
            this.sourceBindingPattern = bindingPattern;

            let exprPosition: NodePosition;
            if (STKindChecker.isFieldAccess(this.value.joinOnCondition.rhsExpression)){
                exprPosition = (this.value.joinOnCondition.rhsExpression as FieldAccess)?.expression?.position;
            } else if (STKindChecker.isSimpleNameReference(this.value.joinOnCondition.rhsExpression)){
                exprPosition = (this.value.joinOnCondition.rhsExpression as SimpleNameReference)?.position;
            } else if (STKindChecker.isOptionalFieldAccess(this.value.joinOnCondition.rhsExpression)){
                exprPosition = (this.value.joinOnCondition.rhsExpression as OptionalFieldAccess)?.expression?.position;
            }

            if (exprPosition){
                const recordTypeDescriptors = TypeDescriptorStore.getInstance();
                const type = recordTypeDescriptors.getTypeDescriptor({
                    startLine: exprPosition.startLine,
                    startColumn: exprPosition.startColumn,
                    endLine: exprPosition.endLine,
                    endColumn: exprPosition.endColumn
                });
                const optionalRecordField = getOptionalRecordField(type);
                const name = this.sourceBindingPattern.variableName.value;
                if (optionalRecordField) {
                    this.typeDef = getSearchFilteredInput({ ...optionalRecordField, optional: true }, name);
                }else if (type && type.typeName === PrimitiveBalType.Record) {
                    this.typeDef = getSearchFilteredInput(type, name);
                } else if (type && type.typeName === PrimitiveBalType.Array) {
                    this.typeDef = getSearchFilteredInput(type.memberType, name);
                } else {
                    this.typeDef = getSearchFilteredInput({ ...type, name: (expr as SimpleNameReference)?.name?.value }, name)
                }
            }
        }
        return this.typeDef;
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
