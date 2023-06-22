/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import { InputComponent, Required } from '../../resources/styles';
import { DefaultTextProps, TextFieldStyles } from '../../resources/constants';

interface TextFieldProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    required?: boolean;
    error?: boolean;
    errorMessage?: string;
}

export function TextInputWidget(props: TextFieldProps) {
    const { label, value, required, error, errorMessage, onChange } = props;

    const [visited, updateVisitStatus] = useState<boolean>(false);

    const displayError: boolean = visited && value.length > 0 && error;

    const onChangeText = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (!visited) {
            updateVisitStatus(true);
        }
        onChange(e);
    }

    return (
        <InputComponent>
            <span>
                {label}
                {required && <Required>*</Required>}
            </span>
            <TextField
                id='outlined-basic'
                size='small'
                variant='outlined'
                value={value}
                error={displayError}
                required={required}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChangeText(e)}
                sx={TextFieldStyles}
                inputProps={{ style: DefaultTextProps }}
            />
            {displayError &&
                <FormHelperText sx={{ fontFamily: 'GilmerRegular', fontSize: '11px' }} >
                    {errorMessage}
                </FormHelperText>
            }
        </InputComponent>
    );
}
