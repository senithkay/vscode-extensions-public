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
    ExpressionFunctionBody,
    LetExpression,
    LetVarDecl,
    NodePosition,
    STKindChecker
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { getLetExpressions } from "../../../DataMapper/LocalVarConfigPanel/local-var-mgt-utils";
import { LET_EXPRESSION_SOURCE_PORT_PREFIX } from "../../utils/constants";
import { getTypeFromStore } from "../../utils/dm-utils";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const LET_EXPR_SOURCE_NODE_TYPE = "datamapper-node-type-desc-let-expression";

export interface DMLetVarDecl {
    varName: string;
    type: Type;
    declaration: LetVarDecl;
}

export class LetExpressionNode extends DataMapperNodeModel {
    public letExpr: LetExpression;
    public letVarDecls: DMLetVarDecl[];
    public x: number;
    public numberOfFields:  number;

    constructor(
        public context: IDataMapperContext,
        public value: ExpressionFunctionBody) {
        super(
            context,
            LET_EXPR_SOURCE_NODE_TYPE
        );
        this.numberOfFields = 1;
        this.letVarDecls = [];
    }

    async initPorts() {
        if (!STKindChecker.isLetExpression(this.value.expression)) {
            return;
        }
        this.letExpr = this.value.expression;
        const letExpressions = getLetExpressions(this.letExpr);

        letExpressions.forEach(expr => {
            const letVarDecls = expr.letVarDeclarations;
            letVarDecls.forEach(decl => {
                if (STKindChecker.isLetVarDecl(decl)) {
                    const bindingPattern = decl.typedBindingPattern.bindingPattern;

                    if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
                        const varName = bindingPattern.variableName.value;
                        const exprPosition = decl.expression.position as NodePosition;

                        const type = getTypeFromStore(exprPosition);

                        const parentPort = this.addPortsForHeaderField(type, varName, "OUT",
                            LET_EXPRESSION_SOURCE_PORT_PREFIX, this.context.collapsedFields);

                        if (type && (type.typeName === PrimitiveBalType.Record)) {
                            const fields = type.fields;
                            fields.forEach((subField) => {
                                this.numberOfFields += this.addPortsForInputRecordField(subField, "OUT",
                                    varName, LET_EXPRESSION_SOURCE_PORT_PREFIX, parentPort,
                                    this.context.collapsedFields, parentPort.collapsed);
                            });
                        } else {
                            this.numberOfFields += this.addPortsForInputRecordField(type, "OUT",
                                varName, LET_EXPRESSION_SOURCE_PORT_PREFIX, parentPort,
                                this.context.collapsedFields, parentPort.collapsed);
                        }

                        this.letVarDecls.push({varName, type, declaration: decl});
                    }
                }
            });
        });
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
