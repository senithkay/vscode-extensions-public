/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { PortModel } from "@projectstorm/react-diagrams-core";
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";

import { InputOutputPortModel } from "../Port";
import { getDefaultValue, getLinebreak, isQuotedString } from "./common-utils";

export function isSourcePortArray(port: PortModel): boolean {
    if (port instanceof InputOutputPortModel) {
        return port.field.kind === TypeKind.Array;
    }
    return false;
}

export function isTargetPortArray(port: PortModel): boolean {
    if (port instanceof InputOutputPortModel) {
        return port.field.kind === TypeKind.Array;
    }
    return false;
}

export function generateArrayToArrayMappingWithFn(srcExpr: string, targetType: DMType) {

    const parts = srcExpr.split(/[\.\[\]]/).filter(Boolean); // Split by dot or square brackets and remove empty strings
    let item = parts[parts.length - 1];
    let varName = isQuotedString(item) ? `${item.substring(1, item.length - 1)}Item` : `${item}Item`;
    let returnExpr = '';

    if (targetType.kind === TypeKind.Interface) {
        const srcFields = targetType.fields;

        returnExpr = `return {
            ${targetType.fields.filter(field => !field.optional).map((field, index) =>
                `${field.fieldName}: ${fillWithDefaults(field)}${(index !== srcFields.length - 1) ? `,${getLinebreak()}\t\t\t` : ''}`
            ).join("")}
        }`;
    } else {
        returnExpr = `return ${getDefaultValue(targetType.kind)}`;
    }

    return `${srcExpr.trim()}.map((${varName}) => {${returnExpr}})`;
}

function fillWithDefaults(type: DMType): string {

    if (type.kind === TypeKind.Interface) {
        const src = type.fields.map(field => {
            if (field.kind === TypeKind.Interface) {
                return `${field.fieldName}: ${fillWithDefaults(field)}`;
            }
            return `${field.fieldName}: ${getDefaultValue(field.kind)}`;
        }).join(`,${getLinebreak()} `);

        return `{ ${src} }`;
    }

    return getDefaultValue(type.kind);
};
