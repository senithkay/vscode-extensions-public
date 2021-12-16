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
import React, { useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { Box, FormControl, Typography } from "@material-ui/core";
import { ExpressionEditor } from "@wso2-enterprise/ballerina-expression-editor";
import {
    CustomLowCodeContext,
    FormActionButtons,
    FormHeaderSection
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { useStatementEditor } from "@wso2-enterprise/ballerina-statement-editor";
import { ReturnStatement } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../../Contexts/Diagram";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../../utils/constants";
import { createReturnStatement, getInitialSource } from "../../../../../../utils/modification-util";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { ExpressionConfigurable } from "../../../../FormFieldComponents/ExpressionConfigurable";
import { EndConfig } from "../../../../Types";


interface ReturnFormProps {
    config: EndConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export function AddReturnForm(props: ReturnFormProps) {
    const {
        state: { targetPosition: targetPositionDraft },
        props: {
            isMutationProgress: isMutationInProgress,
            currentFile,
            langServerURL,
            syntaxTree,
            diagnostics: mainDiagnostics,
        },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram }
        }
    } = useContext(Context);
    const lowCodeEditorContext: CustomLowCodeContext = {
        targetPosition: targetPositionDraft,
        currentFile,
        langServerURL,
        syntaxTree,
        diagnostics: mainDiagnostics,
        ls: { getExpressionEditorLangClient }
    }
    const { config, formArgs, onCancel, onSave, onWizardClose } = props;
    const classes = useStyles();
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

    const initialSource = formArgs.model ? formArgs.model.source : getInitialSource(createReturnStatement(
        returnExpression ? returnExpression as string : 'EXPRESSION'
    ));

    const handleStatementEditorChange = (partialModel: ReturnStatement) => {
        setReturnExpression(partialModel.expression?.source.trim())
    }

    const { handleStmtEditorToggle, stmtEditorComponent } = useStatementEditor(
        {
            label: intl.formatMessage({ id: "lowcode.develop.configForms.return.statementEditor.label" }),
            initialSource,
            formArgs: { formArgs },
            validForm: isValidValue,
            config,
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
            <FormControl data-testid="return-form" className={classes.wizardFormControl}>
                <FormHeaderSection
                    onCancel={onCancel}
                    statementEditor={true}
                    formTitle={"lowcode.develop.configForms.Return.title"}
                    defaultMessage={"Return"}
                    handleStmtEditorToggle={handleStmtEditorToggle}
                    toggleChecked={false}
                />
                <div className={classes.formContentWrapper}>
                    <div className={classes.formNameWrapper}>
                        <ExpressionEditor
                            model={{ name: "return expression", value: config.expression }}
                            customProps={{
                                validate: validateExpression,
                                tooltipTitle: returnStatementTooltipMessages.title,
                                tooltipActionText: returnStatementTooltipMessages.actionText,
                                tooltipActionLink: returnStatementTooltipMessages.actionLink,
                                interactive: true,
                                customTemplate: {
                                    defaultCodeSnippet: 'return ;',
                                    targetColumn: 8
                                },
                                editPosition: formArgs.targetPosition,
                                initialDiagnostics: formArgs?.model?.expression?.typeData?.diagnostics
                            }}
                            onChange={onReturnValueChange}
                            expressionConfigurable={ExpressionConfigurable}
                            lowCodeEditorContext={lowCodeEditorContext}
                        />
                    </div>
                </div>
                <FormActionButtons
                    cancelBtnText="Cancel"
                    cancelBtn={true}
                    saveBtnText={saveReturnButtonLabel}
                    isMutationInProgress={isMutationInProgress}
                    validForm={isValidValue}
                    onSave={onReturnExpressionSave}
                    onCancel={onCancel}
                />
            </FormControl>
        );
    }
    else {
        return stmtEditorComponent
    }
}
