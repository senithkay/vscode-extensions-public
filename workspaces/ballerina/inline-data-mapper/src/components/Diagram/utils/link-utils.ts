/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { PortModel } from "@projectstorm/react-diagrams-core";
import { IDMType, TypeKind } from "@wso2-enterprise/ballerina-core";

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

export function generateArrayToArrayMappingWithFn(srcExpr: string, targetType: IDMType, isSourceOptional: boolean) {

    const parts = splitSrcExprWithRegex(srcExpr) // Split by dot or square brackets
    let item = parts[parts.length - 1];
    const varName = isQuotedString(item) ? `${item.substring(1, item.length - 1)}Item` : `${item}Item`;
    const refinedVarName = varName.replace(/[ .]/g, '_'); // Replace spaces and dots with underscores
    let returnExpr = '';

    if (targetType.kind === TypeKind.Record) {
        const srcFields = targetType.fields;

        returnExpr = `return {
            ${targetType.fields.filter(field => !field.optional).map((field, index) =>
                `${field.fieldName}: ${fillWithDefaults(field)}${(index !== srcFields.length - 1) ? `,${getLinebreak()}\t\t\t` : ''}`
            ).join("")}
        }`;
    } else {
        returnExpr = `return ${getDefaultValue(targetType.kind)}`;
    }

    return `${srcExpr.trim()}\n${isSourceOptional ? '?.' : '.'}map((${refinedVarName}) => {${returnExpr}})`;
}

function fillWithDefaults(type: IDMType): string {

    if (type.kind === TypeKind.Record) {
        const src = type.fields.map(field => {
            if (field.kind === TypeKind.Record) {
                return `${field.fieldName}: ${fillWithDefaults(field)}`;
            }
            return `${field.fieldName}: ${getDefaultValue(field.kind)}`;
        }).join(`,${getLinebreak()} `);

        return `{ ${src} }`;
    }

    return getDefaultValue(type.kind);
};

function splitSrcExprWithRegex(input: string): string[] {
    // Regular expression to match tokens
    const regex = /\[("[^"]*"|'[^']*'|[^[\]]+)\]|(["'])(?:(?=(\\?))\2.)*?\1|\w+/g;
    // Match and return all tokens
    const matches = input.match(regex);
    if (!matches) return [];
    
    return matches.map(token => {
        if (token.startsWith('[') && token.endsWith(']')) {
            return token.slice(1, -1);
        }
        return token.replace(/['"]/g, '');
    });
}
