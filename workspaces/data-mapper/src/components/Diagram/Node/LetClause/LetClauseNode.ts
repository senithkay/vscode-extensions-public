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
    LetClause,
    LetVarDecl,
    NodePosition,
    RecordTypeDesc,
    SimpleNameReference,
    STKindChecker
} from "@wso2-enterprise/syntax-tree";

import { useDMSearchStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { EXPANDED_QUERY_SOURCE_PORT_PREFIX } from "../../utils/constants";
import { getFilteredSubFields, getSearchFilteredInput } from "../../utils/dm-utils";
import { TypeDescriptorStore } from "../../utils/type-descriptor-store";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const QUERY_EXPR_SOURCE_NODE_TYPE = "datamapper-node-record-type-desc-let";

export class LetClauseNode extends DataMapperNodeModel {

    public sourceTypeDesc: RecordTypeDesc;
    public typeDef: Type;
    public sourceBindingPattern: CaptureBindingPattern;
    public x: number;
    public numberOfFields:  number;

    constructor(
        public context: IDataMapperContext,
        public value: LetClause) {
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

                if (this.typeDef && (this.typeDef.typeName === PrimitiveBalType.Record)) {
                    const fields = this.typeDef.fields;
                    fields.forEach((subField) => {
                        this.numberOfFields += this.addPortsForInputRecordField(subField, "OUT", this.sourceBindingPattern.variableName.value,
                            EXPANDED_QUERY_SOURCE_PORT_PREFIX, parentPort,
                            this.context.collapsedFields, parentPort.collapsed);
                    });
                } else {
                    this.addPortsForInputRecordField(this.typeDef, "OUT", this.sourceBindingPattern.variableName.value,
                            EXPANDED_QUERY_SOURCE_PORT_PREFIX, parentPort,
                            this.context.collapsedFields, parentPort.collapsed);
                }
            }
        }
    }

    async initLinks() {
        // Currently, we create links from "IN" ports and back tracing the inputs.
    }

    public getSourceType() {
        const expr = (this.value.letVarDeclarations[0] as LetVarDecl)?.expression;
        const bindingPattern = (this.value.letVarDeclarations[0] as LetVarDecl)?.typedBindingPattern.bindingPattern;
        if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
            this.sourceBindingPattern = bindingPattern;
            const exprPosition = expr.position as NodePosition;

            const recordTypeDescriptors = TypeDescriptorStore.getInstance();
            const type = recordTypeDescriptors.getTypeDescriptor({
                startLine: exprPosition.startLine,
                startColumn: exprPosition.startColumn,
                endLine: exprPosition.endLine,
                endColumn: exprPosition.endColumn
            });
            if (type){
                const name = this.sourceBindingPattern.variableName.value;
                const isRecordOrArray = type.typeName === PrimitiveBalType.Record || type.typeName === PrimitiveBalType.Array;
                this.typeDef = getSearchFilteredInput(isRecordOrArray ? type : {...type, name: (expr as SimpleNameReference)?.name?.value}, name)
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
