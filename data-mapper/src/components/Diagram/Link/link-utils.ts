import { RecordField, RecordTypeDesc, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DataMapperPortModel } from "../Port";

import { DataMapperLinkModel } from "./model/DataMapperLink";

export function canConvertLinkToQueryExpr(link: DataMapperLinkModel): boolean {
    const sourcePort = link.getSourcePort() as DataMapperPortModel;
    const targetPort = link.getTargetPort() as DataMapperPortModel;

    if (STKindChecker.isRecordField(sourcePort.field)) {
        const fieldType = sourcePort.field.typeName;
        return STKindChecker.isArrayTypeDesc(fieldType) && STKindChecker.isRecordTypeDesc(fieldType.memberTypeDesc);
    }

    return false;
}

export function generateQueryExpression(srcExpr: string, targetType: RecordTypeDesc) {

    const targetFields = targetType.fields.filter((field) => STKindChecker.isRecordField(field)) as RecordField[];

    // TODO: Dynamically generate the identifier name instead of 'item'
    return `from var item in ${srcExpr}
        select {
            ${targetFields.map((field, index) => `${field.fieldName.value}: ${(index !== targetFields.length - 1) ? ',\n\t\t\t' : ''}`).join("")}
        }
    `
}
