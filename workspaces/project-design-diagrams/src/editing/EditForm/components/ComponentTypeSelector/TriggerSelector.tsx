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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { ServiceType, Trigger } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { TriggerDetails } from '@wso2-enterprise/choreo-core';
import { InputComponent, SelectLabel } from '../../resources/styles';
import { DefaultSelectBoxStyles, DefaultTextProps } from '../../resources/constants';
import { DiagramContext } from '../../../../components/common';
import { Colors } from '../../../../resources';
import './styles.css';

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
        setServices(undefined);
        refetchTrigger(event.target.value as string);
    }

    const refetchTrigger = (id: string) => {
        editLayerAPI.fetchTrigger(id).then((response) => {
            setServices(response.serviceTypes);
        });
    }

    const handleToggle = (service: string) => () => {
        const serviceIndex = trigger.services.indexOf(service);
        const updatedCheckedServices = [...trigger.services];

        if (serviceIndex === -1) {
            updatedCheckedServices.push(service);
        } else {
            updatedCheckedServices.splice(serviceIndex, 1);
        }

        setTrigger({
            ...trigger,
            services: updatedCheckedServices
        });
    };

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
                        <List dense sx={{ maxHeight: '200px', overflow: 'auto' }}>
                            {services.map((service) => {
                                const labelId = `checkbox-list-secondary-label-${service.name}`;
                                const isChecked = trigger.services.indexOf(service.name) !== -1;
                                return (
                                    <ListItem
                                        key={service.name}
                                        disablePadding
                                        secondaryAction={
                                            <Checkbox
                                                edge='end'
                                                onChange={handleToggle(service.name)}
                                                checked={isChecked}
                                                className={isChecked ? 'checked-box ' : 'unchecked-box'}
                                                inputProps={{ 'aria-labelledby': labelId }}
                                            />
                                        }
                                    >
                                        <ListItemButton>
                                            <ListItemText
                                                secondaryTypographyProps={DefaultTextProps}
                                                id={labelId} secondary={service.name}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List> :
                        <CircularProgress size={'25px'} sx={{ color: Colors.PRIMARY, marginTop: '5px' }} />
                    }
                </InputComponent>
            }
        </>
    );
}
