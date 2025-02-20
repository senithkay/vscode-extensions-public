import { PrimitiveBalType, TypeField } from "@wso2-enterprise/ballerina-core";

import { MappingType, RecordFieldPortModel } from "../Port";
import {
    findTypeByInfoFromStore,
    genVariableName,
    getBalRecFieldName,
    getDefaultValue,
    getLinebreak,
    getTypeName,
    toFirstLetterLowerCase,
    toFirstLetterUpperCase
} from "../utils/dm-utils";
import { getSupportedUnionTypes } from "../utils/union-type-utils";

import { LinkModel } from "@projectstorm/react-diagrams-core";

export enum ClauseType {
    Select = "select",
    Collect = "collect"
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

export function generateCustomFunction(
    sourcePort: RecordFieldPortModel,
    targetPort: RecordFieldPortModel,
    existingFunctions: string[]
): [string, string] {
    const sourceType = getTypeName(sourcePort.field);
    const targetType = getTypeName(targetPort.field);
    let functionName = `map${toFirstLetterUpperCase(sourceType)}To${toFirstLetterUpperCase(targetType)}`;
    let functionNameIndex = 1;

    while (existingFunctions.includes(functionName)) {
        functionName = `map${toFirstLetterUpperCase(sourceType)}To${toFirstLetterUpperCase(targetType)}${functionNameIndex}`;
        functionNameIndex++;
    }

    const functionSignature = `function ${functionName}(${sourceType} ${toFirstLetterLowerCase(sourceType)}) returns ${targetType} {

    }`;

    return [functionName, functionSignature];
}

export function removePendingMappingTempLinkIfExists(link: LinkModel) {
	const sourcePort = link.getSourcePort();
	const targetPort = link.getTargetPort();

	const pendingMappingType = sourcePort instanceof RecordFieldPortModel
		&& targetPort instanceof RecordFieldPortModel
		&& sourcePort.pendingMappingType
		&& targetPort.pendingMappingType;

	if (pendingMappingType) {
		sourcePort?.fireEvent({}, "link-removed");
		targetPort?.fireEvent({}, "link-removed");
		sourcePort.setPendingMappingType(MappingType.Default);
		targetPort.setPendingMappingType(MappingType.Default);
		link.remove();
	}
}

export function userActionRequiredMapping(mappingType: MappingType): boolean {
    return mappingType === MappingType.ArrayToArray
        || mappingType === MappingType.ArrayToSingleton
        || mappingType === MappingType.RecordToRecord
        || mappingType === MappingType.UnionToAny;
}
