/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useState } from 'react';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import { InputComponent } from '../styles';

interface TextFieldProps {
    label: string;
    value: string;
    error: boolean;
    errorMessage: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
}

export function TextInputWidget(props: TextFieldProps) {
    const { label, value, error, errorMessage, onChange } = props;

    const [visited, updateVisitStatus] = useState<boolean>(false);

    const onChangeText = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (!visited) {
            updateVisitStatus(true);
        }
        onChange(e);
    }

    return (
        <InputComponent>
            <span>{label}</span>
            <TextField
                id='outlined-basic'
                variant='outlined'
                size='small'
                error={visited && error}
                value={value}
                sx={{ paddingTop: '5px' }}
                inputProps={{ style: { fontFamily: 'GilmerRegular', fontSize: '14px' } }}
                onChange={(e) => onChangeText(e)}
            />
            {visited && error &&
                <FormHelperText
                    sx={{
                        fontFamily: 'GilmerRegular',
                        fontSize: '11px'
                    }}
                >
                    {errorMessage}
                </FormHelperText>
            }
        </InputComponent>
    );
}
