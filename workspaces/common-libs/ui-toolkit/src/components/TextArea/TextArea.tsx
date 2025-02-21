/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ComponentProps, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";
import { ErrorBanner } from "../Commons/ErrorBanner";
import { RequiredFormInput } from "../Commons/RequiredInput";
import styled from '@emotion/styled';

interface IconProps {
    iconComponent: ReactNode;
    position?: "start" | "end";
    onClick?: () => void;
}


export interface TextAreaProps extends ComponentProps<"textarea"> {
    label?: string;
    labelAdornment?: ReactNode;
    id?: string;
    className?: string;
    autoFocus?: boolean;
    icon?: IconProps;
    required?: boolean;
    errorMsg?: string;
    placeholder?: string;
    cols?: number;
    rows?: number;
    resize?: string;
    validationMessage?: string;
    sx?: any;
    onTextChange?: (text: string) => void;
}

export interface AutoResizeTextAreaProps extends TextAreaProps {
    growRange: {
        start: number;
        offset: number;
    }
}

interface ContainerProps {
    sx?: any;
}

const Container = styled.div<ContainerProps>`
    ${(props: TextAreaProps) => props.sx};
`;

const LabelContainer = styled.div<ContainerProps>`
    display: flex;
    flex-direction: row;
    margin-bottom: 4px;
`;

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    function TextArea(props: TextAreaProps, ref: React.ForwardedRef<HTMLTextAreaElement>) {
        const { label, id, className, autoFocus, required, validationMessage, cols = 40,
            rows, resize, errorMsg, sx, onTextChange, labelAdornment, icon, ...rest
        } = props;

        const { iconComponent, onClick: iconClick } = icon || {};

        const handleChange = (e: any) => {
            onTextChange && onTextChange(e.target.value);
            props.onChange && props.onChange(e);
        };
        return (
            <Container sx={sx}>
                {iconComponent && <div onClick={iconClick} style={{ display: "flex" }}>{iconComponent}</div>}
                <VSCodeTextArea
                    ref={ref}
                    autoFocus={autoFocus}
                    validationMessage={validationMessage}
                    cols={cols}
                    rows={rows}
                    resize={resize}
                    id={id}
                    className={className}
                    style={{ width: "100%" }}
                    {...rest}
                    { ...!props.name ? { value: props.value ? props.value : ""} : {} } // If name is not provided, then value should be empty (for react-hook-form)
                    onChange={handleChange}
                    onInput={handleChange}
                >
                    <LabelContainer>
                        <div style={{ color: "var(--vscode-editor-foreground)" }}>
                            <label htmlFor={`${id}-label`}>{label}</label>
                        </div> {(required && label) && (<RequiredFormInput />)}
                        {labelAdornment && labelAdornment}
                    </LabelContainer>
                </VSCodeTextArea>
                {errorMsg && (
                    <ErrorBanner errorMsg={errorMsg} />
                )}
            </Container>
        );
    }
);

export const AutoResizeTextArea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextAreaProps>(
    (props, ref) => {
        const { growRange, onChange, ...rest } = props;
        const [rows, setRows] = useState<number>(props.rows || growRange.start || 1);
        const initialRender = useRef<boolean>(true);

        const growTextArea = useCallback((text: string) => {
            const { start, offset } = growRange;
            const lineCount = text.split("\n").length;
            const newRows = Math.max(start, Math.min(start + offset, lineCount));
            setRows(newRows);
        }, [growRange]);
    
        const handleChange = useCallback((e: any) => {
            if (growRange) {
                growTextArea(e.target.value);
            }
            onChange && onChange(e);
        }, [growRange, growTextArea, onChange]);

        // Initial row calculation
        useEffect(() => {
            if (props.value !== undefined && initialRender.current && growRange) {
                growTextArea(props.value.toString());
                initialRender.current = false;
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [growRange, props.value])

        return <TextArea {...rest} ref={ref} rows={rows} onChange={handleChange} />
    }
)

AutoResizeTextArea.displayName = 'AutoResizeTextArea';
