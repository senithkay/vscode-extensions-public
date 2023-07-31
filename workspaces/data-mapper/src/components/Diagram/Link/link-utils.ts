import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { RecordFieldPortModel } from "../Port";
import {
    findTypeByInfoFromStore,
    genVariableName,
    getBalRecFieldName,
    getDefaultValue,
    getLinebreak
} from "../utils/dm-utils";

import { DataMapperLinkModel } from "./model/DataMapperLink";

export function canConvertLinkToQueryExpr(link: DataMapperLinkModel): boolean {
    const sourcePort = link.getSourcePort() ;

    if (sourcePort instanceof RecordFieldPortModel) {
        return sourcePort.field.typeName === PrimitiveBalType.Array;
    }

    return false;
}

export function generateQueryExpression(srcExpr: string, targetType: Type, isOptionalSource: boolean, variableNames: string[]) {

    let itemName = `${srcExpr.split('.').pop().trim()}Item`;
    itemName = genVariableName(itemName, variableNames);
    let selectExpr = '';

    if (!targetType?.typeName && targetType?.typeInfo) {
        // targetType = findTypeByNameFromStore(targetType.typeInfo.name) || targetType;
        targetType = findTypeByInfoFromStore(targetType.typeInfo) || targetType;
    }
    if (targetType.typeName === PrimitiveBalType.Record) {
        const srcFields = targetType.fields;
        selectExpr = `{
            ${targetType.fields.map((field, index) =>
                `${getBalRecFieldName(field.name)}: ${(index !== srcFields.length - 1) ? `,${getLinebreak()}\t\t\t` : ''}`
            ).join("")}
        }`
    } else {
        selectExpr = getDefaultValue(targetType?.typeName);
    }

    return `from var ${itemName} in ${srcExpr.trim()}${isOptionalSource ? ' ?: []' : ''} select ${selectExpr}`
}
