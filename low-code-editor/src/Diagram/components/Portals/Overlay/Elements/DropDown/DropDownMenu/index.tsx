/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React from 'react';

import { ClickAwayListener } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import CloseIcon from '@material-ui/icons/Close';
import Autocomplete, { RenderInputParams, RenderOptionState } from '@material-ui/lab/Autocomplete';

import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from '../../../index';
import "../style.scss";

export interface DropDownMenuProps<DataType> {
    position: DiagramOverlayPosition;
    options: DataType[];
    title: string;
    isDropdownActive?: boolean;
    genLabel: (value: DataType) => any;
    renderOption?: (value: DataType, state: RenderOptionState) => React.ReactNode;
    onChange?: (value: DataType) => void;
    onClose?: () => void;
}

export function DropDownMenu<DataType>(props: DropDownMenuProps<DataType>) {
    const { position, options, title, isDropdownActive, genLabel, onChange, onClose, renderOption } = props;

    const handleChange = (evt: any, value: DataType) => {
        onChange(value);
    };

    const textField = (params: RenderInputParams) =>
        (<TextField className="input-text" {...params} placeholder="Please select" variant="filled" />);

    return (
        <ClickAwayListener
            mouseEvent={!isDropdownActive ? "onMouseDown" : false}
            touchEvent={!isDropdownActive ? "onTouchStart" : false}
            onClickAway={onClose}
        >
            <div>
                <DiagramOverlayContainer>
                    <DiagramOverlay
                        className="dropdown-container"
                        position={position}
                    >

                        <p> {title} </p>

                        <button className="close-btn" onClick={onClose}>
                            <CloseIcon />
                        </button>

                        <Autocomplete
                            id="grouped-demo"
                            options={options}
                            getOptionLabel={genLabel}
                            className='input-wrapper'
                            renderInput={textField}
                            onChange={handleChange}
                            open={true}
                            renderOption={renderOption}
                            disablePortal={true}
                            openOnFocus={true}
                        />
                    </DiagramOverlay>
                </DiagramOverlayContainer>
            </div>
        </ClickAwayListener>
    );
}
