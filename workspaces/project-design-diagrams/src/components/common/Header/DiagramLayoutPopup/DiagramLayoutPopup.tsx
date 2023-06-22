/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
