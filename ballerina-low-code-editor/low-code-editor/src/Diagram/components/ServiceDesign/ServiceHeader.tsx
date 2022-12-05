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
import React from "react";

import CloseIcon  from '@material-ui/icons/Close';
import HomeIcon from '@material-ui/icons/Home';

import { useStyles } from "./style";

export interface ServiceHeaderProps {
    onClose?: () => void;
    onConfigOpen?: () => void;
}

export function ServiceHeader(props: ServiceHeaderProps) {
    const { onClose } = props;
    const classes = useStyles();

    return (
        <div className={classes.headerContainer}>
            <div className={classes.homeButton} onClick={onClose} >
                <HomeIcon />
            </div>
            <div className={classes.breadCrumb}>
                <div className={classes.title}> Service Design </div>
            </div>
            <div className={classes.closeButton} onClick={onClose} >
                <CloseIcon />
            </div>
        </div>
    );
}
