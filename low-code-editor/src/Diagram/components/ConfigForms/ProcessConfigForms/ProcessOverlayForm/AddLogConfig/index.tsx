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
import { CloseRounded } from "@material-ui/icons";

import { LogIcon } from "../../../../../../assets/icons";

import { WizardType } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { ButtonWithIcon } from "../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { PrimaryButton } from "../../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { useStyles as useFormStyles } from "../../../../Portals/ConfigForm/forms/style";
import { LogConfig, ProcessConfig } from "../../../../Portals/ConfigForm/types";
import { tooltipMessages } from "../../../../Portals/utils/constants";
import { wizardStyles } from "../../../style";

interface LogConfigProps {
    config: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
}

export const DEFINE_LOG_EXR: string = "Define Log Expression";
export const SELECT_PROPERTY: string = "Select Existing Property";

export function AddLogConfig(props: LogConfigProps) {
    const formClasses = useFormStyles();
    const overlayClasses = wizardStyles();

    const { state } = useContext(Context);
    const { isMutationProgress: isMutationInProgress } = state;
    const { config, onCancel, onSave } = props;
    const isExisting = config.wizardType === WizardType.EXISTING;
    const logTypeFunctionNameMap: Map<string, string> = new Map([
        ['printError', 'Error'],
        ['print', 'Info']
    ])
    const logTypes: string[] = ["Info", "Error"];
    const logFormConfig: LogConfig = config.config as LogConfig;

    let defaultType = "Info";
    let defaultExpression = "";
    if (isExisting) {
        const logModel: CallStatement = config.model as CallStatement;
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
        logFormConfig.type = logType === "Info" ? "" : logType;
        onSave();
    }

    const validateExpression = (field: string, isInvalid: boolean) => {
        setIsFormValid(!isInvalid && logType);
    }
    return (
        <FormControl data-testid="log-form" className={formClasses.wizardFormControl}>

            <div className={overlayClasses.configWizardContainer}>
                <div className={formClasses.formWrapper}>
                    <ButtonWithIcon
                        className={formClasses.overlayDeleteBtn}
                        onClick={onCancel}
                        icon={<CloseRounded fontSize="small" />}
                    />
                    <div className={formClasses.formTitleWrapper}>
                        <div className={formClasses.mainTitleWrapper}>
                            <div className={formClasses.iconWrapper}>
                                <LogIcon />
                            </div>
                            <Typography variant="h4">
                                <Box paddingTop={2} paddingBottom={2}>Log</Box>
                            </Typography>
                        </div>
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
                            model={{ name: "expression", type: 'string' }}
                            customProps={{
                                validate: validateExpression,
                                tooltipTitle: tooltipMessages.expressionEditor.title,
                                tooltipActionText: tooltipMessages.expressionEditor.actionText,
                                tooltipActionLink: tooltipMessages.expressionEditor.actionLink,
                                interactive: true,
                                statementType: 'string'
                            }}
                            onChange={onExpressionChange}
                            defaultValue={expression}
                        />
                    </div>
                </div>
                <div className={overlayClasses.buttonWrapper}>
                    <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                    <PrimaryButton
                        dataTestId={"log-save-btn"}
                        text="Save"
                        disabled={isMutationInProgress || !isFormValid}
                        fullWidth={false}
                        onClick={onSaveBtnClick}
                    />
                </div>
            </div>
        </FormControl>
    );
}

