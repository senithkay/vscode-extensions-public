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

import { CallStatement, FunctionCall, PositionalArg, QualifiedNameReference } from "@ballerina/syntax-tree";
import { Box, FormControl, FormHelperText, Typography } from "@material-ui/core";

import { WizardType } from "../../../../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { PrimaryButton } from "../../../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../Elements/DropDown/SelectDropdownWithButton";
import { RadioControl } from "../../../../Elements/RadioControl/FormRadioControl";
import { FormTextInput } from "../../../../Elements/TextField/FormTextInput";
import { LogConfig, ProcessConfig } from "../../../../types";
import { useStyles as useFormStyles } from "../../../style";

interface LogFormProps {
    config: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
    // isMutationInProgress: boolean;
}

export const DEFINE_LOG_EXR: string = "Define Log Expression";
export const SELECT_PROPERTY: string = "Select Existing Property";

export function AddLogForm(props: LogFormProps) {
    const { isMutationProgress: isMutationInProgress } = useContext(DiagramContext).state;
    const formClasses = useFormStyles();
    const { config, onCancel, onSave } = props;
    const isExisting = config.wizardType === WizardType.EXISTING;
    const logFormConfig: LogConfig = config.config as LogConfig;
    let isExpressionSimpleRef = false;
    const logTypeFunctionNameMap: Map<string, string> = new Map([
        ['printDebug', 'Debug'],
        ['printError', 'Error'],
        ['printInfo', 'Info'],
        ['printTrace', 'Trace'],
        ['printWarn', 'Warn']
    ])
    const logTypes: string[] = ["Debug", "Error", "Info", "Trace", "Warn"];

    if (isExisting) {
        const logModel: CallStatement = config.model as CallStatement;
        const functionCallModel: FunctionCall = logModel.expression as FunctionCall;
        logFormConfig.type = logTypeFunctionNameMap.get((functionCallModel.functionName as QualifiedNameReference).identifier.value);
        logFormConfig.expression = functionCallModel.arguments[0].source;
        isExpressionSimpleRef = (functionCallModel.arguments[0] as PositionalArg).expression.kind === 'SimpleNameReference';
    }


    const [logType, setLogType] = useState(logFormConfig.type);
    const [customExpression, setCustomExpression] = useState(!isExpressionSimpleRef);

    const isFormValid = (): boolean => {
        return (logFormConfig.type !== '') && (logFormConfig.expression !== '');
    };

    const [validForm, setValidForm] = useState(isFormValid());

    const onExpressionChange = (value: any) => {
        setCustomExpression(true);
        logFormConfig.expression = value;
        setValidForm(isFormValid());
    };

    const onTypeChange = (value: any) => {
        logFormConfig.type = value;
        setLogType(value);
        setValidForm(isFormValid());
    };

    const onDropdownChange = (value: string) => {
        setCustomExpression((value === ''));
        logFormConfig.expression = '';
        if (value) {
            logFormConfig.expression = value;
            setValidForm(isFormValid());
        }
    };

    const onExistingRadioBtnChange = (value: string) => {
        setCustomExpression((value === SELECT_PROPERTY));
        if (value === SELECT_PROPERTY) {
            logFormConfig.expression = '';
            setCustomExpression(false);
        }
        setValidForm(false);
    };

    const onDefineRadioBtnChange = (value: string) => {
        setCustomExpression((value === DEFINE_LOG_EXR));
        if (value === DEFINE_LOG_EXR) {
            logFormConfig.expression = '';
            setCustomExpression(true);
        }
        setValidForm(false);
    };

    const defineExprDefaultVal: string = customExpression ? DEFINE_LOG_EXR : "";
    const existingExprDefaultVal: string = customExpression ? "" : SELECT_PROPERTY;

    const existingActiveClass = customExpression ? formClasses.inActiveWrapper : null;
    const customActiveClass = !customExpression ? formClasses.inActiveWrapper : null;
    const expressionRegex = new RegExp(/(.*[\+\-\/\*\<\>\=\;\^\s\&\|\!\%\.\,\?\$])+$/g);

    const validateExpressionValue = (value: string) => {
        if (value && value.length > 0) {
            return !expressionRegex.test(value);
        }
        return true;
    };

    return (
        <FormControl data-testid="log-form" className={formClasses.wizardFormControl}>
            <div className={formClasses.formTitleWrapper}>
                <div className={formClasses.mainTitleWrapper}>
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2}>Log</Box>
                    </Typography>
                    <img src="../../../../../../images/Log.svg" />
                </div>
            </div>
            <div className={formClasses.formWrapper}>
                <SelectDropdownWithButton
                    defaultValue={logType}
                    onChange={onTypeChange}
                    customProps={{
                        disableCreateNew: true,
                        values: logTypes
                    }}
                    placeholder="Select Type"
                    label="Select Log Type"
                />

                <div className={formClasses.labelWrapper}>
                    <FormHelperText className={formClasses.inputLabelForRequired}>Log Expression</FormHelperText>
                    <FormHelperText className={formClasses.starLabelForRequired}>*</FormHelperText>
                </div>
                <div className={formClasses.groupedForm}>
                    <RadioControl
                        onChange={onExistingRadioBtnChange}
                        defaultValue={existingExprDefaultVal}
                        customProps={{ collection: [SELECT_PROPERTY], disabled: !(config.scopeSymbols.length > 0) }}
                    />
                    <div className={existingActiveClass}>
                        <SelectDropdownWithButton
                            customProps={{
                                disableCreateNew: true, values: config.scopeSymbols, clearSelection: customExpression
                            }}
                            onChange={onDropdownChange}
                            placeholder="Select Property"
                            defaultValue={isExpressionSimpleRef ? logFormConfig.expression : ''}
                        />
                    </div>

                    <div className={formClasses.divider} />

                    <RadioControl
                        onChange={onDefineRadioBtnChange}
                        defaultValue={defineExprDefaultVal}
                        customProps={{ collection: [DEFINE_LOG_EXR] }}
                    />
                    <div className={customActiveClass}>
                        <FormTextInput
                            customProps={{
                                clearInput: !customExpression,
                                validate: validateExpressionValue,
                            }}
                            onChange={onExpressionChange}
                            placeholder={'eg: "error occurred:" + error.reason()'}
                            defaultValue={isExpressionSimpleRef ? '' : logFormConfig.expression}
                        />
                    </div>
                </div>

                <div className={formClasses.wizardBtnHolder}>
                    <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                    <PrimaryButton
                        text="Save"
                        disabled={isMutationInProgress || !validForm}
                        fullWidth={false}
                        onClick={onSave}
                    />
                </div>
                <div className={formClasses.formCreate} />
            </div>
        </FormControl>
    );
}

// const mapStateToProps = ({ diagramState }: PortalState) => {
//     const { isMutationProgress } = diagramState;
//     return {
//         isMutationInProgress: isMutationProgress,
//     }
// };

// export const AddLogForm = connect(mapStateToProps)(AddLogFormC);
