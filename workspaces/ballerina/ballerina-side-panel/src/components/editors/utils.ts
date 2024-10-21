/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { FormField } from "../Form/types";

export function isDropdownField(field: FormField) {
    return field.type === "MULTIPLE_SELECT" || field.type === "SINGLE_SELECT" || field.type.toUpperCase() === "ENUM";
}

export function getValueForDropdown(field: FormField) {
    if (field.type === "MULTIPLE_SELECT") {
        return field.value?.length > 0 ? field.value[0] : field.items[0];
    }
    return field.value !== "" ? field.value : field.items[0];
}
