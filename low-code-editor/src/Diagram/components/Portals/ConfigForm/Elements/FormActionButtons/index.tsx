/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import * as React from "react";

import {Button, Grid} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import {GreyButton} from "../../../../../../components/Buttons/GreyButton";
import {PrimaryButtonSquare} from "../../../../../../components/Buttons/PrimaryButtonSquare";
import { PrimaryButton } from "../Button/PrimaryButton";
import { SecondaryButton } from "../Button/SecondaryButton";

import { useStyles } from "./style";

export interface FormActionButtonsProps {
    cancelBtnText?: string;
    saveBtnText?: string;
    isMutationInProgress?: boolean;
    validForm?: boolean;
    onSave?: () => void,
    onCancel?: () => void
}

export function FormActionButtons(props: FormActionButtonsProps) {
    const classes = useStyles();
    const { cancelBtnText, saveBtnText, isMutationInProgress, validForm, onSave, onCancel } = props;
    return (
        <div className={classes.formSave}>
            <Grid container={true} className={classes.buttonWrapper} spacing={1}>
                <Grid item={true}>
                    <GreyButton text={cancelBtnText} fullWidth={false} onClick={onCancel} />
                </Grid>
                <Grid item={true}>
                    <PrimaryButtonSquare
                        data-testid="save-btn"
                        text={saveBtnText}
                        disabled={isMutationInProgress || !validForm}
                        fullWidth={false}
                        onClick={onSave}
                    />
                </Grid>
            </Grid>
        </div>
    );
}
