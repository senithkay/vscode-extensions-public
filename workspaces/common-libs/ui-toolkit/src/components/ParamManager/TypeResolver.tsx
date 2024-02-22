/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { TextField } from "../TextField/TextField";
import { Dropdown } from "../Dropdown/Dropdown";
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { TextArea } from "../TextArea/TextArea";

export enum Type {
    TextField = "TextField",
    Dropdown = "Dropdown",
    Checkbox = "Checkbox",
    TextArea = "TextArea"
}

export interface Param {
    id: number;
    label: string;
    type: Type;
    value: string | boolean; // Boolean is for Checkbox
    isRequired?: boolean;
    errorMessage?: string;
    disabled?: boolean;
    values?: string[]; // For Dropdown
}

interface TypeResolverProps {
    param: Param;
    onChange: (param: Param) => void;
}

export function TypeResolver(props: TypeResolverProps) {
    const { param, onChange } = props;
    const { id, label, type, value, isRequired, values, disabled, errorMessage  } = param;

    const handleOnChange = (newValue: string | boolean) => {
        onChange({ ...param, value: newValue });
    }

    const dropdownItems = values?.map(val => {
        return { value: val };
    });

    switch (type) {
        case Type.TextField:
            return <TextField id={`txt-field-${id}`} label={label} value={value as string} disabled={disabled} errorMsg={errorMessage} required={isRequired} onChange={handleOnChange}/>;
        case Type.Dropdown:
            return <Dropdown id={`dropdown-${id}`} label={label} value={value as string} items={dropdownItems} disabled={disabled} errorMsg={errorMessage} isRequired={isRequired} onChange={handleOnChange}/>;
        case Type.Checkbox:
            return (
                <VSCodeCheckbox id={`checkbox-${id}`} checked={value as boolean} onChange={handleOnChange} disabled={disabled}>
                    Is Required?
                </VSCodeCheckbox>
            );
        case Type.TextArea:
            return <TextArea id={`txt-area-${id}`} value={value as string} disabled={disabled} label={label} errorMsg={errorMessage} onChange={handleOnChange}/>;
        default:
            return null;
    }
}
