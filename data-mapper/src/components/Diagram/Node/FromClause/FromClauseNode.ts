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
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    CaptureBindingPattern,
    FromClause,
    RecordTypeDesc,
    STKindChecker
} from "@wso2-enterprise/syntax-tree";
import { Point } from "@projectstorm/geometry";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const QUERY_EXPR_SOURCE_NODE_TYPE = "datamapper-node-record-type-desc";
export const EXPANDED_QUERY_SOURCE_PORT_PREFIX = "expandedQueryExpr.source";

export class FromClauseNode extends DataMapperNodeModel {

    public sourceTypeDesc: RecordTypeDesc;
    public typeDef: Type;
    public sourceBindingPattern: CaptureBindingPattern;
    public x: number;
    public y: number;

    constructor(
        public context: IDataMapperContext,
        public value: FromClause) {
        super(
            context,
            QUERY_EXPR_SOURCE_NODE_TYPE
        );
    }

    async initPorts() {
        await this.getSourceType();
        if (this.sourceBindingPattern) {
            const parentId = `${EXPANDED_QUERY_SOURCE_PORT_PREFIX}.${this.sourceBindingPattern.variableName.value}`;

            const parentPort = this.addPortsForHeaderField(this.typeDef, parentId, "OUT", this.context.collapsedFields);

            if (this.typeDef && this.typeDef.typeName === PrimitiveBalType.Record) {
                const fields = this.typeDef.fields;
                fields.forEach((subField) => {
                    this.addPortsForInputRecordField(subField, "OUT", parentId, this.sourceBindingPattern.variableName.value,
                                                parentPort, this.context.collapsedFields, parentPort.collapsed );
                });
            }
        }
    }

    async initLinks() {
        // Currently, we create links from "IN" ports and back tracing the inputs.
    }

    private async getSourceType() {
        const expr = this.value.expression;
        const bindingPattern = this.value.typedBindingPattern.bindingPattern;
        if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
            this.sourceBindingPattern = bindingPattern;

            const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
            const type = recordTypeDescriptors.getTypeDescriptor({
                startLine: expr.position.startLine,
                startColumn: expr.position.startColumn,
                endLine: expr.position.endLine,
                endColumn: expr.position.endColumn
            });
            if (type && type.typeName === PrimitiveBalType.Array) {
                this.typeDef = type.memberType;
            }
        }
    }

    setPosition(point: Point): void;
    setPosition(x: number, y: number): void;
    setPosition(x: unknown, y?: unknown): void {
        if ( typeof x === 'number' && typeof y === 'number'){
            if (!this.x || !this.y){
                this.x = x;
                this.y = y;
                super.setPosition(x,y);
            }
        }
    }
}
