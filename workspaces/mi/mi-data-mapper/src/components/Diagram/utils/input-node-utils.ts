/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";
import { useDMSearchStore } from "../../../store/store";

export const getSearchFilteredInput = (dmType: DMType, varName?: string) => {
	const searchValue = useDMSearchStore.getState().inputSearch;
	if (!searchValue) {
		return dmType;
	}

	if (varName?.toLowerCase()?.includes(searchValue.toLowerCase())) {
		return dmType
	} else if (dmType.kind === TypeKind.Interface || dmType.kind === TypeKind.Array) {
		const filteredType = getFilteredSubFields(dmType, searchValue);
		if (filteredType) {
			return filteredType
		}
	}
}

export const getFilteredSubFields = (dmType: DMType, searchValue: string) => {
	if (!dmType) {
		return null;
	}

	if (!searchValue) {
		return dmType;
	}

	if (dmType.kind === TypeKind.Interface) {
		const matchedSubFields: DMType[] = dmType?.fields
            ?.map(fieldItem => getFilteredSubFields(fieldItem, searchValue))
            .filter(fieldItem => fieldItem);

		const matchingName = dmType?.fieldName?.toLowerCase().includes(searchValue.toLowerCase());
		if (matchingName || matchedSubFields?.length > 0) {
			return {
				...dmType,
				fields: matchingName ? dmType?.fields : matchedSubFields
			}
		}
	} else if (dmType.kind === TypeKind.Array) {
		const matchedSubFields: DMType[] = dmType?.memberType
            ?.fields?.map(fieldItem => getFilteredSubFields(fieldItem, searchValue))
            .filter(fieldItem => fieldItem);

		const matchingName = dmType?.fieldName?.toLowerCase().includes(searchValue.toLowerCase());
		if (matchingName || matchedSubFields?.length > 0) {
			return {
				...dmType,
				memberType: {
					...dmType?.memberType,
					fields: matchingName ? dmType?.memberType?.fields : matchedSubFields
				}
			}
		}
	} else {
		return dmType?.fieldName?.toLowerCase()?.includes(searchValue.toLowerCase()) ? dmType : null
	}

	return null;
}
