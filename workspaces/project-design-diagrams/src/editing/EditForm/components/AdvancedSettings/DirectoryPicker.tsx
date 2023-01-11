/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import React from 'react';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { InputComponent, Required } from '../../resources/styles';
import { AddComponentDetails, Colors } from '../../../../resources';
import { DefaultTextProps, TextFieldStyles } from '../../resources/constants';

interface DirectoryPickerProps {
    component: AddComponentDetails,
    selectDirectory: () => void;
}

export function DirectoryPicker(props: DirectoryPickerProps) {
    const { component, selectDirectory } = props;

    return (
        <InputComponent>
            <span>Directory<Required>*</Required></span>
            <TextField
                id='outlined-basic'
                size='small'
                variant='outlined'
                value={component.directory}
                required={true}
                inputProps={{ style: DefaultTextProps }}
                sx={TextFieldStyles}
                InputProps={{
                    readOnly: true,
                    endAdornment: (
                        <InputAdornment position='end'>
                            <DriveFolderUploadIcon
                                onClick={selectDirectory}
                                sx={{
                                    color: Colors.PRIMARY,
                                    cursor: 'pointer'
                                }}
                            />
                        </InputAdornment>
                    )
                }}
            />
        </InputComponent>
    );
}
