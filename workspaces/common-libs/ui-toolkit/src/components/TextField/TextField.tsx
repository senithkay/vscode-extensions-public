/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ComponentProps, ReactNode } from 'react';
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

interface InputProps {
    startAdornment?: string | ReactNode;
    endAdornment?: string | ReactNode;
}

export interface TextFieldProps extends ComponentProps<"input"> {
    label?: string;
    id?: string;
    autoFocus?: boolean;
    icon?: IconProps;
    size?: number;
    readonly?: boolean;
    required?: boolean;
    errorMsg?: string;
    validationMessage?: string;
    sx?: any;
    onTextChange?: (text: string) => void;
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

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
    const { label, type = "text", size = 20, disabled, icon, readonly, id, autoFocus, required,
        placeholder, validationMessage, errorMsg, sx, InputProps, onTextChange, ...rest
    } = props;

    // const [, setIsFocused] = React.useState(false);
    // const textFieldRef = useRef<HTMLInputElement>(null);

    const { iconComponent, position = "start", onClick: iconClick } = icon || {};
    const handleChange = (e: any) => {
        onTextChange && onTextChange(e.target.value);
        props.onChange && props.onChange(e);
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

    // useEffect(() => {
    //     if (autoFocus && textFieldRef.current && !value) {
    //         setIsFocused(true);
    //         textFieldRef.current?.focus()
    //     }
    // }, [autoFocus, value]);

    return (
        <Container sx={sx}>
            {startAdornment && startAdornment}
            <VSCodeTextField
                ref={ref}
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
                onChange={handleChange}
            >
                {iconComponent && <span onClick={iconClick} slot={position}>{iconComponent}</span>}
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
});
TextField.displayName = "TextField";
