import { PortModel } from "@projectstorm/react-diagrams-core";
import { RecordField, RecordTypeDesc, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { FormFieldPortModel } from "../Port/model/FormFieldPortModel";
import { STNodePortModel } from "../Port/model/STNodePortModel";

import { DataMapperLinkModel } from "./model/DataMapperLink";

export function canConvertLinkToQueryExpr(link: DataMapperLinkModel): boolean {
    const sourcePort = link.getSourcePort() as PortModel;
    const targetPort = link.getTargetPort() as PortModel;

    if (sourcePort instanceof STNodePortModel && STKindChecker.isRecordField(sourcePort.field)) {
        const fieldType = sourcePort.field.typeName;
        return STKindChecker.isArrayTypeDesc(fieldType) && STKindChecker.isRecordTypeDesc(fieldType.memberTypeDesc);
    } else if (sourcePort instanceof FormFieldPortModel) {
        const formField = sourcePort.field;
        return formField.typeName === 'array' && formField.memberType.typeName === 'record';
    }

    return false;
}

export function generateQueryExpression(srcExpr: string, srcType: RecordTypeDesc, targetType: RecordTypeDesc) {

    const srcFields = srcType.fields.filter((field) => STKindChecker.isRecordField(field)) as RecordField[];

    return `from var item in ${srcExpr}
        select {
            ${srcFields.map((field, index) => `${field.fieldName.value}: ${(index !== srcFields.length - 1) ? ',\n\t\t\t' : ''}`).join("")}
        }
    `
}
