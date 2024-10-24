/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { InputType, IOBaseType, OutputType, TypeKind } from "@wso2-enterprise/ballerina-core";
import { useDMSearchStore } from "../../../store/store";
import { ArrayElement, DMTypeWithValue } from "../Mappings/DMTypeWithValue";

export const getSearchFilteredInput = (dmType: OutputType, varName?: string) => {
	const searchValue = useDMSearchStore.getState().inputSearch;
	if (!searchValue) {
		return dmType;
	}

	if (varName?.toLowerCase()?.includes(searchValue.toLowerCase())) {
		return dmType
	} else if (dmType.kind === TypeKind.Record || dmType.kind === TypeKind.Array) {
		const filteredType = getFilteredSubFields(dmType, searchValue);
		if (filteredType) {
			return filteredType
		}
	}
}

export const getSearchFilteredOutput = (outputType: OutputType) => {
	const searchValue = useDMSearchStore.getState().outputSearch;
	if (!outputType) {
		return null
	}
	if (!searchValue) {
		return outputType;
	}

	let searchType: OutputType = outputType;

	if (searchType.kind === TypeKind.Array) {
		const subFields = searchType.memberType?.fields
			?.map(item => getFilteredSubFields(item, searchValue))
			.filter(item => item);

		return {
			...searchType,
			memberType: {
				...searchType.memberType,
				fields: subFields || []
			}
		}
	} else if (searchType.kind === TypeKind.Record) {
		const subFields = searchType.fields
			?.map(item => getFilteredSubFields(item, searchValue))
			.filter(item => item);

		return {
			...searchType,
			fields: subFields || []
		}
	}
	return  null;
}

export const getFilteredSubFields = (field: InputType | OutputType | IOBaseType, searchValue: string) => {
	if (!field) {
		return null;
	}

	if (!searchValue) {
		return field;
	}

	if (field.kind === TypeKind.Record) {
		const matchedSubFields = field.fields
			?.map((fieldItem): IOBaseType | OutputType => getFilteredSubFields(fieldItem, searchValue))
			.filter(fieldItem => fieldItem);

		const matchingName = field?.fieldName?.toLowerCase().includes(searchValue.toLowerCase());
		if (matchingName || matchedSubFields?.length > 0) {
			return {
				...field,
				fields: matchingName ? field?.fields : matchedSubFields
			}
		}
	} else if (field.kind === TypeKind.Array) {
		const matchedSubFields = field?.memberType?.fields
			?.map((fieldItem): IOBaseType | OutputType => getFilteredSubFields(fieldItem, searchValue))
			.filter(fieldItem => fieldItem);

		const matchingName = field?.fieldName?.toLowerCase().includes(searchValue.toLowerCase());
		if (matchingName || matchedSubFields?.length > 0) {
			return {
				...field,
				memberType: {
					...field?.memberType,
					fields: matchingName ? field?.memberType?.fields : matchedSubFields
				}
			}
		}
	} else {
		return field?.fieldName?.toLowerCase()?.includes(searchValue.toLowerCase()) ? field : null
	}

	return null;
}

export function hasNoOutputMatchFound(outputType: OutputType, filteredOutputType: OutputType): boolean {
	const searchValue = useDMSearchStore.getState().outputSearch;

	if (!searchValue) {
		return false;
	} else if (outputType.kind === TypeKind.Record && filteredOutputType.kind === TypeKind.Record) {
		return filteredOutputType?.fields.length === 0;
	} else if (outputType.kind === TypeKind.Array && filteredOutputType.kind === TypeKind.Array) {
		// return hasNoMatchFoundInArray(filteredOutputType?.elements, searchValue);
	}
	return false;
}

function hasNoMatchFoundInArray(elements: ArrayElement[], searchValue: string): boolean {
	if (!elements) {
		return false;
	} else if (elements.length === 0) {
		return true;
	}
	return elements.every(element => {
		if (element.member.type.kind === TypeKind.Record) {
			return element.member?.childrenTypes.length === 0;
		} else if (element.member.type.kind === TypeKind.Array) {
			return element.member.elements && element.member.elements.length === 0
		} else if (element.member.value) {
			const value = element.member.value?.getText() || element.member.value.getText();
			return !value.toLowerCase().includes(searchValue.toLowerCase());
		}
	});
}
