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
import styled from '@emotion/styled';

interface IconProps {
    iconComponent: ReactNode;
    position?: "start" | "end";
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
`;

export function TextField(props: TextFieldProps) {
    const { label, type = "text", size = 20, disabled, icon, readonly, value = "", id, autoFocus, required, onChange,
        placeholder, validationMessage, errorMsg, sx
    } = props;
    const { iconComponent, position = "start" } = icon || {};
    const handleChange = (e: any) => {
        onChange && onChange(e.target.value);
    }
    return (
        <Container sx={sx}>
            <VSCodeTextField
                autoFocus={autoFocus}
                type={type}
                size={size}
                disabled={disabled}
                readonly={readonly}
                validationMessage={validationMessage}
                placeholder={placeholder}
                onInput={handleChange}
                value={value}
                id={id}
            >
                {iconComponent && (<span slot={position}>{iconComponent}</span>)}
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
        </Container>
    );
}
