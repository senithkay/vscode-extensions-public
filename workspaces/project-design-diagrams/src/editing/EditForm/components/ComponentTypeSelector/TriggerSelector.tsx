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

import React, { useContext, useEffect, useState } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { Trigger } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { InputComponent, SelectLabel } from '../../resources/styles';
import { DefaultTextProps, SelectBoxStyles } from '../../resources/constants';
import { DiagramContext } from '../../../../components/common';
import { Colors } from '../../../../resources';

interface TriggerSelectorProps {
    triggerId: string;
    setTriggerId: (id: string) => void;
}

export function TriggerSelector(props: TriggerSelectorProps) {
    const { triggerId, setTriggerId } = props;
    const { editLayerAPI } = useContext(DiagramContext);

    const [triggers, setTriggers] = useState<Trigger[]>(undefined);

    useEffect(() => {
        editLayerAPI.fetchTriggers().then((response) => {
            if (response && response.central?.length) {
                setTriggerId(response.central[0].id);
                setTriggers(response.central);
            }
        });
    }, []);

    const handleTriggerChange = (event: SelectChangeEvent) => {
        setTriggerId(event.target.value as string);
    }

    return (
        <InputComponent>
            <SelectLabel>Trigger Type</SelectLabel>
            {triggers?.length ?
                <Select
                    id='webhook-trigger-select'
                    value={triggerId}
                    onChange={handleTriggerChange}
                    sx={SelectBoxStyles}
                >
                    {triggers.map((trigger) => {
                        return <MenuItem sx={DefaultTextProps} value={trigger.id}>
                            {trigger.displayAnnotation?.label || trigger.moduleName}
                        </MenuItem>;
                    })}
                </Select> :
                <CircularProgress size={'25px'} sx={{ color: Colors.PRIMARY, marginTop: '5px' }} />
            }
        </InputComponent>
    );
}
