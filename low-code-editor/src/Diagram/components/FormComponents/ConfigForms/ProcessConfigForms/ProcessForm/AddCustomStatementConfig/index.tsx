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
// tslint:disable: ordered-imports
import React, { useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { Box, FormControl, Typography } from "@material-ui/core";

import { Context } from "../../../../../../../Contexts/Diagram";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../../utils/constants";
import ExpressionEditor from "../../../../FormFieldComponents/ExpressionEditor";
import { useStatementEditor } from "@wso2-enterprise/ballerina-statement-editor";
import { useStyles as useFormStyles } from "../../../../DynamicConnectorForm/style";
import { CustomExpressionConfig, ProcessConfig } from "../../../../Types";
import { wizardStyles } from "../../../style";
import { STNode } from "@wso2-enterprise/syntax-tree";
import { FormActionButtons, FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

interface LogConfigProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export function AddCustomStatementConfig(props: LogConfigProps) {
    const formClasses = useFormStyles();
    const overlayClasses = wizardStyles();
    const intl = useIntl();

    const {
        props: {
            isMutationProgress: isMutationInProgress,
            currentFile
        },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram }
        }
    } = useContext(Context);
    const { config, formArgs, onCancel, onSave, onWizardClose } = props;

    const expressionFormConfig: CustomExpressionConfig = config.config as CustomExpressionConfig;

    let defaultExpression = "";
    if (config?.model) {
        defaultExpression = config?.model?.source.trim();
    }

    const [expression, setExpression] = useState(defaultExpression);
    const [isFormValid, setIsFormValid] = useState(!!expression);

    const onExpressionChange = (value: any) => {
        setExpression(value);
    };

    const onSaveBtnClick = () => {
        expressionFormConfig.expression = expression;
        onSave();
    }

    const validateExpression = (_field: string, isInvalid: boolean) => {
        const isValidExpression = !isInvalid ? (expression !== undefined && expression !== "") : false;
        setIsFormValid(isValidExpression);
    }

    const saveCustomStatementButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.customStatement.saveButton.label",
        defaultMessage: "Save"
    });

    const customStatementTooltipMessages = {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.customStatement.expressionEditor.tooltip.title",
            defaultMessage: "Enter a Ballerina expression."
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.configForms.customStatement.expressionEditor.tooltip.actionText",
            defaultMessage: "Learn Ballerina expressions"
        }),
        actionLink: intl.formatMessage({
            id: "lowcode.develop.configForms.customStatement.expressionEditor.tooltip.actionTitle",
            defaultMessage: "{learnBallerina}"
        }, { learnBallerina: BALLERINA_EXPRESSION_SYNTAX_PATH })
    }

    const handleStatementEditorChange = (partialModel: STNode) => {
        setExpression(partialModel.source.trim());
    }

    const { handleStmtEditorToggle, stmtEditorComponent } = useStatementEditor(
        {
            label: intl.formatMessage({ id: "lowcode.develop.configForms.customStatement.statementEditor.label" }),
            initialSource: formArgs?.model ? formArgs.model?.source : (expression ? expression : "EXPRESSION"),
            formArgs: { formArgs },
            validForm: isFormValid,
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
            <FormControl data-testid="custom-expression-form" className={formClasses.wizardFormControl}>
                <FormHeaderSection
                    onCancel={onCancel}
                    statementEditor={true}
                    formTitle={"lowcode.develop.configForms.customStatement.title"}
                    defaultMessage={"Other"}
                    handleStmtEditorToggle={handleStmtEditorToggle}
                    toggleChecked={false}
                />
                <div className={formClasses.formContentWrapper}>
                    <div className={formClasses.formNameWrapper}>
                        <ExpressionEditor
                            model={{ name: "statement", value: expression }}
                            customProps={{
                                validate: validateExpression,
                                tooltipTitle: customStatementTooltipMessages.title,
                                tooltipActionText: customStatementTooltipMessages.actionText,
                                tooltipActionLink: customStatementTooltipMessages.actionLink,
                                interactive: true,
                                customTemplate: {
                                    defaultCodeSnippet: '',
                                    targetColumn: 1,
                                },
                                editPosition: config?.model?.position || config?.targetPosition,
                                initialDiagnostics: config?.model?.typeData?.diagnostics,
                                disableFiltering: true
                            }}
                            onChange={onExpressionChange}
                        />
                    </div>
                </div>
                <FormActionButtons
                    cancelBtnText="Cancel"
                    cancelBtn={true}
                    saveBtnText={saveCustomStatementButtonLabel}
                    isMutationInProgress={isMutationInProgress}
                    validForm={isFormValid}
                    onSave={onSaveBtnClick}
                    onCancel={onCancel}
                />
            </FormControl>
        );
    }
    else {
        return stmtEditorComponent;
    }
}
