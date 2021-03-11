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

import { Button } from "@material-ui/core";
import classNames from "classnames";

import { useStyles } from "../DropDown/styles";

import "./style.scss";

export interface SourceUpdateConfirmDialogProps {
    title?: string;
    subTitle?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export function SourceUpdateConfirmDialog(props: SourceUpdateConfirmDialogProps) {

    const { onConfirm, onCancel, title, subTitle } = props;
    const classes = useStyles();

    return (
        <div className={classes.updateContainer}>
            <p className={classes.updateTitle}> {title ? title : "Do you want to update?"} </p>

            {subTitle ? (
                <p className={classes.updateSubtitle}> {subTitle} </p>
            ) : (
                <p className={classes.updateSubtitle}>Updating trigger <b>will remove your current source code</b></p>
            )}

            <div className={classes.updateBtnWrapper}>
                <Button
                    variant="contained"
                    classes={{
                        root: classNames(classes.updateCancelBtn)
                    }}
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    classes={{
                        root: classNames(classes.updateBtn)
                    }}
                    onClick={onConfirm}
                >
                    Update
                </Button>
            </div>
        </div>
    );
}
