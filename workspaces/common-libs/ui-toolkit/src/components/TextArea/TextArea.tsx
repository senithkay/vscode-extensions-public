/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';
import { VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";
import { ErrorBanner } from "../Commons/ErrorBanner";
import { RequiredFormInput } from "../Commons/RequiredInput";

export interface TextAreaProps {
    value: string;
    label?: string;
    id?: string;
    autoFocus?: boolean;
    required?: boolean;
    errorMsg?: string;
    placeholder?: string;
    cols?: number;
    rows?: number;
    disabled?: boolean;
    readonly?: boolean;
    resize?: string;
    validationMessage?: string;
    onChange?: (e: string) => void;
}

export function TextArea(props: TextAreaProps) {
    const { label, value, id, autoFocus, required, onChange, placeholder, validationMessage, cols = 40, 
        rows, disabled, resize, readonly, errorMsg
    } = props;
    const handleChange = (e: any) => {
        onChange && onChange(e.target.value);
    }
    return (
        <>
            <VSCodeTextArea
                autoFocus={autoFocus}
                validationMessage={validationMessage}
                placeholder={placeholder}
                onInput={handleChange}
                value={value}
                cols={cols}
                rows={rows}
                disabled={disabled}
                readOnly={readonly}
                resize={resize}
                id={id}
            >
                {label} {(required && label) && (<RequiredFormInput />)}
            </VSCodeTextArea>
            {errorMsg && (
                <ErrorBanner errorMsg={errorMsg} />
            )}
        </>
    );
}
