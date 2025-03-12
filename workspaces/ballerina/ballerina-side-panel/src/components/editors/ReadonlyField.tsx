/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { FormField } from "../Form/types";
import { Codicon, Button } from "@wso2-enterprise/ui-toolkit";
import { capitalize } from "./utils";
import styled from "@emotion/styled";

interface ReadonlyFieldProps {
    field: FormField;
}

const Container = styled.div`
    width: 100%;
`;

const Label = styled.div`
    font: GlimmerRegular;
    font-size: 12px;
    color: var(--vscode-foreground);
    margin-bottom: 4px;
`;

const RequiredMark = styled.span`
    margin-left: 4px;
`;

const Description = styled.div`
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    margin-top: 4px;
`;

const InputContainer = styled.div`
    display: flex;
    align-items: center;
    height: 24px;
    background-color: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border);
    border-radius: 5px;
    padding: 0 8px;
    font-size: 12px;
    color: var(--vscode-input-foreground);
    opacity: 0.8;
    min-width: 120px;
    width: fit-content;
    margin-top: 10px;
`;

const Value = styled.span`
    flex: 1;
`;

const StyledButton = styled(Button)`
    cursor: default !important;
    padding: 0;

    :host([disabled]) {
        opacity: 1 !important;
    }

    &.ms-Button--disabled {
        opacity: 1 !important;
    }

    & .codicon {
        opacity: 1 !important;
        color: var(--vscode-input-foreground) !important;
    }
`;

export function ReadonlyField(props: ReadonlyFieldProps) {
    const { field } = props;

    return (
        <Container>
            <Label>
                {capitalize(field.label)}
                {!field.optional && <RequiredMark>*</RequiredMark>}
            </Label>
            {field.documentation && (
                <Description>
                    {field.documentation}
                </Description>
            )}
            <InputContainer>
                <Value>{field.value}</Value>
                <StyledButton
                    appearance="icon"
                    tooltip="Read-only"
                    disabled
                >
                    <Codicon
                        name="lock-small"
                        sx={{ cursor: 'default', paddingLeft: '4px' }}
                    />
                </StyledButton>
            </InputContainer>
        </Container>
    );
}
