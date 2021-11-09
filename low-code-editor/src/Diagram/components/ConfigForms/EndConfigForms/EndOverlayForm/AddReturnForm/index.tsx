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
// tslint:disable: ordered-imports
import React, { useContext, useState } from "react";

import { Box, FormControl, Typography } from "@material-ui/core";

import { Context } from "../../../../../../Contexts/Diagram";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { useStyles } from "../../../../Portals/ConfigForm/forms/style";
import { EndConfig } from "../../../../Portals/ConfigForm/types";
import { wizardStyles } from "../../../style";

import { FormattedMessage, useIntl } from "react-intl";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../utils/constants";
import { FormActionButtons } from "../../../../Portals/ConfigForm/Elements/FormActionButtons";
import { useStatementEditor } from "../../../../Portals/ConfigForm/Elements/StatementEditor/hooks";
import { createReturnStatement, getInitialSource } from "../../../../../utils/modification-util";

interface ReturnFormProps {
    config: EndConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
}

export function AddReturnForm(props: ReturnFormProps) {
    const {
        props: {
            isMutationProgress: isMutationInProgress
        }
    } = useContext(Context);
    const { config, formArgs, onCancel, onSave } = props;
    const classes = useStyles();
    const overlayClasses = wizardStyles();
    const intl = useIntl();

    const [returnExpression, setReturnExpression] = useState(config.expression);
    const onReturnValueChange = (value: any) => {
        setReturnExpression(value);
    };

    const onReturnExpressionSave = () => {
        config.expression = returnExpression;
        onSave();
    }

    const [isValidValue, setIsValidValue] = useState(true);
    const validateExpression = (fieldName: string, isInvalid: boolean) => {
        setIsValidValue(!isInvalid || (returnExpression === ""));
    };

    const saveReturnButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.return.saveButton.label",
        defaultMessage: "Save"
    });

    const returnStatementTooltipMessages = {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.returnStatementTooltipMessages.expressionEditor.tooltip.title",
            defaultMessage: "Enter a Ballerina expression."
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.configForms.returnStatementTooltipMessages.expressionEditor.tooltip.actionText",
            defaultMessage: "Learn Ballerina expressions"
        }),
        actionLink: intl.formatMessage({
            id: "lowcode.develop.configForms.returnStatementTooltipMessages.expressionEditor.tooltip.actionTitle",
            defaultMessage: "{learnBallerina}"
        }, { learnBallerina: BALLERINA_EXPRESSION_SYNTAX_PATH })
    };

    const initialSource = getInitialSource(createReturnStatement(
        returnExpression ? returnExpression as string : 'EXPRESSION'
    ));

    const {stmtEditorButton , stmtEditorComponent} = useStatementEditor(
        {
            label: intl.formatMessage({id: "lowcode.develop.configForms.return.statementEditor.label"}),
            initialSource,
            formArgs: {formArgs},
            isMutationInProgress,
            validForm: isValidValue,
            onSave: onReturnExpressionSave,
            onChange: onReturnValueChange,
            validate: validateExpression
        }
    );

    if (!stmtEditorComponent){
        return (
                <FormControl data-testid="return-form" className={classes.wizardFormControl}>
                    <div className={classes.formWrapper}>
                        <div className={classes.formFeilds}>
                            <div className={classes.formTitleWrapper}>
                                <div className={classes.mainTitleWrapper}>
                                    <Typography variant="h4">
                                        <Box paddingTop={2} paddingBottom={2}><FormattedMessage id="lowcode.develop.configForms.Return.title" defaultMessage="Return" /></Box>
                                    </Typography>
                                </div>
                                <div className={classes.statementEditor}>
                                    {stmtEditorButton}
                                </div>
                            </div>
                            <div className={classes.blockWrapper}>
                                <div className={classes.returnWrapper}>
                                    <div className="exp-wrapper">
                                        <ExpressionEditor
                                            model={{ name: "return expression", type: "var", value: config.expression }}
                                            customProps={{
                                                validate: validateExpression,
                                                tooltipTitle: returnStatementTooltipMessages.title,
                                                tooltipActionText: returnStatementTooltipMessages.actionText,
                                                tooltipActionLink: returnStatementTooltipMessages.actionLink,
                                                interactive: true,
                                                statementType: 'var'
                                            }}
                                            onChange={onReturnValueChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <FormActionButtons
                            cancelBtnText="Cancel"
                            saveBtnText={saveReturnButtonLabel}
                            isMutationInProgress={isMutationInProgress}
                            validForm={isValidValue}
                            onSave={onReturnExpressionSave}
                            onCancel={onCancel}
                        />
                    </div>
                </FormControl>
            );
    }
    else {
        return stmtEditorComponent
    }
}
