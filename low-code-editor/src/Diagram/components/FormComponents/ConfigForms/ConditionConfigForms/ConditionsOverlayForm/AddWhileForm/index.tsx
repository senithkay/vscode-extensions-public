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

import { WhileStatement } from "@wso2-enterprise/syntax-tree";
import { FormControl, Typography } from "@material-ui/core";

import { FormField, FormActionButtons, FormHeaderSection, } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { Context } from "../../../../../../../Contexts/Diagram";
import { createWhileStatement, getInitialSource } from "../../../../../../utils/modification-util";
import ExpressionEditor, { ExpressionEditorProps } from "../../../../FormFieldComponents/ExpressionEditor";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { useStatementEditor } from "@wso2-enterprise/ballerina-statement-editor";
import { ConditionConfig, FormElementProps } from "../../../../Types";
import Tooltip from '../../../../../../../components/TooltipV2'

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
            defaultMessage: "Press CTRL+Spacebar for suggestions."
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.configForms.whileStatementTooltipMessages.expressionEditor.tooltip.actionText",
            defaultMessage: "Learn about Ballerina expressions here"
        }),
        actionLink: intl.formatMessage({
            id: "lowcode.develop.configForms.whileStatementTooltipMessages.expressionEditor.tooltip.actionTitle",
            defaultMessage: "{learnBallerina}"
        }, { learnBallerina: "https://ballerina.io/learn/by-example/while-statement.html?is_ref_by_example=true" }),
        codeBlockTooltip: intl.formatMessage({
            id: "lowcode.develop.configForms.IFStatementTooltipMessages.expressionEditor.tooltip.codeBlock",
            defaultMessage: "To add code inside the while block, save while statement form and use the diagram add buttons",
        }),
    };
    const expElementProps: FormElementProps<ExpressionEditorProps> = {
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
            },
            initialDiagnostics: formArgs?.model?.condition?.typeData?.diagnostics,
            editPosition: {
                startLine: formArgs?.model ? formArgs?.model.position.startLine : formArgs.targetPosition.startLine,
                endLine: formArgs?.model ? formArgs?.model.position.startLine : formArgs.targetPosition.startLine,
                startColumn: 0,
                endColumn: 0
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

    const initialSource = formArgs.model ? formArgs.model.source : getInitialSource(createWhileStatement(
        conditionState.conditionExpression ? conditionState.conditionExpression as string : 'EXPRESSION'
    ));

    const { handleStmtEditorToggle, stmtEditorComponent } = useStatementEditor(
        {
            label: intl.formatMessage({ id: "lowcode.develop.configForms.while.statementEditor.label" }),
            initialSource,
            formArgs: { formArgs },
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
                <div className={classes.formContentWrapper}>
                    <div className={classes.formCodeBlockWrapper}>
                        <div className={classes.formCodeExpressionEndWrapper}>
                            <Typography variant='body2' className={classes.startCode}>while</Typography>
                            <div className={classes.formCodeExpressionField}>
                                <ExpressionEditor {...expElementProps} />
                            </div>
                            <Typography variant='body2' className={classes.endCode}>{`{`}</Typography>
                        </div>
                    </div>
                    <div className={classes.formCodeExpressionValueRegularField}>
                        <div className={classes.middleDottedwrapper}>
                            <Tooltip type='info' text={{ content: whileStatementTooltipMessages.codeBlockTooltip }}>
                                <Typography variant='body2' className={classes.middleCode}>{`...`}</Typography>
                            </Tooltip>
                        </div>
                        <Typography variant='body2' className={classes.endCode}>{`}`}</Typography>
                    </div>
                </div>
                <FormActionButtons
                    cancelBtn={true}
                    cancelBtnText={cancelWhileButtonLabel}
                    saveBtnText={saveWhileButtonLabel}
                    isMutationInProgress={isMutationInProgress}
                    validForm={!isInvalid && (conditionState?.conditionExpression as string)?.length > 0}
                    onSave={handleOnSaveClick}
                    onCancel={onCancel}
                />
            </FormControl>
        );
    }
    else {
        return stmtEditorComponent;
    }
}
