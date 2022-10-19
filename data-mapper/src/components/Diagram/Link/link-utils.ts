import { PortModel } from "@projectstorm/react-diagrams-core";
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { RecordFieldPortModel } from "../Port";
import { getBalRecFieldName, getLinebreak } from "../utils/dm-utils";

import { DataMapperLinkModel } from "./model/DataMapperLink";

export function canConvertLinkToQueryExpr(link: DataMapperLinkModel): boolean {
    const sourcePort = link.getSourcePort() as PortModel;

    if (sourcePort instanceof RecordFieldPortModel) {
        const type = sourcePort.field;
        return type.typeName === PrimitiveBalType.Array && type?.memberType && type.memberType.typeName === PrimitiveBalType.Record;
    }

    return false;
}

export function generateQueryExpression(srcExpr: string, targetType: Type) {

    const srcFields = targetType.fields;
    const itemName = `${srcExpr.split('.').pop().trim()}Item`;

    // TODO: Dynamically generate the identifier name instead of 'item'
    return `from var ${itemName} in ${srcExpr}
        select {
            ${targetType.fields.map((field, index) =>
                `${getBalRecFieldName(field.name)}: ${(index !== srcFields.length - 1) ? `,${getLinebreak()}\t\t\t` : ''}`
            ).join("")}
        }`
}
