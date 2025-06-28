/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";
import { ThemeColors } from "@wso2-enterprise/ui-toolkit";
import { FormField } from "./types";
import { useFormContext } from "../../context";

const HelperText = styled.div`
    font-size: 12px;
    color: ${ThemeColors.ON_SURFACE_VARIANT};
    font-family: var(--vscode-editor-font-family);
    line-height: 1.4;
`;

const Label = styled.span`
    color: var(--vscode-textPreformat-foreground);
    font-family: var(--vscode-editor-font-family);
    font-size: 12px;
`;

const TypeText = styled.span`
    background-color: var(--vscode-textPreformat-background);
    border-radius: 3px;
    padding: 2px 4px;
    color: var(--vscode-textPreformat-foreground);
    font-family: var(--vscode-editor-font-family);
    font-size: 12px;
`;

interface TypeHelperTextProps {
    targetTypeField: FormField;
    typeField: FormField;
}

export const TypeHelperText: React.FC<TypeHelperTextProps> = ({ targetTypeField, typeField }) => {
    const context = useFormContext();

    const targetTypeValue = context.form.watch(targetTypeField.key);

    if (targetTypeField.metadata?.label !== "Row Type") {
        return null;
    }

    if (!typeField.value || typeof typeField.value !== "string") {
        return null;
    }

    const initialTargetValue = typeof targetTypeField.value === "string" ? targetTypeField.value : "";

    const hasRowType = typeField.value.includes("rowType");
    const hasInitialValue = initialTargetValue && typeField.value.includes(initialTargetValue);

    if (!hasRowType && !hasInitialValue) {
        return null;
    }

    let actualReturnType: string;

    if (!targetTypeValue || targetTypeValue === "") {
        if (hasRowType) {
            actualReturnType = typeField.value.replace(/rowType/g, "any");
        } else if (initialTargetValue) {
            actualReturnType = typeField.value.replace(new RegExp(escapeRegExp(initialTargetValue), "g"), "any");
        } else {
            actualReturnType = typeField.value;
        }
    } else {
        if (hasRowType) {
            actualReturnType = typeField.value.replace(/rowType/g, targetTypeValue);
        } else if (initialTargetValue) {
            actualReturnType = typeField.value.replace(
                new RegExp(escapeRegExp(initialTargetValue), "g"),
                targetTypeValue
            );
        } else {
            actualReturnType = typeField.value;
        }
    }

    function escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    return (
        <div>
            <HelperText>
                <Label>Actual Return Type:</Label> <TypeText>{actualReturnType}</TypeText>
            </HelperText>
        </div>
    );
};

export default TypeHelperText;
