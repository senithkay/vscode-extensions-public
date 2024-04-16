/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { TextField, Dropdown, FormAutoComplete, FormCheckBox, RadioButtonGroup, OptionProps } from "@wso2-enterprise/ui-toolkit";
import { Controller } from "react-hook-form";

const Error = styled.span`
   color: var(--vscode-errorForeground);
   font-size: 12px;
`;

const Field = styled.div`
   margin-bottom: 12px;
`;

export const FieldType = {
    TEXT: 'text',
    DROPDOWN: 'dropdown',
    AUTOCOMPLETE: 'autocomplete',
    CHECKBOX: 'checkbox',
    RADIO_GROUP: 'radio-group'
} as const;

interface ControllerFieldProps {
    control: any;
    errors: any;
    fieldType?: typeof FieldType[keyof typeof FieldType]
    id: string;
    label?: string;
    placeholder?: string;
    options?: OptionProps[];
    items?: string[];
    size?: number;
    [key: string]: any;
}

const ControllerField = ({
    control,
    errors,
    fieldType = FieldType.TEXT,
    id,
    label,
    placeholder = "",
    options = [],
    items = [],
    size = 50,
    ...otherProps
}: ControllerFieldProps) => {

    const renderSubField = (field: any) => {
        switch (fieldType) {
            case 'dropdown':
                return (
                    <Dropdown
                        {...field}
                        {...otherProps}
                        id={id}
                        label={label}
                        items={options}
                        size={size}
                    />
                )
            case 'radio-group':
                return (
                    <RadioButtonGroup
                        {...field}
                        {...otherProps}
                        label={label}
                        options={options}
                    />
                )
            case 'text':
            default: {
                return (
                    <TextField
                        {...field}
                        {...otherProps}
                        id={id}
                        label={label}
                        size={size}
                        placeholder={placeholder}
                    />
                )
            }
        }
    }

    const renderMainField = () => {
        switch (fieldType) {
            case 'autocomplete':
                return (
                    <FormAutoComplete
                        {...otherProps}
                        name={id}
                        label={label}
                        control={control}
                        items={items}
                    />
                )
            case 'checkbox':
                return (
                    <FormCheckBox
                        {...otherProps}
                        name={id}
                        label={label}
                        control={control}
                    />
                )
            case 'text':
            case 'dropdown':
            case 'radio-group':
            default: {
                return (
                    <Controller
                        name={id}
                        control={control}
                        render={({ field }) => renderSubField(field)}
                    />
                )
            }
        }
    }
    return (
        <Field>
            {renderMainField()}
            {errors[id] && <Error>{errors[id]?.message?.toString()}</Error>}
        </Field>
    )
}

export default ControllerField;
