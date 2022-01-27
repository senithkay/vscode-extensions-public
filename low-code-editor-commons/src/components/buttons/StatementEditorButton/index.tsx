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
import * as React from "react";

import { FormControlLabel, FormGroup, Switch } from "@material-ui/core";

import { useStyles } from "./style";
import PrimarySwitchToggle from "../../PrimarySwitchToggle";

export interface StatementEditorButtonProps {
    handleChange?: () => void,
    checked?: boolean;
    onClick?: () => void,
}

export function StatementEditorButton(props: StatementEditorButtonProps) {
    const { handleChange, checked, onClick } = props;
    const classes = useStyles();

    return (
        <FormGroup >
            <FormControlLabel className={classes.expressionTitle} control={<PrimarySwitchToggle onChange={handleChange} checked={checked} onClick={onClick}/>} label="Statement Editor" />
        </FormGroup>
    );
}

