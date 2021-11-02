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
// tslint:disable: jsx-no-multiline-js ordered-imports
import React, { useContext, useState } from "react";

import { Box, FormControl, Typography } from "@material-ui/core";

import { IfIcon } from "../../../../../../assets/icons";

import { FormField } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { useStyles } from "../../../../Portals/ConfigForm/forms/style";
import { ConditionConfig, FormElementProps } from "../../../../Portals/ConfigForm/types";
import { wizardStyles } from "../../../style";
import { FormattedMessage, useIntl } from "react-intl";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../utils/constants";
import { FormActionButtons } from "../../../../Portals/ConfigForm/Elements/FormActionButtons";
import { useStatementEditor } from "../../../../Portals/ConfigForm/Elements/StatementEditor/hooks";

interface IfProps {
    condition: ConditionConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
}

export const DEFINE_CONDITION: string = "Define Condition Expression";
export const EXISTING_PROPERTY: string = "Select Boolean Property";

export function AddIfForm(props: IfProps) {
    const {
        props: {
            isCodeEditorActive,
            isMutationProgress: isMutationInProgress
        }
    } = useContext(Context);
    const { condition, formArgs, onCancel, onSave } = props;
    const classes = useStyles();
    const overlayClasses = wizardStyles();
    const intl = useIntl();

    const [isInvalid, setIsInvalid] = useState(true);
    const [conditionState, setConditionState] = useState(condition);

    const handleExpEditorChange = (value: string) => {
        // condition.conditionExpression = value;
        setConditionState({ ...conditionState, conditionExpression: value })
    }

    const validateField = (fieldName: string, isInvalidFromField: boolean) => {
        setIsInvalid(isInvalidFromField)
    }

    const formField: FormField = {
        name: "condition",
        displayName: "Condition",
        typeName: "boolean",
        value: conditionState.conditionExpression,
    }

    const IFStatementTooltipMessages = {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.IFStatementTooltipMessages.expressionEditor.tooltip.title",
            defaultMessage: "Enter a Ballerina expression."
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.configForms.IFStatementTooltipMessages.expressionEditor.tooltip.actionText",
            defaultMessage: "Learn Ballerina expressions"
        }),
        actionLink: intl.formatMessage({
            id: "lowcode.develop.configForms.IFStatementTooltipMessages.expressionEditor.tooltip.actionTitle",
            defaultMessage: "{learnBallerina}"
        }, { learnBallerina: BALLERINA_EXPRESSION_SYNTAX_PATH })
    };

    const expElementProps: FormElementProps = {
        model: formField,
        customProps: {
            validate: validateField,
            tooltipTitle: IFStatementTooltipMessages.title,
            tooltipActionText: IFStatementTooltipMessages.actionText,
            tooltipActionLink: IFStatementTooltipMessages.actionLink,
            interactive: true,
            statementType: formField.typeName,
            expressionInjectables: {
                list: formArgs?.expressionInjectables?.list,
                setInjectables: formArgs?.expressionInjectables?.setInjectables
            }
        },
        onChange: handleExpEditorChange,
        defaultValue: condition.conditionExpression
    };

    const handleOnSaveClick = () => {
        condition.conditionExpression = conditionState.conditionExpression;
        onSave();
    }

    const saveIfConditionButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.if.saveButton.label",
        defaultMessage: "Save"
    });

    const cancelIfButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.if.cancelButton.label",
        defaultMessage: "Cancel"
    });

    const {stmtEditorButton , stmtEditorComponent} = useStatementEditor(
        {
            label: intl.formatMessage({id: "lowcode.develop.configForms.if.statementEditor.label"}),
            initialSource: "", // TODO: Pass the actual initialSource
            formArgs: {formArgs},
            isMutationInProgress,
            validForm: !isInvalid,
            onSave: handleOnSaveClick,
            onChange: handleExpEditorChange,
            validate: validateField
        },
        true);

    if (!stmtEditorComponent) {
        return (
                <FormControl data-testid="if-form" className={classes.wizardFormControl}>
                    <div className={classes.formWrapper}>
                        <div className={classes.formFeilds}>
                            <div className={classes.formWrapper}>
                                <div className={classes.formTitleWrapper}>
                                    <div className={classes.mainTitleWrapper}>
                                        <Typography variant="h4">
                                            <Box paddingTop={2} paddingBottom={2}>
                                                <FormattedMessage
                                                    id="lowcode.develop.configForms.if.title"
                                                    defaultMessage="If"
                                                />
                                            </Box>
                                        </Typography>
                                    </div>
                                    {stmtEditorButton}
                                </div>
                                <div className="exp-wrapper">
                                    <ExpressionEditor {...expElementProps} />
                                </div>
                            </div>
                        </div>
                        <FormActionButtons
                            cancelBtnText={cancelIfButtonLabel}
                            saveBtnText={saveIfConditionButtonLabel}
                            isMutationInProgress={isMutationInProgress}
                            validForm={!isInvalid}
                            onSave={handleOnSaveClick}
                            onCancel={onCancel}
                        />
                    </div>
                </FormControl>
            );
    }
    else {
        return stmtEditorComponent;
    }
}
