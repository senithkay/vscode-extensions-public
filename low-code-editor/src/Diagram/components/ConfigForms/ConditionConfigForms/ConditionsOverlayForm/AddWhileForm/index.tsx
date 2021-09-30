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
// tslint:disable: jsx-no-multiline-js, ordered-imports
import React, { useContext, useState } from "react";

import { Box, FormControl, Typography } from "@material-ui/core";

import { CloseRounded, IfIcon } from "../../../../../../assets/icons";

import { FormField } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { ButtonWithIcon } from "../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { PrimaryButton } from "../../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { useStyles } from "../../../../Portals/ConfigForm/forms/style";
import { ConditionConfig, FormElementProps } from "../../../../Portals/ConfigForm/types";
import { wizardStyles } from "../../../style";
import { FormattedMessage, useIntl } from "react-intl";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../utils/constants";

interface WhileProps {
    condition: ConditionConfig;
    onCancel: () => void;
    onSave: () => void;
}

export function AddWhileForm(props: WhileProps) {
    const { props: { isMutationProgress: isMutationInProgress } } = useContext(Context);
    const { condition, onCancel, onSave } = props;
    const classes = useStyles();
    const overlayClasses = wizardStyles();
    const intl = useIntl();

    const [isInvalid, setIsInvalid] = useState(true);
    const [conditionState, setConditionState] = useState(condition);

    const handleExpEditorChange = (value: string) => {
        setConditionState({ ...conditionState, conditionExpression: value })
    }

    const validateField = (fieldName: string, isInvalidFromField: boolean) => {
        setIsInvalid(isInvalidFromField)
    }

    const formField: FormField = {
        name: "condition",
        displayName: "Condition",
        typeName: "boolean"
    }

    const whileStatementTooltipMessages = {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.whileStatementTooltipMessages.expressionEditor.tooltip.title",
            defaultMessage: "Enter a Ballerina expression."
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.configForms.whileStatementTooltipMessages.expressionEditor.tooltip.actionText",
            defaultMessage: "Learn Ballerina expressions"
        }),
        actionLink: intl.formatMessage({
            id: "lowcode.develop.configForms.whileStatementTooltipMessages.expressionEditor.tooltip.actionTitle",
            defaultMessage: "{learnBallerina}"
        }, { learnBallerina: BALLERINA_EXPRESSION_SYNTAX_PATH })
    };
    const expElementProps: FormElementProps = {
        model: formField,
        customProps: {
            validate: validateField,
            tooltipTitle: whileStatementTooltipMessages.title,
            tooltipActionText: whileStatementTooltipMessages.actionText,
            tooltipActionLink: whileStatementTooltipMessages.actionLink,
            interactive: true,
            statementType: formField.typeName
        },
        onChange: handleExpEditorChange,
        defaultValue: condition.conditionExpression
    };

    const handleOnSaveClick = () => {
        condition.conditionExpression = conditionState.conditionExpression;
        onSave();
    }

    const saveWhileButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.while.saveButton.label",
        defaultMessage: "Save"
    });

    const cancelWhileButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.while.cancelButton.label",
        defaultMessage: "Cancel"
    });

    return (

        <FormControl data-testid="while-form" className={classes.wizardFormControl}>
            <div className={classes.formWrapper}>
                <div className={classes.formWrapper}>
                    <div className={classes.formTitleWrapper}>
                        <div className={classes.mainTitleWrapper}>
                            <div className={classes.iconWrapper}>
                                {/* todo add foreach icon*/}
                                <IfIcon />
                            </div>
                            <Typography variant="h4">
                                <Box paddingTop={2} paddingBottom={2}>
                                    <FormattedMessage
                                        id="lowcode.develop.configForms.while.title"
                                        defaultMessage="While"
                                    />
                                </Box>
                            </Typography>
                        </div>
                    </div>
                    <div className="exp-wrapper">
                        <ExpressionEditor {...expElementProps} />
                    </div>
                </div>
                <div className={overlayClasses.buttonWrapper}>
                    <SecondaryButton text={cancelWhileButtonLabel} fullWidth={false} onClick={onCancel} />
                    <PrimaryButton
                        dataTestId={"while-save-btn"}
                        text={saveWhileButtonLabel}
                        disabled={isMutationInProgress || isInvalid}
                        fullWidth={false}
                        onClick={handleOnSaveClick}
                    />
                </div>
            </div>
        </FormControl>
    );
}

