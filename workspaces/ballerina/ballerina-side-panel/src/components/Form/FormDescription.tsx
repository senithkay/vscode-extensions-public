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
import { ThemeColors, Codicon } from "@wso2-enterprise/ui-toolkit";
import { NodeKind } from "@wso2-enterprise/ballerina-core";

import { FormField } from "./types";
import { hasRequiredParameters, hasOptionalParameters, hasReturnType, isPrioritizedField } from "./utils";

namespace S {
    export const FormInfoDescription = styled.div`
        color: ${ThemeColors.ON_SURFACE_VARIANT};
        font-size: 13px;
        margin-bottom: 12px;
        padding: 8px 12px;
        border-radius: 4px;
        opacity: 0.9;
        line-height: 1.4;
        background-color: var(--vscode-editor-inactiveSelectionBackground);
    `;

    export const ConfigurationCompleteContainer = styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;

    export const ConfigurationCompleteHeader = styled.div`
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: ${ThemeColors.PRIMARY};
    `;

    export const ConfigurationCompleteText = styled.div`
        color: ${ThemeColors.ON_SURFACE_VARIANT};
        font-size: 12px;
        line-height: 1.4;
    `;
}

interface FormDescriptionProps {
    formFields: FormField[];
    selectedNode?: NodeKind;
}

export const FormDescription: React.FC<FormDescriptionProps> = ({
    formFields,
    selectedNode
}) => {
    const getFormInfoDescription = (): React.ReactNode => {
        const hasRequired = hasRequiredParameters(formFields, selectedNode);
        const hasOptional = hasOptionalParameters(formFields);
        const hasReturn = hasReturnType(formFields);
        const hasAnyParams = formFields.filter(field => 
            !isPrioritizedField(field) &&
            field.type !== "VIEW" && 
            !field.hidden
        ).length > 0;

        if (!hasRequired && hasOptional) {
            // Rule 1: No Required Params, but Optional Params Exist
            return "This operation has no required parameters. Optional settings can be configured below.";
        } else if (!hasAnyParams && hasReturn) {
            // Rule 2: No Parameters at All (but has return)
            return "This is a simple operation that requires no parameters. Specify where to store the result to finish.";
        } else if (!hasAnyParams && !hasReturn) {
            // Rule 3: No Parameters AND No Return
            return (
                <S.ConfigurationCompleteContainer>
                    <S.ConfigurationCompleteHeader>
                        <Codicon name="check-all" iconSx={{ fontSize: 16, color: ThemeColors.PRIMARY }} />
                        Configuration Complete
                    </S.ConfigurationCompleteHeader>
                    <S.ConfigurationCompleteText>
                        It does not require any parameters and does not return a result. You can save the configuration.
                    </S.ConfigurationCompleteText>
                </S.ConfigurationCompleteContainer>
            );
        }

        return "";
    };

    const description = getFormInfoDescription();

    if (!description) {
        return null;
    }

    return (
        <S.FormInfoDescription>
            {description}
        </S.FormInfoDescription>
    );
};

export default FormDescription; 
