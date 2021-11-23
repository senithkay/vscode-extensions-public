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

import { WhileStatement } from "@ballerina/syntax-tree";
import classnames from "classnames";
import {FormControl, Typography } from "@material-ui/core";

import { FormField, FormHeaderSection, } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../../utils/constants";
import { Context } from "../../../../../../../Contexts/Diagram";
import { createWhileStatement, getInitialSource } from "../../../../../../utils/modification-util";
import ExpressionEditor from "../../../../FormFieldComponents/ExpressionEditor";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { FormActionButtons } from "../../../../FormFieldComponents/FormActionButtons";
import { useStatementEditor } from "@wso2-enterprise/ballerina-statement-editor";
import { ConditionConfig, FormElementProps } from "../../../../Types";

export interface WhileProps {
    condition: ConditionConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export function AddWhileForm(props: WhileProps) {
    const {
        props: { isMutationProgress: isMutationInProgress, currentFile },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram }
        }
    } = useContext(Context);
    const { condition, formArgs, onCancel, onSave, onWizardClose } = props;
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

    const handleStatementEditorChange = (partialModel: WhileStatement) => {
        setConditionState({ ...conditionState, conditionExpression: partialModel.condition.source.trim() })
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

    const { handleStmtEditorToggle, stmtEditorComponent } = useStatementEditor(
        {
            label: intl.formatMessage({ id: "lowcode.develop.configForms.while.statementEditor.label" }),
            initialSource,
            formArgs: {formArgs},
            validForm: !isInvalid,
            config: condition,
            onWizardClose,
            handleStatementEditorChange,
            onCancel,
            currentFile,
            getLangClient: getExpressionEditorLangClient,
            applyModifications: modifyDiagram
        }
    );

    if (!stmtEditorComponent) {
        return (
            <FormControl data-testid="while-form" className={classes.wizardFormControl}>
                <FormHeaderSection
                    onCancel={onCancel}
                    statementEditor={true}
                    formTitle={"lowcode.develop.configForms.while.title"}
                    defaultMessage={"While"}
                    handleStmtEditorToggle={handleStmtEditorToggle}
                    toggleChecked={false}

                />
                <div className={classes.formWrapper}>
                    <div className={classes.formFeilds}>
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
