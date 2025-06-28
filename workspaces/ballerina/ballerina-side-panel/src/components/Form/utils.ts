/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeKind } from "@wso2-enterprise/ballerina-core";
import { FormField, FormImports } from "../..";

// This function allows us to format strings by adding indentation as tabs to the lines
export function formatJSONLikeString(input: string): string {
    const lines = input.split('\n');
    let indentLevel = 0;
    const formattedLines = lines.map((line) => {
        line = line.trim();
        if (line.endsWith('{')) {
            const formatted = '\t'.repeat(indentLevel) + line;
            indentLevel++;
            return formatted;
        } else if (line.startsWith('}')) {
            indentLevel = Math.max(0, indentLevel - 1);
            return '\t'.repeat(indentLevel) + line;
        } else {
            return '\t'.repeat(indentLevel) + line;
        }
    });
    return formattedLines.join('\n');
}

export function stripHtmlTags(content: string): string {
    return content?.replace(/<[^>]*>/g, "") || "";
}

export function updateFormFieldWithImports(formField: FormField, fieldImports: FormImports) {
    if (fieldImports?.[formField.key]) {
        formField.imports = fieldImports[formField.key];
    }
    return formField;
}

export function isPrioritizedField(field: FormField): boolean {
    return field.key === "variable" || field.key === "type" || field.codedata?.kind === "PARAM_FOR_TYPE_INFER";
}

export function hasRequiredParameters(formFields: FormField[], selectedNode?: NodeKind): boolean {
    const parameterFields = formFields.filter(field => 
        !isPrioritizedField(field) && 
        field.type !== "VIEW" && 
        !field.hidden
    );

    return parameterFields.some((field) => !field.optional) ||
           selectedNode === "VARIABLE" ||
           selectedNode === "CONFIG_VARIABLE";
}

export function hasOptionalParameters(formFields: FormField[]): boolean {
    const parameterFields = formFields.filter(field => 
        !isPrioritizedField(field) && 
        field.type !== "VIEW" && 
        !field.hidden
    );

    return parameterFields.some(field => field.optional);
}

export function hasReturnType(formFields: FormField[]): boolean {
    return formFields.some(field => 
        field.key === "variable" || field.key === "type" || field.codedata?.kind === "PARAM_FOR_TYPE_INFER"
    );
}
