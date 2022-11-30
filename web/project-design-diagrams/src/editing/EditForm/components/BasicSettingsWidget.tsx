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
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TextInputWidget } from './TextInput';
import { DefaultTextProps, PackageNameRules, TypeInputProps } from '../resources/constants';
import { TypeLabel } from '../resources/styles';
import { AddComponentDetails, Colors, ComponentType } from '../../../resources';

interface TypeSelectorProps {
    component: AddComponentDetails,
    updateName: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    updateType: (event: SelectChangeEvent) => void;
    setInitBehaviour: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BasicSettingsWidget(props: TypeSelectorProps) {
    const { component, updateName, updateType, setInitBehaviour } = props;

    return (
        <>
            <TextInputWidget
                label={'Component Name'}
                value={component.name}
                required={true}
                error={component.name.length < 1}
                errorMessage={PackageNameRules}
                onChange={updateName}
            />

            <FormControl>
                <TypeLabel>Component Type</TypeLabel>
                <Select
                    defaultValue={ComponentType.BALLERINA}
                    value={component.type}
                    onChange={updateType}
                    displayEmpty
                    sx={{ ...TypeInputProps }}
                >
                    <MenuItem value={ComponentType.BALLERINA} sx={{ ...DefaultTextProps }}>Ballerina</MenuItem>
                    <MenuItem value={ComponentType.OTHER} sx={{ ...DefaultTextProps }}>Other</MenuItem>
                </Select>
            </FormControl>

            <FormControlLabel
                sx={{ paddingInline: '10px' }}
                control={
                    <Checkbox
                        checked={component.initialize}
                        onChange={setInitBehaviour}
                        sx={{
                            '&.Mui-checked': {
                                color: Colors.PRIMARY
                            }
                        }}
                    />
                }
                label={<span style={DefaultTextProps}>Initialize Component</span>}
            />
        </>
    );
}
