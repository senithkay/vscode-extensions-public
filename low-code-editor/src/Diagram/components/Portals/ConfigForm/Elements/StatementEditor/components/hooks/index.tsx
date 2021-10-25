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
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { Box, FormControl, Typography } from "@material-ui/core";

import { StatementEditorButton } from "../Button/StatementEditorButton";
import { ViewContainer, ViewProps } from "../ViewContainer/ViewContainer";

import { useStyles } from "./style";

export const useStatementEdior = (props: ViewProps, disabled: boolean) => {
    const {
        kind,
        label,
        formArgs,
        userInputs,
        validate,
        isMutationInProgress,
        validForm,
        onSave,
        onChange
    } = props;
    const classes = useStyles();

    const [isStmtEditor, setIsStmtEditor] = useState(false);


    const handleStmtEditorButtonClick = () => {
        setIsStmtEditor(true);
    };

    const handleStmtEditorCancel = () => {
        setIsStmtEditor(false);
    };

    const stmtButton =
        (
            <div style={{marginLeft: "auto", marginRight: 0}}>
                <StatementEditorButton onClick={handleStmtEditorButtonClick} disabled={disabled} />
            </div>
        );

    const stmtEditor =
        isStmtEditor ? (
        <FormControl data-testid="property-form">
            <div>
                <div className={classes.formTitleWrapper}>
                    <div className={classes.mainTitleWrapper}>
                        <Typography variant="h4">
                            <Box paddingTop={2} paddingBottom={2}><FormattedMessage id="lowcode.develop.configForms.statementEditor.title" defaultMessage="Statement Editor" /></Box>
                        </Typography>
                    </div>
                </div>
                <ViewContainer
                    kind={kind}// TODO: Derive the kind from the user input
                    label={label}
                    formArgs={formArgs}
                    userInputs={userInputs}
                    isMutationInProgress={isMutationInProgress}
                    validForm={validForm}
                    onCancel={handleStmtEditorCancel}
                    onSave={onSave}
                    onChange={onChange}
                    validate={validate}
                />
            </div>
        </FormControl>
        ) : null;

    return {
        stmtButton,
        stmtEditor
    }
}
