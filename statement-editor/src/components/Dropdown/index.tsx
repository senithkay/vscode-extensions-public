/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useEffect } from 'react';

import { MenuItem, Select } from "@material-ui/core";

import { useStmtEditorHelperPanelStyles } from "../styles";

interface SelectDropdownProps {
    values: string[]
    defaultValue: string
    onSelection: (value: string) => void
    className?: string
}

export default function SelectDropdown(props: SelectDropdownProps) {
    const { values, defaultValue, onSelection, className } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const [state, setState] = React.useState(defaultValue);

    useEffect(() => {
        onSelection(defaultValue);
    }, []);

    const handleChange = (event: React.ChangeEvent<{ value: string }>) => {
        setState(event.target.value);
        onSelection(event.target.value);
    };

    const menuItems: React.ReactNode[] = [];
    if (values) {
        values.forEach((value) => {
            menuItems.push(
                <MenuItem key={value} value={value}>
                    <span className="TextSpan">{value}</span>
                </MenuItem>
            );
        });
    }

    return (
        <Select
            value={state}
            onChange={handleChange}
            className={className || stmtEditorHelperClasses.selectDropDownSe}
            inputProps={{ 'aria-label': 'Without label' }}
            MenuProps={{
                getContentAnchorEl: null,
                classes: { paper: stmtEditorHelperClasses.dropdownStyle },
                anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                }
            }}
            SelectDisplayProps={{
                // @ts-ignore
                "data-testid": `select-dropdown-data`
              }}
            data-testid="select-dropdown"
        >
            {menuItems}
        </Select>
    );
}
