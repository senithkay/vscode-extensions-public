/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { TypeField } from "@wso2-enterprise/ballerina-core";

export function getTypeName(typeField: TypeField) {
    if (typeField.typeName === "record") {
        return typeField?.typeInfo?.name;
    } else if (typeField.typeName === "array") {
        return `${typeField?.memberType?.typeInfo?.name}[]`;
    } else if (typeField.typeName === "intersection") {
        return typeField.members
            .map((member): string => getTypeName(member))
            .join(" & ");

    } else {
        return typeField?.typeName;
    }
}
