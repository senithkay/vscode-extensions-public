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

import { PrimaryButton } from "../Button/PrimaryButton";
import { SecondaryButton } from "../Button/SecondaryButton";

import { useStyles } from "./style";

export interface ButtonPanelProps {
    cancelText?: string;
    saveText?: string;
    isMutationInProgress?: boolean;
    validForm?: boolean;
    handleSave?: () => void,
    onCancel?: () => void
}

export function ButtonPanel(props: ButtonPanelProps) {
    const classes = useStyles();
    const { cancelText, saveText, isMutationInProgress, validForm, handleSave, onCancel } = props;
    return (
        <div className={classes.formSave}>
            <div className={classes.buttonWrapper}>
                <SecondaryButton text={cancelText} fullWidth={false} onClick={onCancel} />
                <PrimaryButton
                    dataTestId="save-btn"
                    text={saveText}
                    disabled={isMutationInProgress || !validForm}
                    fullWidth={false}
                    onClick={handleSave}
                />
            </div>
        </div>
    );
}
