/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { ExpressionRange, PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ExpressionFunctionBody,
    NodePosition,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { isPositionsEquals } from "../../../../utils/st-utils";
import { MODULE_VARIABLE_SOURCE_PORT_PREFIX } from "../../utils/constants";
import { getModuleVariables } from "../../utils/dm-utils";
import { getTypesForExpressions } from "../../utils/ls-utils";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const MODULE_VAR_SOURCE_NODE_TYPE = "datamapper-node-type-desc-module-variable";

export enum ModuleVarKind {
    Variable,
    Configurable,
    Constant
}

export interface DMModuleVarDecl {
    varName: string;
    kind: ModuleVarKind;
    type: Type;
    node: STNode;
}

export class ModuleVariableNode extends DataMapperNodeModel {
    public moduleVarDecls: DMModuleVarDecl[];
    public x: number;
    public numberOfFields:  number;

    constructor(
        public context: IDataMapperContext,
        public value: ExpressionFunctionBody) {
        super(
            context,
            MODULE_VAR_SOURCE_NODE_TYPE
        );
        this.numberOfFields = 1;
        this.moduleVarDecls = [];
    }

    async initPorts() {
        let exprBody: STNode = this.value;
        if (STKindChecker.isLetExpression(this.value.expression)) {
            exprBody = this.value.expression.expression;
        }
        const moduleVariables = getModuleVariables(exprBody, this.context.stSymbolInfo);
        const exprRanges: ExpressionRange[] = [...moduleVariables].map(([, item]) => {
            const exprPosition: NodePosition = item.node.position as NodePosition;
            return {
                startLine: {
                    line: exprPosition.startLine,
                    offset: exprPosition.startColumn
                },
                endLine: {
                    line: exprPosition.endLine,
                    offset: exprPosition.endColumn
                }
            };
        });
        const types = await getTypesForExpressions(this.context.filePath, this.context.langClientPromise, exprRanges);
        this.moduleVarDecls = [...moduleVariables].map(([varName, item]) => {
            return {
                varName,
                kind: item.kind,
                node: item.node,
                type: types.find(type => isPositionsEquals(item.node.position, {
                    startLine: type.requestedRange.startLine.line,
                    startColumn: type.requestedRange.startLine.offset,
                    endLine: type.requestedRange.endLine.line,
                    endColumn: type.requestedRange.endLine.offset,
                })).type
            }
        });

        this.moduleVarDecls.forEach(moduleVar => {
            const { varName, type } = moduleVar;

            const parentPort = this.addPortsForHeaderField(type, varName, "OUT",
                MODULE_VARIABLE_SOURCE_PORT_PREFIX, this.context.collapsedFields);

            if (type && (type.typeName === PrimitiveBalType.Record)) {
                const fields = type.fields;
                fields.forEach((subField) => {
                    this.numberOfFields += this.addPortsForInputRecordField(subField, "OUT",
                        varName, MODULE_VARIABLE_SOURCE_PORT_PREFIX, parentPort,
                        this.context.collapsedFields, parentPort.collapsed);
                });
            } else {
                this.numberOfFields += this.addPortsForInputRecordField(type, "OUT",
                    varName, MODULE_VARIABLE_SOURCE_PORT_PREFIX, parentPort,
                    this.context.collapsedFields, parentPort.collapsed);
            }
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
