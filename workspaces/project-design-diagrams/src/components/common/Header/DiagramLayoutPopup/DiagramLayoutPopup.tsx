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

import React, { ChangeEvent } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Popover from '@mui/material/Popover';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import { PackageLabel, PopupContainer } from '../styles/styles';
import { DagreLayout } from '../../../../resources';

interface PopoverProps {
    anchorElement: HTMLButtonElement;
    closePopup: () => void;
    currentLayout: DagreLayout;
    changeLayout: (layout: DagreLayout) => void;
}

export function DiagramLayoutPopup(props: PopoverProps) {
    const { anchorElement, closePopup, currentLayout, changeLayout } = props;

    const open: boolean = Boolean(anchorElement);

    const updateLayout = (_event: ChangeEvent<HTMLInputElement>, value: string) => {
        changeLayout(value as DagreLayout);
    }

    return (
        <Popover
            id='mouse-over-popover'
            open={open}
            anchorEl={anchorElement}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            onClose={closePopup}
            disableRestoreFocus
            PaperProps={{ onMouseLeave: closePopup }}
        >
            <PopupContainer>
                <FormGroup>
                    <RadioGroup
                        aria-labelledby='layout-radio-group'
                        name='diagram-layout'
                        value={currentLayout}
                        onChange={updateLayout}
                    >
                        <FormControlLabel
                            value={DagreLayout.TREE}
                            control={<Radio className={currentLayout === DagreLayout.TREE ? 'checked-box ' : 'unchecked-box'} />}
                            label={<PackageLabel>Tree Layout</PackageLabel>}
                        />
                        <FormControlLabel
                            value={DagreLayout.GRAPH}
                            control={<Radio className={currentLayout === DagreLayout.GRAPH ? 'checked-box ' : 'unchecked-box'} />}
                            label={<PackageLabel>Graph Layout</PackageLabel>}
                        />
                    </RadioGroup>
                </FormGroup>
            </PopupContainer>
        </Popover>
    )
}
