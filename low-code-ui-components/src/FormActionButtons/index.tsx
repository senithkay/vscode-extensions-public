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

import { PrimaryButton } from "../buttons/PrimaryButton";
import { SecondaryButton } from "../buttons/SecondaryButton";
import { StatementEditorButton } from "../buttons/StatementEditorButton";

import { useStyles } from "./style";

export interface FormActionButtonsProps {
    cancelBtnText?: string;
    saveBtnText?: string;
    isMutationInProgress?: boolean;
    validForm?: boolean;
    onSave?: () => void;
    onCancel?: () => void;
    cancelBtn?: boolean;
    statementEditor?: boolean;
    toggleChecked?: boolean;
    experimentalEnabled?: boolean;
    handleStmtEditorToggle?: () => void;
}

export function FormActionButtons(props: FormActionButtonsProps) {
    const classes = useStyles();
    const { cancelBtnText, saveBtnText, isMutationInProgress, validForm, onSave, onCancel, cancelBtn, statementEditor,
            handleStmtEditorToggle, toggleChecked, experimentalEnabled } = props;

    const [isClicked, setIsClicked] = React.useState<boolean>(isMutationInProgress);

    const handleSave = () => {
        if (!isClicked) {
            onSave();
            setIsClicked(true);
        }
    };

    return (
        <div className={classes.footer}>
            <div className={classes.stmtEditorToggle}>
                {experimentalEnabled && statementEditor && (
                    <StatementEditorButton handleChange={handleStmtEditorToggle} checked={toggleChecked} />
                )}
            </div>
            <div className={classes.buttonWrapper}>
                <div className={classes.spaceBetween}>
                    {cancelBtn && <SecondaryButton text={cancelBtnText} fullWidth={false} onClick={onCancel} />}
                </div>
                <div className={classes.spaceBetween}>
                    <PrimaryButton
                        data-testid="save-btn"
                        text={saveBtnText}
                        disabled={isClicked || !validForm}
                        fullWidth={false}
                        onClick={handleSave}
                    />
                </div>
            </div>
        </div>
    );
}
