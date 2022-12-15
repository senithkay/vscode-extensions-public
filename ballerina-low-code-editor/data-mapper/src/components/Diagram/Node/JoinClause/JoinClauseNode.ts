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
import {
    CaptureBindingPattern,
    FieldAccess,
    JoinClause,
    NodePosition,
    RecordTypeDesc,
    SimpleNameReference,
    STKindChecker
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { EXPANDED_QUERY_SOURCE_PORT_PREFIX } from "../../utils/constants";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const QUERY_EXPR_SOURCE_NODE_TYPE = "datamapper-node-record-type-desc-join";

export class JoinClauseNode extends DataMapperNodeModel {

    public sourceTypeDesc: RecordTypeDesc;
    public typeDef: Type;
    public sourceBindingPattern: CaptureBindingPattern;
    public x: number;
    public numberOfFields:  number;

    constructor(
        public context: IDataMapperContext,
        public value: JoinClause) {
        super(
            context,
            QUERY_EXPR_SOURCE_NODE_TYPE
        );
        this.numberOfFields = 1;
    }

    initPorts(): void {
        this.getSourceType();
        if (this.sourceBindingPattern) {
            const name = this.sourceBindingPattern.variableName.value;

            const parentPort = this.addPortsForHeaderField(this.typeDef, name, "OUT", EXPANDED_QUERY_SOURCE_PORT_PREFIX, this.context.collapsedFields);

            if (this.typeDef && (this.typeDef.typeName === PrimitiveBalType.Record)) {
                const fields = this.typeDef.fields;
                fields.forEach((subField) => {
                    this.numberOfFields += this.addPortsForInputRecordField(subField, "OUT", this.sourceBindingPattern.variableName.value,
                        EXPANDED_QUERY_SOURCE_PORT_PREFIX, parentPort,
                         this.context.collapsedFields, parentPort.collapsed);
                });
            } else {
                this.numberOfFields += this.addPortsForInputRecordField(this.typeDef, "OUT", this.sourceBindingPattern.variableName.value,
                        EXPANDED_QUERY_SOURCE_PORT_PREFIX, parentPort,
                         this.context.collapsedFields, parentPort.collapsed);
            }
        }
    }

    async initLinks() {
        // Currently, we create links from "IN" ports and back tracing the inputs.
    }

    private getSourceType() {
        const expr = this.value.expression;
        const bindingPattern = this.value.typedBindingPattern.bindingPattern;
        if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
            this.sourceBindingPattern = bindingPattern;

            let exprPosition: NodePosition;
            if(STKindChecker.isFieldAccess(this.value.joinOnCondition.rhsExpression)){
                exprPosition = (this.value.joinOnCondition.rhsExpression as FieldAccess)?.expression?.position;
            } else if(STKindChecker.isSimpleNameReference(this.value.joinOnCondition.rhsExpression)){
                exprPosition = (this.value.joinOnCondition.rhsExpression as SimpleNameReference)?.position;
            }

            if(exprPosition){
                const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
                const type = recordTypeDescriptors.getTypeDescriptor({
                    startLine: exprPosition.startLine,
                    startColumn: exprPosition.startColumn,
                    endLine: exprPosition.endLine,
                    endColumn: exprPosition.endColumn
                });
                if (type && type.typeName === PrimitiveBalType.Record) {
                    this.typeDef = type;
                } else if (type && type.typeName === PrimitiveBalType.Array) {
                    this.typeDef = type.memberType;
                } else {
                    this.typeDef = {
                        ...type,
                        name: (expr as SimpleNameReference)?.name?.value
                    }
                }
            }

            
        }
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
