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

import { IconButton } from "@material-ui/core";
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import classNames from "classnames";

import { useStyles } from "../style";

export interface IconBtnWithTextProps {
    children?: string;
    onClick: (param?: any) => void,
    text?: string;
    variant?: string;
    iconClassName?: string;
    role?: string;
    disableRipple?: boolean;
    disableFocusRipple?: boolean;
    startIcon?: JSX.Element;
    fullWidth?: boolean;
    disabled?: boolean;
    size?: any;
    icon?: JSX.Element;
    className?: string;
}

export function IconBtnWithText(props: IconBtnWithTextProps) {
    const classes = useStyles();
    const { text, startIcon, onClick, fullWidth, disabled, size, iconClassName, icon, className } = props;
    return (
        <Button
            onClick={onClick}
            variant="contained"
            classes={{
                root: classNames(classes.iconBtn, className),
                disabled: classes.iconBtnDisable
            }}
            role="button"
            startIcon={startIcon}
            disableRipple={true}
            disableFocusRipple={true}
            fullWidth={fullWidth}
            disabled={disabled}
        >
            <IconButton
                className={iconClassName ? iconClassName : classes.iconBtnIcon}
                role="button"
                size={size}
                disabled={disabled}
            >{icon}
            </IconButton>
            {text ? (<Typography variant="h5">{text}</Typography>) : null}
        </Button>
    );
}
