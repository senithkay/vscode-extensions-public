/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { IOType, Mapping, Type, TypeKind } from "@wso2-enterprise/ballerina-core";
import { useDMSearchStore } from "../../../store/store";

export const getSearchFilteredInput = (dmType: IOType, varName?: string) => {
	const searchValue = useDMSearchStore.getState().inputSearch;
	if (!searchValue) {
		return dmType;
	}

	if (varName?.toLowerCase()?.includes(searchValue.toLowerCase())) {
		return dmType
	} else if (dmType.type.typeName === TypeKind.Record || dmType.type.typeName === TypeKind.Array) {
		const filteredType = getFilteredSubFields(dmType, searchValue);
		if (filteredType) {
			return filteredType
		}
	}
}

export const getSearchFilteredOutput = (outputType: IOType) => {
	const searchValue = useDMSearchStore.getState().outputSearch;
	if (!outputType) {
		return null
	}
	if (!searchValue) {
		return outputType;
	}

	let searchType: IOType = outputType;

	if (searchType.type.typeName === TypeKind.Array) {
		const subFields = searchType.type.memberType?.fields
			?.map(item => getFilteredSubFields(item, searchValue))
			.filter(item => item);

		return {
			...searchType,
			memberType: {
				...searchType.type.memberType,
				fields: subFields || []
			}
		}
	} else if (searchType.type.typeName === TypeKind.Record) {
		const subFields = searchType.type.fields
			?.map(item => getFilteredSubFields(item, searchValue))
			.filter(item => item);

		return {
			...searchType,
			fields: subFields || []
		}
	}
	return  null;
}

export const getFilteredSubFields = (field: IOType | Type, searchValue: string) => {
	if (!field) {
		return null;
	}

	if (!searchValue) {
		return field;
	}

	const type = 'type' in field ? field.type : field;

	if (type.typeName === TypeKind.Record) {
		const matchedSubFields: Type[] = type.fields
			?.map((fieldItem) => getFilteredSubFields(fieldItem, searchValue))
			.filter((fieldItem): fieldItem is Type => fieldItem !== null);

		const matchingName = type.name?.toLowerCase().includes(searchValue.toLowerCase());
		if (matchingName || matchedSubFields?.length > 0) {
			return {
				...field,
				fields: matchingName ? type.fields : matchedSubFields
			}
		}
	} else if (type.typeName === TypeKind.Array) {
		const matchedSubFields: Type[] = type.memberType?.fields
			?.map((fieldItem) => getFilteredSubFields(fieldItem, searchValue))
			.filter((fieldItem): fieldItem is Type => fieldItem !== null);

		const matchingName = type.name?.toLowerCase().includes(searchValue.toLowerCase());
		if (matchingName || matchedSubFields?.length > 0) {
			return {
				...field,
				memberType: {
					...type.memberType,
					fields: matchingName ? type.memberType?.fields : matchedSubFields
				}
			}
		}
	} else {
		return type.name?.toLowerCase()?.includes(searchValue.toLowerCase()) ? field : null
	}

	return null;
}

export function hasNoOutputMatchFound(outputType: IOType, filteredOutputType: IOType): boolean {
	const searchValue = useDMSearchStore.getState().outputSearch;

	if (!searchValue) {
		return false;
	} else if (outputType.type.typeName === TypeKind.Record && filteredOutputType.type.typeName === TypeKind.Record) {
		return filteredOutputType?.type.fields.length === 0;
	} else if (outputType.type.typeName === TypeKind.Array && filteredOutputType.type.typeName === TypeKind.Array) {
		// return hasNoMatchFoundInArray(filteredOutputType?.elements, searchValue);
	}
	return false;
}

export function getFilteredMappings(mappings: Mapping[], searchValue: string) {
	return mappings.filter(mapping => {
		const outputField = mapping.output.split(".").pop();
		return searchValue === "" || outputField.toLowerCase().includes(searchValue.toLowerCase());
	});
}

