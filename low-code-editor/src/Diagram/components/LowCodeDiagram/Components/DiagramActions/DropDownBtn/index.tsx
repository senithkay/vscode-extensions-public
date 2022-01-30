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
import React, { useContext, useState } from "react";

import { Context } from "../../../Context/diagram"
import { DropDownMenu, DropDownMenuProps } from "../../DialogBoxes";

import {
    DropDownSVG, DROPDOWN_SVG_HEIGHT_WITH_SHADOW, DROPDOWN_SVG_WIDTH_WITH_SHADOW
} from "./DropDownSVG";
import "./style.scss";

export interface DropDownMenuTriggerProps<DataType> {
    cx: number;
    cy: number;
    menuOptions: DropDownMenuProps<DataType>;
    active: boolean;
}

export function DropDownMenuTrigger<DataType>(props: DropDownMenuTriggerProps<DataType>) {
    const { props: { isReadOnly } } = useContext(Context);

    const { cx, cy, menuOptions, active } = props;
    const { onChange, onClose = () => undefined } = menuOptions;

    const [isTriggerActive, setTriggerActive] = useState(active);
    const [isDropdownActive, setDropdownActive] = useState(active);

    const className: string = `dropdown-icon-${isTriggerActive ? 'show' : 'hide'}`;

    const onMouseEnter = () => {
        setTriggerActive(true);
    };

    const onMouseLeave = () => {
        // if drop down is active, keep trigger active
        // otherwise hide trigger on mouse leave
        setTriggerActive(isDropdownActive);
    };

    const onTriggerClick = () => {
        setDropdownActive(true);
    };

    const menuProps: DropDownMenuProps<DataType> = {
        ...menuOptions,
        isDropdownActive: active,
        onChange: (value: DataType) => {
            onChange(value);
            setDropdownActive(false);
        },
        onClose: () => {
            setDropdownActive(false);
            setTriggerActive(false);
            onClose();
        }
    }

    if (isReadOnly) return null;

    return (
        <g>
            <g
                className={className}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={onTriggerClick}
                data-testid="dropdownBtn"
            >
                <DropDownSVG
                    x={cx - (DROPDOWN_SVG_WIDTH_WITH_SHADOW / 2)}
                    y={cy - (DROPDOWN_SVG_HEIGHT_WITH_SHADOW / 2)}
                />
            </g>
            <g>
                {isDropdownActive && <DropDownMenu {...menuProps} />}
            </g>
        </g>
    );
}
