/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactNode } from 'react';
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ErrorBanner } from "../Commons/ErrorBanner";
import { RequiredFormInput } from "../Commons/RequiredInput";
import styled from "@emotion/styled";
import { Typography } from "../Typography/Typography";

interface IconProps {
    iconComponent: ReactNode;
    position?: "start" | "end";
}

interface InputProps {
    startAdornment?: string | ReactNode;
    endAdornment?: string | ReactNode;
}

export interface TextFieldProps {
    value: string;
    label?: string;
    id?: string;
    autoFocus?: boolean;
    icon?: IconProps;
    size?: number;
    type?: "email" | "password" | "tel" | "text" | "url";
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    errorMsg?: string;
    placeholder?: string;
    validationMessage?: string;
    sx?: any;
    onChange?: (e: string) => void;
    onBlur?: (e: string) => void;
    InputProps?: InputProps;
}

interface ContainerProps {
    sx?: any;
}

const Container = styled.div<ContainerProps>`
    ${(props: ContainerProps) => props.sx};
`;

const LabelContainer = styled.div<ContainerProps>`
    display: flex;
    flex-direction: row;
    margin-bottom: 4px;
`;

export function TextField(props: TextFieldProps) {
    const { label, type = "text", size = 20, disabled, icon, readonly, value = "", id, autoFocus, required, onChange,
        onBlur, placeholder, validationMessage, errorMsg, sx, InputProps
    } = props;
    const { iconComponent, position = "start" } = icon || {};
    const handleChange = (e: any) => {
        onChange && onChange(e.target.value);
    };

    const startAdornment = InputProps?.startAdornment ? (
        typeof InputProps.startAdornment === "string" ? (
            <Typography variant="body1">{InputProps.startAdornment}</Typography>
        ) : (
            InputProps.startAdornment
        )
    ) : undefined;

    const endAdornment = InputProps?.endAdornment ? (
        typeof InputProps.endAdornment === "string" ? (
            <Typography variant="body1">{InputProps.endAdornment}</Typography>
        ) : (
            InputProps.endAdornment
        )
    ) : undefined;

    return (
        <Container sx={sx}>
            {startAdornment && startAdornment}
            <VSCodeTextField
                style={{ width: "100%" }}
                autoFocus={autoFocus}
                type={type}
                size={size}
                disabled={disabled}
                readonly={readonly}
                validationMessage={validationMessage}
                placeholder={placeholder}
                onInput={handleChange}
                onBlur={onBlur}
                value={value}
                id={id}
            >
                {iconComponent && <span slot={position}>{iconComponent}</span>}
                <LabelContainer>
                    <div style={{color: "var(--vscode-editor-foreground	)"}}>
                        <label htmlFor={`${id}-label`}>{label}</label>
                    </div>
                    {(required && label) && (<RequiredFormInput />)}
                </LabelContainer>
            </VSCodeTextField>
            {errorMsg && (
                <ErrorBanner errorMsg={errorMsg} />
            )}
            {endAdornment && endAdornment}
        </Container>
    );
}
