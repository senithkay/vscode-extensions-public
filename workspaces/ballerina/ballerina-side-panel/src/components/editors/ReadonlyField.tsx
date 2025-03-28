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
import { Button, Icon } from "@wso2-enterprise/ui-toolkit";
import { capitalize } from "./utils";
import styled from "@emotion/styled";

interface ReadonlyFieldProps {
    field: FormField;
}

const Container = styled.div`
    width: 100%;
    cursor: not-allowed;
`;

const Label = styled.div`
    font-family: var(--font-family);
    color: var(--vscode-editor-foreground);
    margin-bottom: 4px;
`;

const RequiredMark = styled.span`
    margin-left: 4px;
`;

const Description = styled.div`
    font-family: var(--font-family);
    color: var(--vscode-list-deemphasizedForeground);
    margin-top: 4px;
`;

const InputContainer = styled.div`
    display: flex;
    align-items: center;
    color: var(--input-foreground);
    background: var(--input-background);
    border-radius: calc(var(--corner-radius)* 1px);
    border: calc(var(--border-width)* 1px) solid var(--dropdown-border);
    height: calc(var(--input-height)* 1px);
    min-width: var(--input-min-width);
    width: calc(100% - 34px);
    padding: 0 calc(var(--design-unit) * 2px + 1px);
    margin-top: 10px;
`;

const Value = styled.span`
    flex: 1;
`;

const StyledButton = styled(Button)`
    padding: 0;
    margin-right: -6px;
    cursor: not-allowed;

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
            {field.documentation && <Description>{field.documentation}</Description>}
            <InputContainer>
                <Value>{field.value}</Value>
                <StyledButton appearance="icon" tooltip="Read only" disabled>
                    <Icon name="bi-lock" sx={{ fontSize: 16, width: 16, height: 16}} />
                </StyledButton>
            </InputContainer>
        </Container>
    );
}
