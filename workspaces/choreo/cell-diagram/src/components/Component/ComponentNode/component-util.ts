/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NAME_JOIN_CHAR } from "../../../resources";
import { Component } from "../../../types";

// get unique component id name from component
export function getComponentId(component: Component): string {
    return `${component.type}${NAME_JOIN_CHAR}${component.id}`; // TODO: add uuid to make it unique
}

export function getComponentMetadata(componentId: string): { type: string, id: string } {
    const parts = componentId.split(NAME_JOIN_CHAR);
    return { type: parts[0], id: parts[1] };
}
