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

import { CallStatement, FunctionCall, QualifiedNameReference } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";

import { WizardType } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { SelectDropdownWithButton } from "../../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { useStyles as useFormStyles } from "../../../../Portals/ConfigForm/forms/style";
import { LogConfig, ProcessConfig } from "../../../../Portals/ConfigForm/types";
import { wizardStyles } from "../../../style";
import { FormattedMessage, useIntl } from "react-intl";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../utils/constants";
import { FormActionButtons } from "../../../../Portals/ConfigForm/Elements/FormActionButtons";
import { useStatementEditor } from "../../../../Portals/ConfigForm/Elements/StatementEditor/hooks";
import { createLogStatement, getInitialSource } from "../../../../../utils/modification-util";

interface LogConfigProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
}

export const DEFINE_LOG_EXR: string = "Define Log Expression";
export const SELECT_PROPERTY: string = "Select Existing Property";

export function AddLogConfig(props: LogConfigProps) {
    const formClasses = useFormStyles();
    const overlayClasses = wizardStyles();
    const intl = useIntl();

    const {
        props: {
            isMutationProgress: isMutationInProgress,
            isCodeEditorActive
        }
    } = useContext(Context);
    const { config, formArgs, onCancel, onSave } = props;
    const logTypeFunctionNameMap: Map<string, string> = new Map([
        ['printInfo', 'Info'],
        ['printDebug', 'Debug'],
        ['printWarn', 'Warn'],
        ['printError', 'Error']
    ])
    const logTypes: string[] = Array.from(logTypeFunctionNameMap.values());
    const logFormConfig: LogConfig = config.config as LogConfig;

    const logModel: CallStatement = config.model as CallStatement;

    let defaultType = "Info";
    let defaultExpression = "";
    if (logModel) {
        const functionCallModel: FunctionCall = logModel.expression as FunctionCall;
        defaultType = logTypeFunctionNameMap.get((functionCallModel.functionName as QualifiedNameReference).identifier.value);
        defaultExpression = functionCallModel.arguments[0].source;
    }
    const [logType, setLogType] = useState(defaultType);
    const [expression, setExpression] = useState(defaultExpression);
    const [isFormValid, setIsFormValid] = useState(logType && expression);

    const onExpressionChange = (value: any) => {
        setExpression(value);
    };

    const onTypeChange = (value: any) => {
        setLogType(value);
    };

    const onSaveBtnClick = () => {
        logFormConfig.expression = expression;
        logFormConfig.type = logType;
        onSave();
    };

    const validateExpression = (field: string, isInvalid: boolean) => {
        setIsFormValid(!isInvalid && logType);
    };

    const saveLogButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.log.saveButton.label",
        defaultMessage: "Save"
    });

    const logTooltipMessages = {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.logTooltipMessages.expressionEditor.tooltip.title",
            defaultMessage: "Enter a Ballerina expression."
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.configForms.logTooltipMessages.expressionEditor.tooltip.actionText",
            defaultMessage: "Learn Ballerina expressions"
        }),
        actionLink: intl.formatMessage({
            id: "lowcode.develop.configForms.logTooltipMessages.expressionEditor.tooltip.actionTitle",
            defaultMessage: "{learnBallerina}"
        }, { learnBallerina: BALLERINA_EXPRESSION_SYNTAX_PATH })
    }

    const initialSource = getInitialSource(createLogStatement(
        logType,
        expression ? expression : 'EXPRESSION'
    ));

    const {stmtEditorButton , stmtEditorComponent} = useStatementEditor(
        {
            label: intl.formatMessage({id: "lowcode.develop.configForms.log.statementEditor.label"}),
            initialSource,
            formArgs: {formArgs},
            isMutationInProgress,
            validForm: !!isFormValid,
            onSave: onSaveBtnClick,
            onChange: onExpressionChange,
            validate: validateExpression
        }
    );

    if (!stmtEditorComponent) {
        return (
            <FormControl data-testid="log-form" className={formClasses.wizardFormControl}>
                <div className={formClasses.formWrapper}>
                    <div className={formClasses.formFeilds}>
                        <div className={formClasses.formWrapper}>
                            <div className={formClasses.formTitleWrapper}>
                                <div className={formClasses.mainTitleWrapper}>
                                    <Typography variant="h4">
                                        <Box paddingTop={2} paddingBottom={2}><FormattedMessage id="lowcode.develop.configForms.log.title" defaultMessage="Log" /></Box>
                                    </Typography>
                                </div>
                                {stmtEditorButton}
                            </div>
                            <SelectDropdownWithButton
                                defaultValue={logType}
                                onChange={onTypeChange}
                                customProps={{
                                    disableCreateNew: true,
                                    values: logTypes
                                }}
                                placeholder=""
                                label="Type"
                            />
                            <div className="exp-wrapper">
                                <ExpressionEditor
                                    model={{ name: "expression", value: expression, typeName: 'string' }}
                                    customProps={{
                                        validate: validateExpression,
                                        tooltipTitle: logTooltipMessages.title,
                                        tooltipActionText: logTooltipMessages.actionText,
                                        tooltipActionLink: logTooltipMessages.actionLink,
                                        interactive: true,
                                        statementType: 'string',
                                        expressionInjectables: {
                                            list: formArgs?.expressionInjectables?.list,
                                            setInjectables: formArgs?.expressionInjectables?.setInjectables
                                        }
                                    }}
                                    onChange={onExpressionChange}
                                    defaultValue={expression}
                                />
                            </div>
                        </div>
                    </div>
                    <FormActionButtons
                        cancelBtnText="Cancel"
                        saveBtnText={saveLogButtonLabel}
                        isMutationInProgress={isMutationInProgress}
                        validForm={!!isFormValid}
                        onSave={onSaveBtnClick}
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
