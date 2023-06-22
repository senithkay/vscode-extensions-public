/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
