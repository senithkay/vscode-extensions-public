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

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import classNames from "classnames";

import { useStyles } from "../style";

export interface PrimaryButtonProps {
    children?: string;
    onClick?: () => void,
    text?: string;
    variant?: string;
    className?: string;
    role?: string;
    disableRipple?: boolean;
    disableFocusRipple?: boolean;
    startIcon?: JSX.Element;
    fullWidth?: boolean;
    disabled?: boolean;
    dataTestId?: string;
}

export function PrimaryButton(props: PrimaryButtonProps) {
    const classes = useStyles();
    const {text, startIcon, onClick, fullWidth, disabled, className, dataTestId} = props;
    return (
        <Button
            data-testid={dataTestId}
            onClick={onClick}
            variant="contained"
            classes={{
                root: classNames(classes.primaryBtn, classes.square),
                disabled: classes.disabled
            }}
            role="button"
            startIcon={startIcon}
            disableRipple={true}
            disableFocusRipple={true}
            fullWidth={fullWidth}
            disabled={disabled}
            className={className}
        >
            {text ? (<Typography variant="h5" className={classes.btnText}>{text}</Typography>) : null}
        </Button>
    );
}
