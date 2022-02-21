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
import React from 'react';

import { MenuItem, Select } from "@material-ui/core";

import { useStatementEditorStyles } from "../styles";

export default function SelectDropdown() {
    const statementEditorClasses = useStatementEditorStyles();
    const [state, setState] = React.useState('All');

    const handleChange = (event: React.ChangeEvent<{ value: string }>) => {
        setState(event.target.value);
    };

    return (
        <div>
            <Select
                value={state}
                onChange={handleChange}
                className={statementEditorClasses.selectDropDownSe}
                inputProps={{ 'aria-label': 'Without label' }}
                MenuProps={{
                    getContentAnchorEl: null,
                    classes: { paper: statementEditorClasses.dropdownStyle },
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                    }
                }}
            >
                <MenuItem value="All"> <span className="TextSpan">All</span> </MenuItem>
                <MenuItem value="Language"> <span className="TextSpan">Language</span> </MenuItem>
                <MenuItem value="Standard"> <span className="TextSpan">Standard</span> </MenuItem>
            </Select>
        </div>
    );
}
