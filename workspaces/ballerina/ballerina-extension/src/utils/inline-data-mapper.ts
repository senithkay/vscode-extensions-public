/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { IDMType, TypeWithIdentifier, TypeKind } from "@wso2-enterprise/ballerina-core";

export function transformTypeFieldToIDMType(typeField: TypeWithIdentifier, category?: string): IDMType {
    // Hack to ignore self variable in module level
    if (category === "Module Variables" && typeField.name === "self") {
        return;
    }
    const kind = typeField.type?.typeName as TypeKind;
    return {
        category: category,
        kind: kind,
        typeName: isArrayOrRecord(kind) ? typeField.type?.name || '' : undefined,
        fieldName: isArrayOrRecord(kind) ? typeField.name || '' : typeField.type?.name,
        memberType: typeField.type?.memberType ? transformTypeFieldToIDMType({
            name: '',
            type: typeField.type.memberType
        }) : undefined,
        defaultValue: typeField.type?.defaultValue,
        optional: typeField.type?.optional,
        fields: typeField.type?.fields ? typeField.type?.fields?.map((field) => transformTypeFieldToIDMType({
            name: '',
            type: field
        })) : undefined, 
    };
}

function isArrayOrRecord(type: TypeKind): boolean {
    return type === TypeKind.Array || type === TypeKind.Record;
}
