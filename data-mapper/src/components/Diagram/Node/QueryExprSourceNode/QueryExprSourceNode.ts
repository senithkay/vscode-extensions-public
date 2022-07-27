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
import {
    CaptureBindingPattern,
    FieldAccess,
    FromClause,
    RecordTypeDesc,
    STKindChecker
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { getTypeDescForFieldName } from "../../../../utils/st-utils";
import { DataMapperPortModel } from "../../Port";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const QUERY_EXPR_SOURCE_NODE_TYPE = "datamapper-node-record-type-desc";
export const EXPANDED_QUERY_SOURCE_PORT_PREFIX = "expandedQueryExpr.source";

export class QueryExprSourceNode extends DataMapperNodeModel {

    public sourceTypeDesc: RecordTypeDesc;
    public sourceBindingPattern: CaptureBindingPattern;
    public sourcePort: DataMapperPortModel;
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
            this.sourceTypeDesc.fields.forEach((field) => {
                if (STKindChecker.isRecordField(field)) {
                    this.addPorts(field, "OUT", parentId, this.sourceBindingPattern.variableName.value);
                }
            });
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
            if (STKindChecker.isFieldAccess(expr)) {
                this.sourceTypeDesc = await getTypeDescForFieldName(expr.fieldName, this.context);
            }
        }
    }
}
