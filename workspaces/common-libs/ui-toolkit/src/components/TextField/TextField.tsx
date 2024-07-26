/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ComponentProps, ReactNode, useEffect, useRef } from 'react';
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ErrorBanner } from "../Commons/ErrorBanner";
import { RequiredFormInput } from "../Commons/RequiredInput";
import styled from "@emotion/styled";
import { Typography } from "../Typography/Typography";

interface IconProps {
    iconComponent: ReactNode;
    position?: "start" | "end";
    onClick?: () => void;
}

export interface InputProps {
    startAdornment?: string | ReactNode;
    endAdornment?: string | ReactNode;
}

export interface TextFieldProps extends ComponentProps<"input"> {
    label?: string;
    labelAdornment?: ReactNode;
    id?: string;
    autoFocus?: boolean;
    icon?: IconProps;
    size?: number;
    readonly?: boolean;
    required?: boolean;
    errorMsg?: string;
    description?: string | ReactNode;
    validationMessage?: string;
    sx?: any;
    onTextChange?: (text: string) => void;
    inputProps?: InputProps;
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

const Description = styled.div<ContainerProps>`
    color: var(--vscode-list-deemphasizedForeground);
    margin-bottom: 4px;
    text-align: left;
`;

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
    const { label, type = "text", size = 20, disabled, icon, readonly, id, autoFocus, required,
        placeholder, description, validationMessage, errorMsg, sx, inputProps, onTextChange,
        labelAdornment, ...rest
    } = props;

    const [, setIsFocused] = React.useState(false);
    const textFieldRef = useRef<HTMLInputElement | null>(null);
    // Assign the forwarded ref to the textFieldRef
    React.useImperativeHandle(ref, () => textFieldRef.current);

    const { iconComponent, position = "start", onClick: iconClick } = icon || {};
    const handleChange = (e: any) => {
        onTextChange && onTextChange(e.target.value);
        props.onChange && props.onChange(e);
    };

    const startAdornment = inputProps?.startAdornment ? (
        typeof inputProps.startAdornment === "string" ? (
            <Typography variant="body1">{inputProps.startAdornment}</Typography>
        ) : (
            inputProps.startAdornment
        )
    ) : undefined;

    const endAdornment = inputProps?.endAdornment ? (
        typeof inputProps.endAdornment === "string" ? (
            <Typography variant="body1">{inputProps.endAdornment}</Typography>
        ) : (
            inputProps.endAdornment
        )
    ) : undefined;

    useEffect(() => {
        if (autoFocus && textFieldRef.current && !props.value) {
            setIsFocused(true);
            textFieldRef.current?.focus()
        }
    }, [autoFocus, props.value]);

    return (
        <Container sx={sx}>
            {startAdornment && startAdornment}
            <VSCodeTextField
                ref={textFieldRef}
                style={{ width: "100%" }}
                autoFocus={autoFocus}
                type={type}
                size={size}
                disabled={disabled}
                readonly={readonly}
                validationMessage={validationMessage}
                placeholder={placeholder}
                id={id}
                {...rest}
                { ...!props.name ? { value: props.value ? props.value : ""} : {} } // If name is not provided, then value should be empty (for react-hook-form)
                onChange={handleChange}
                onInput={handleChange}
            >
                {iconComponent && <span onClick={iconClick} slot={position}>{iconComponent}</span>}
                {label && (
                    <LabelContainer>
                        <div style={{color: "var(--vscode-editor-foreground	)"}}>
                            <label htmlFor={`${id}-label`}>{label}</label>
                        </div>
                        {(required && label) && (<RequiredFormInput />)}
                        {labelAdornment && labelAdornment}
                    </LabelContainer>
                )}
                {description && (
                    <Description>
                        {description}
                    </Description>
                )}
            </VSCodeTextField>
            {errorMsg && (
                <ErrorBanner errorMsg={errorMsg} />
            )}
            {endAdornment && endAdornment}
        </Container>
    );
});
TextField.displayName = "TextField";
