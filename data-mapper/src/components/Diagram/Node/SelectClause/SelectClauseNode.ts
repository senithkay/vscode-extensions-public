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
// tslint:disable: jsx-no-multiline-js
import {
    ExpressionFunctionBody,
    FieldAccess,
    MappingConstructor,
    RecordField,
    RecordTypeDesc,
    RequiredParam,
    SelectClause,
    SimpleNameReference,
    SpecificField,
    STKindChecker,
    TypeDefinition
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { getTypeDefinitionForTypeDesc } from "../../../../utils/st-utils";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import { DataMapperPortModel } from "../../Port";
import { getFieldNames } from "../../utils";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";
import { QUERY_TARGET_PORT_PREFIX } from "../QueryExpression";
import { RequiredParamNode } from "../RequiredParam";

export const SELECT_CLAUSE_NODE_TYPE = "datamapper-node-select-clause";

export class SelectClauseNode extends DataMapperNodeModel {

    public typeDef: TypeDefinition;

    constructor(
        public context: IDataMapperContext,
        public value: SelectClause,
        public typeDesc: TypeDescriptor) {
        super(
            context,
            SELECT_CLAUSE_NODE_TYPE
        );
    }

    async initPorts() {
        if (STKindChecker.isMappingConstructor(this.value.expression)) {
            this.value.expression.fields.forEach((field) => {
                if (STKindChecker.isSpecificField(field)) {
                    // this.addPorts(field, "IN", "selectClause");
                    this.addPortsForSpecificField(field, "IN", QUERY_TARGET_PORT_PREFIX);
                }
            });
        }
        this.typeDef = await getTypeDefinitionForTypeDesc(this.typeDesc, this.context);
        const recordTypeDesc = this.typeDef.typeDescriptor as RecordTypeDesc;
        recordTypeDesc.fields.forEach((subField) => {
            if (STKindChecker.isRecordField(subField)) {
                this.addPorts(subField, "IN", "selectClauseBody");
            }
        });
    }

    async initLinks() {
        const mappings = this.genMappings(this.value.expression as MappingConstructor);
        this.createLinks(mappings);
    }

    private createLinks(mappings: FieldAccessToSpecificFied[]) {
        mappings.forEach((mapping) => {
            const {fields, value, otherVal} = mapping;
            if (!value) {
                // tslint:disable-next-line:no-console
                console.log("Unsupported mapping.");
                return;
            }
            const inputNode = this.getInputNodeExpr(value);
            let inPort: DataMapperPortModel;
            if (inputNode) {
                inPort = this.getInputPortsForExpr(inputNode, value);
            }
            const outPort = this.getOutputPortForField(fields);
            const lm = new DataMapperLinkModel(value);
            lm.addLabel(new ExpressionLabelModel({
                value: otherVal?.source || value.source,
                valueNode: otherVal || value,
                context: this.context,
                link: lm
            }));
            lm.setTargetPort(outPort);
            lm.setSourcePort(inPort);
            lm.registerListener({
                selectionChanged(event) {
                    if (event.isSelected) {
                        inPort.fireEvent({}, "link-selected");
                        outPort.fireEvent({}, "link-selected");
                    } else {
                        inPort.fireEvent({}, "link-unselected");
                        outPort.fireEvent({}, "link-unselected");
                    }
                },
            })
            this.getModel().addAll(lm);
        });
    }

    private getOutputPortForField(fields: SpecificField[]) {
        let nextTypeNode = this.typeDef.typeDescriptor as RecordTypeDesc;
        let recField: RecordField;
        let portIdBuffer = "exprFunctionBody";
        for (let i = 0; i < fields.length; i++) {
            const specificField = fields[i];
            portIdBuffer += `.${specificField.fieldName.value}`
            const recFieldTemp = nextTypeNode.fields.find(
                (recF) => STKindChecker.isRecordField(recF) && recF.fieldName.value === specificField.fieldName.value);
            if (recFieldTemp) {
                if (i === fields.length - 1) {
                    recField = recFieldTemp as RecordField;
                } else if (STKindChecker.isRecordTypeDesc(recFieldTemp.typeName)) {
                    nextTypeNode = recFieldTemp.typeName
                }
            }
        }
        if (recField) {
            const portId = portIdBuffer + ".IN";
            const outPort = this.getPort(portId);
            return outPort;
        }
    }

    // Improve to return multiple ports for complex expressions
    private getInputPortsForExpr(node: RequiredParamNode, expr: FieldAccess | SimpleNameReference) {
        const typeDesc = node.typeDef.typeDescriptor;
        let portIdBuffer = node.value.paramName.value;
        if (STKindChecker.isRecordTypeDesc(typeDesc)) {
            if (STKindChecker.isFieldAccess(expr)) {
                const fieldNames = getFieldNames(expr);
                let nextTypeNode: RecordTypeDesc = typeDesc;
                for (let i = 1; i < fieldNames.length; i++) { // Note i = 1 as we omit param name
                    const fieldName = fieldNames[i];
                    portIdBuffer += `.${fieldName}`;
                    const recField = nextTypeNode.fields.find(
                        (field) => STKindChecker.isRecordField(field) && field.fieldName.value === fieldName);
                    if (recField) {
                        if (i === fieldNames.length - 1) {
                            const portId = portIdBuffer + ".OUT";
                            const port = (node.getPort(portId) as DataMapperPortModel);
                            return port;
                        } else if (STKindChecker.isRecordTypeDesc(recField.typeName)) {
                            nextTypeNode = recField.typeName;
                        }
                    }
                }
            } else {
                // handle this when direct mapping parameters is enabled
            }
        }
    }

    private getInputNodeExpr(expr: FieldAccess | SimpleNameReference) {
        const nameRef = STKindChecker.isSimpleNameReference(expr) ? expr : undefined;
        if (!nameRef && STKindChecker.isFieldAccess(expr)) {
            let valueExpr = expr.expression;
            while (valueExpr && STKindChecker.isFieldAccess(valueExpr)) {
                valueExpr = valueExpr.expression;
            }
            if (valueExpr && STKindChecker.isSimpleNameReference(valueExpr)) {
                const paramNode = this.context.functionST.functionSignature.parameters
                    .find((param) =>
                        STKindChecker.isRequiredParam(param)
                        && param.paramName?.value === (valueExpr as SimpleNameReference).name.value
                    ) as RequiredParam;
                return this.findNodeByValueNode(paramNode);
            }
        }
    }

    private findNodeByValueNode(value: ExpressionFunctionBody | RequiredParam): RequiredParamNode {
        let foundNode: RequiredParamNode;
        this.getModel().getNodes().find((node) => {
            if (STKindChecker.isRequiredParam(value)
                && node instanceof RequiredParamNode
                && STKindChecker.isRequiredParam(node.value)
                && value.paramName.value === node.value.paramName.value) {
                foundNode = node;
            }
        });
        return foundNode;
    }
}
