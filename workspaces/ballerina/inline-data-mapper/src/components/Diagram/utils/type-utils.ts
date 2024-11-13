/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { IOType, TypeKind } from "@wso2-enterprise/ballerina-core";

export function getTypeName(field: IOType): string {
	if (!field) {
		return '';
	}

	let typeName = field?.typeName || field.kind;

    if (field.kind === TypeKind.Array && field?.memberType) {
		typeName = `${getTypeName(field.memberType)}[]`;
	}

	return typeName;
}

export function getDMTypeDim(ioType: IOType) {
    let dim = 0;
    while (ioType?.kind == TypeKind.Array) {
        dim++;
        ioType = ioType.memberType;
    }
    return dim;
}
