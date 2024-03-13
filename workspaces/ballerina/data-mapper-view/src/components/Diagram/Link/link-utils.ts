import { PrimitiveBalType, TypeField } from "@wso2-enterprise/ballerina-core";

import { RecordFieldPortModel } from "../Port";
import {
    findTypeByInfoFromStore,
    genVariableName,
    getBalRecFieldName,
    getDefaultValue,
    getLinebreak,
    getTypeName
} from "../utils/dm-utils";
import { getSupportedUnionTypes } from "../utils/union-type-utils";

import { DataMapperLinkModel } from "./model/DataMapperLink";

export enum ClauseType {
    Select = "select",
    Collect = "collect"
}

export function isSourcePortArray(link: DataMapperLinkModel): boolean {
    const sourcePort = link.getSourcePort() ;

    if (sourcePort instanceof RecordFieldPortModel) {
        return sourcePort.field.typeName === PrimitiveBalType.Array;
    }

    return false;
}

export function isTargetPortArray(link: DataMapperLinkModel): boolean {
    const targetPort = link.getTargetPort() ;

    if (targetPort instanceof RecordFieldPortModel) {
        return targetPort.field.typeName === PrimitiveBalType.Array;
    }

    return false;
}

export function generateQueryExpression(
    srcExpr: string,
    targetType: TypeField,
    isOptionalSource: boolean,
    clauseType: ClauseType,
    variableNames: string[]
) {

    let itemName = `${srcExpr.split('.').pop().trim()}Item`;
    itemName = genVariableName(itemName, variableNames);
    let selectExpr = '';

    if (!targetType?.typeName && targetType?.typeInfo) {
        targetType = findTypeByInfoFromStore(targetType.typeInfo) || targetType;
    }
    if (targetType.typeName === PrimitiveBalType.Record) {
        const srcFields = targetType.fields;
        selectExpr = `{
            ${targetType.fields.filter(field => !field.defaultable && !field.optional).map((field, index) =>
                `${getBalRecFieldName(field.name)}: ${(index !== srcFields.length - 1) ? `,${getLinebreak()}\t\t\t` : ''}`
            ).join("")}
        }`
    } else if (targetType.typeName === PrimitiveBalType.Union) {
        const firstTypeName = getSupportedUnionTypes(targetType)[0];
        const firstType = targetType?.members && targetType.members.find(member => {
            return getTypeName(member) === firstTypeName;
        });
        selectExpr = firstType && firstType?.typeName ? getDefaultValue(firstType.typeName) : "\"\"";
    } else {
        selectExpr = getDefaultValue(targetType?.typeName);
    }

    return `from var ${itemName} in ${srcExpr.trim()}${isOptionalSource ? ' ?: []' : ''} ${clauseType} ${selectExpr}`
}
