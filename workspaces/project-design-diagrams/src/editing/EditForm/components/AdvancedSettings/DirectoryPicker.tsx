/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { BallerinaComponentCreationParams } from '@wso2-enterprise/choreo-core';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Colors } from '../../../../resources';
import { InputComponent, Required } from '../../resources/styles';
import { DefaultTextProps, TextFieldStyles } from '../../resources/constants';

interface DirectoryPickerProps {
    component: BallerinaComponentCreationParams,
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
