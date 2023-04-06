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
import CancelIcon from "@mui/icons-material/Cancel";
import { ServiceType, Trigger } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { TriggerDetails } from '@wso2-enterprise/choreo-core';
import { InputComponent, SelectLabel } from '../../resources/styles';
import { DefaultSelectBoxStyles, DefaultTextProps, MultiplSelectionTextProps, SelectBoxStyles } from '../../resources/constants';
import { DiagramContext } from '../../../../components/common';
import { Colors } from '../../../../resources';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

interface TriggerSelectorProps {
    trigger: TriggerDetails;
    setTrigger: (trigger: TriggerDetails) => void;
}

export function TriggerSelector(props: TriggerSelectorProps) {
    const { trigger, setTrigger } = props;
    const { editLayerAPI } = useContext(DiagramContext);

    const [triggers, setTriggers] = useState<Trigger[]>(undefined);
    const [services, setServices] = useState<ServiceType[]>(undefined);

    useEffect(() => {
        editLayerAPI.fetchTriggers().then((response) => {
            if (response && response.central?.length) {
                setTrigger({ id: response.central[0].id, services: [] });
                refetchTrigger(response.central[0].id);
                setTriggers(response.central);
            }
        });
    }, []);

    const handleTriggerChange = (event: SelectChangeEvent) => {
        setTrigger({ id: event.target.value as string, services: [] });
        refetchTrigger(event.target.value as string);
    }

    const refetchTrigger = (id: string) => {
        editLayerAPI.fetchTrigger(id).then((response) => {
            setServices(response.serviceTypes);
        });
    }

    const updateTriggerServices = (services: string[]) => {
        setTrigger({
            ...trigger,
            services: services
        });
    }

    return (
        <>
            <InputComponent>
                <SelectLabel>Trigger Type</SelectLabel>
                {triggers?.length ?
                    <Select
                        id='webhook-trigger-select'
                        value={trigger.id}
                        onChange={handleTriggerChange}
                        sx={DefaultSelectBoxStyles}
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

            {trigger &&
                <InputComponent>
                    <SelectLabel>Trigger Services</SelectLabel>
                    {services ?
                        <Select
                            id='trigger-service-select'
                            multiple
                            value={trigger.services}
                            onChange={(e) => updateTriggerServices([...e.target.value])}
                            sx={SelectBoxStyles}
                            placeholder={'Select services'}
                            renderValue={(selected) => (
                                <Stack gap={1} direction='row' flexWrap='wrap'>
                                    {selected.map((value) => (
                                        <Chip
                                            key={value}
                                            label={value}
                                            onDelete={() =>
                                                updateTriggerServices(
                                                    trigger.services.filter((item) => item !== value)
                                                )
                                            }
                                            deleteIcon={
                                                <CancelIcon
                                                    onMouseDown={(e: Event) => e.stopPropagation()}
                                                />
                                            }
                                            sx={MultiplSelectionTextProps}
                                        />
                                    ))}
                                </Stack>
                            )}
                        >
                            {services.map((service) => {
                                return <MenuItem sx={DefaultTextProps} value={service.name}>
                                    {service.name}
                                </MenuItem>;
                            })}
                        </Select> :
                        <CircularProgress size={'25px'} sx={{ color: Colors.PRIMARY, marginTop: '5px' }} />
                    }
                </InputComponent>
            }
        </>
    );
}
