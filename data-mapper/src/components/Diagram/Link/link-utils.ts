import { PortModel } from "@projectstorm/react-diagrams-core";
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";

import { RecordFieldPortModel } from "../Port";

import { DataMapperLinkModel } from "./model/DataMapperLink";

export function canConvertLinkToQueryExpr(link: DataMapperLinkModel): boolean {
    const sourcePort = link.getSourcePort() as PortModel;

    if (sourcePort instanceof RecordFieldPortModel) {
        const type = sourcePort.field;
        return type.typeName === PrimitiveBalType.Array && type.memberType.typeName === PrimitiveBalType.Record;
    }

    return false;
}

export function generateQueryExpression(srcExpr: string, targetType: Type) {

    const srcFields = targetType.fields;

    // TODO: Dynamically generate the identifier name instead of 'item'
    return `from var item in ${srcExpr}
        select {
            ${targetType.fields.map((field, index) => `${field.name}: ${(index !== srcFields.length - 1) ? ',\n\t\t\t' : ''}`).join("")}
        }`
}
