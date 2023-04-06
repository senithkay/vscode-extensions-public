/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { BallerinaComponentTypes, TriggerDetails } from '@wso2-enterprise/choreo-core';
import { TriggerSelector } from './TriggerSelector';
import { InputComponent, SelectLabel } from '../../resources/styles';
import { DefaultSelectBoxStyles, DefaultTextProps } from '../../resources/constants';

interface TypeSelectorProps {
    type: BallerinaComponentTypes;
    trigger: TriggerDetails;
    setType: (type: BallerinaComponentTypes) => void;
    setTrigger: (trigger: TriggerDetails) => void;
}

export function TypeSelector(props: TypeSelectorProps) {
    const { type, trigger, setTrigger, setType } = props;

    const handleTypeChange = (event: SelectChangeEvent) => {
        setType(event.target.value as BallerinaComponentTypes);
    }

    return (
        <>
            <InputComponent>
                <SelectLabel>Type</SelectLabel>
                <Select
                    id='component-type-select'
                    value={type}
                    onChange={handleTypeChange}
                    sx={DefaultSelectBoxStyles}
                >
                    <MenuItem sx={DefaultTextProps} value={BallerinaComponentTypes.REST_API}>HTTP</MenuItem>
                    <MenuItem sx={DefaultTextProps} value={BallerinaComponentTypes.GRAPHQL}>GraphQL</MenuItem>
                    <MenuItem sx={DefaultTextProps} value={BallerinaComponentTypes.WEBHOOK}>Webhook</MenuItem>
                    <MenuItem sx={DefaultTextProps} value={BallerinaComponentTypes.MAIN}>Main</MenuItem>
                </Select>
            </InputComponent>

            {type === BallerinaComponentTypes.WEBHOOK &&
                <TriggerSelector
                    trigger={trigger}
                    setTrigger={setTrigger}
                />
            }
        </>
    );
}
