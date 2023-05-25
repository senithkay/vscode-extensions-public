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
// tslint:disable: jsx-no-multiline-js
import * as React from "react";

import { StatementEditorButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { GreyButton } from "../../../../../components/Buttons/GreyButton";
import { PrimaryButtonSquare } from "../../../../../components/Buttons/PrimaryButtonSquare";

import { useStyles } from "./style";

export interface FormActionButtonsProps {
    cancelBtnText?: string;
    saveBtnText?: string;
    isMutationInProgress?: boolean;
    validForm?: boolean;
    onSave?: () => void;
    onCancel?: () => void;
    statementEditor?: boolean;
    toggleChecked?: boolean;
    experimentalEnabled?: boolean;
}

export function FormActionButtons(props: FormActionButtonsProps) {
    const classes = useStyles();
    const { cancelBtnText, saveBtnText, isMutationInProgress, validForm, onSave, onCancel, statementEditor,
            toggleChecked, experimentalEnabled } = props;
    return (
        <div className={classes.formSave}>
            <div className={classes.stmtEditorToggle}>
                {experimentalEnabled && statementEditor && (
                    <StatementEditorButton checked={toggleChecked} />
                )}
            </div>
            <div className={classes.buttonWrapper}>
                <div className={classes.spaceBetween}>
                    <GreyButton text={cancelBtnText} fullWidth={false} onClick={onCancel}/>
                </div>
                <div className={classes.spaceBetween}>
                    <PrimaryButtonSquare
                        testId="save-btn"
                        text={saveBtnText}
                        disabled={isMutationInProgress || !validForm}
                        fullWidth={false}
                        onClick={onSave}
                    />
                </div>
            </div>
        </div>
    );
}
