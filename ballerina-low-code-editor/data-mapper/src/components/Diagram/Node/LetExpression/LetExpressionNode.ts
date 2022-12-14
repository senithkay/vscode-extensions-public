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
import { LetVarDecl, NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { LET_EXPRESSION_SOURCE_PORT_PREFIX } from "../../utils/constants";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const LET_EXPR_SOURCE_NODE_TYPE = "datamapper-node-type-desc-let-expression";

export class LetExpressionNode extends DataMapperNodeModel {
    public typeDef: Type;
    public varName: string;
    public x: number;
    public numberOfFields:  number;

    constructor(
        public context: IDataMapperContext,
        public value: LetVarDecl) {
        super(
            context,
            LET_EXPR_SOURCE_NODE_TYPE
        );
        this.numberOfFields = 1;
    }

    async initPorts() {
        const bindingPattern = this.value.typedBindingPattern.bindingPattern;

        if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
            this.varName = bindingPattern.variableName.value;
            const exprPosition = this.value.expression.position as NodePosition;

            const typeDescriptors = RecordTypeDescriptorStore.getInstance();
            this.typeDef = typeDescriptors.getTypeDescriptor({
                startLine: exprPosition.startLine,
                startColumn: exprPosition.startColumn,
                endLine: exprPosition.endLine,
                endColumn: exprPosition.endColumn
            });

            if (this.typeDef) {
                const parentPort = this.addPortsForHeaderField(this.typeDef, this.varName, "OUT",
                    LET_EXPRESSION_SOURCE_PORT_PREFIX, this.context.collapsedFields);

                if (this.typeDef.typeName === PrimitiveBalType.Record) {
                    const fields = this.typeDef.fields;
                    fields.forEach((subField) => {
                        this.numberOfFields += this.addPortsForInputRecordField(subField, "OUT",
                            this.varName, LET_EXPRESSION_SOURCE_PORT_PREFIX, parentPort,
                            this.context.collapsedFields, parentPort.collapsed);
                    });
                } else {
                    this.numberOfFields += this.addPortsForInputRecordField(this.typeDef, "OUT",
                        this.varName, LET_EXPRESSION_SOURCE_PORT_PREFIX, parentPort,
                        this.context.collapsedFields, parentPort.collapsed);
                }
            }
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
