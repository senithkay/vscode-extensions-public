/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { IOType, Type, TypeKind } from "@wso2-enterprise/ballerina-core";

export function getTypeName(fieldType: IOType | Type): string {
	if (!fieldType) {
		return '';
	}

    const type = 'type' in fieldType ? fieldType.type : fieldType;
    let typeName = type?.name || type.typeName;

    if (type.typeName === TypeKind.Array && type.memberType) {
		typeName = `${getTypeName(type.memberType)}[]`;
	}

	return typeName;
}

export function getDMTypeDim(fieldType: IOType | Type) {
    let dim = 0;
    let currentType = 'type' in fieldType ? fieldType.type : fieldType;
    while (currentType.typeName === TypeKind.Array) {
        dim++;
        currentType = currentType.memberType;
    }
    return dim;
}
