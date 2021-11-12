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
// tslint:disable: jsx-no-multiline-js ordered-imports
import React, { useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import classnames from "classnames";
import {Box, FormControl, Typography} from "@material-ui/core";

import { FormField } from "../../../../../../../ConfigurationSpec/types";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../../utils/constants";
import { Context } from "../../../../../../../Contexts/Diagram";
import { createWhileStatement, getInitialSource } from "../../../../../../utils/modification-util";
import ExpressionEditor from "../../../../FormFieldComponents/ExpressionEditor";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { FormActionButtons } from "../../../../FormFieldComponents/FormActionButtons";
import { useStatementEditor } from "../../../../FormFieldComponents/StatementEditor/hooks";
import { ConditionConfig, FormElementProps } from "../../../../Types";

export interface WhileProps {
    condition: ConditionConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
}

export function AddWhileForm(props: WhileProps) {
    const { props: { isMutationProgress: isMutationInProgress } } = useContext(Context);
    const { condition, formArgs, onCancel, onSave } = props;
    const classes = useStyles();
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
        typeName: "boolean",
        value: conditionState.conditionExpression,
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

    const saveWhileButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.while.saveButton.label",
        defaultMessage: "Save"
    });

    const cancelWhileButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.while.cancelButton.label",
        defaultMessage: "Cancel"
    });

    const initialSource = getInitialSource(createWhileStatement(
        conditionState.conditionExpression ? conditionState.conditionExpression as string : 'EXPRESSION'
    ));

    const {stmtEditorButton , stmtEditorComponent} = useStatementEditor(
        {
            label: intl.formatMessage({id: "lowcode.develop.configForms.while.statementEditor.label"}),
            initialSource,
            formArgs: {formArgs},
            isMutationInProgress,
            validForm: !isInvalid,
            config: condition,
            onSave: handleOnSaveClick,
            validate: validateField
        }
    );

    if (!stmtEditorComponent) {
        return  (
                <FormControl data-testid="while-form" className={classes.wizardFormControl}>
                    <div className={classes.formWrapper}>
                        <div className={classes.formFeilds}>
                            <div className={classes.formWrapper}>
                                <div className={classes.formTitleWrapper}>
                                    <div className={classes.mainTitleWrapper}>
                                        <Typography variant="h4">
                                            <Box paddingTop={2} paddingBottom={2}>
                                                <FormattedMessage
                                                    id="lowcode.develop.configForms.while.title"
                                                    defaultMessage="While"
                                                />
                                            </Box>
                                        </Typography>
                                    </div>
                                    {stmtEditorButton}
                                </div>
                                <div className={classes.codeWrapper}>
                                    <div className={classes.start}>
                                        <Typography variant='body2' className={classnames(classes.startCode, classes.code)}>while</Typography>
                                    </div>
                                    <div className={classes.middle}>
                                        <ExpressionEditor {...expElementProps} hideLabelTooltips={true} />
                                    </div>
                                    <div className={classes.end}>
                                        <Typography variant='body2' className={classnames(classes.endCode, classes.code)}>{`{`}</Typography>
                                    </div>
                                </div>
                                <div className={classes.codeWrapper}>
                                    <div>
                                        <Typography variant='body2' className={classnames(classes.middleCode, classes.code)}>...</Typography>
                                    </div>
                                </div>
                                <div className={classes.codeWrapper}>
                                    <div>
                                        <Typography variant='body2' className={classnames(classes.endCode, classes.code)}>{`}`}</Typography>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <FormActionButtons
                            cancelBtnText={cancelWhileButtonLabel}
                            saveBtnText={saveWhileButtonLabel}
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
