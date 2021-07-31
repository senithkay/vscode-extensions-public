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

import IconButton from '@material-ui/core/IconButton';

import { useStyles } from "../style";

export interface ButtonWithIconProps {
    children?: string;
    onClick: (param?: any) => void,
    className?: string;
    role?: string;
    icon: JSX.Element;
    size?: any;
    disabled?: boolean;
}

export function ButtonWithIcon(props: ButtonWithIconProps) {
    const classes = useStyles();
    const { icon, onClick, size, className, disabled } = props;
    return (
        <IconButton
            onClick={onClick}
            className={className}
            role="button"
            size={size}
            disabled={disabled}
        >{icon}
        </IconButton>
    );
}

