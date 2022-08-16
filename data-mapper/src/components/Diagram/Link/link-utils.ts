import { PortModel } from "@projectstorm/react-diagrams-core";
import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";

import { FormFieldPortModel, STNodePortModel } from "../Port";

import { DataMapperLinkModel } from "./model/DataMapperLink";

export function canConvertLinkToQueryExpr(link: DataMapperLinkModel): boolean {
    const sourcePort = link.getSourcePort() as PortModel;

    if (sourcePort instanceof STNodePortModel && STKindChecker.isRecordField(sourcePort.field)) {
        const fieldType = sourcePort.field.typeName;
        return STKindChecker.isArrayTypeDesc(fieldType) && STKindChecker.isRecordTypeDesc(fieldType.memberTypeDesc);
    } else if (sourcePort instanceof FormFieldPortModel) {
        const formField = sourcePort.field;
        return formField.typeName === 'array' && formField.memberType.typeName === 'record';
    }

    return false;
}

export function generateQueryExpression(srcExpr: string, targetType: FormField) {

    const srcFields = targetType.fields;

    // TODO: Dynamically generate the identifier name instead of 'item'
    return `from var item in ${srcExpr}
        select {
            ${targetType.fields.map((field, index) => `${field.name}: ${(index !== srcFields.length - 1) ? ',\n\t\t\t' : ''}`).join("")}
        }
    `
}
