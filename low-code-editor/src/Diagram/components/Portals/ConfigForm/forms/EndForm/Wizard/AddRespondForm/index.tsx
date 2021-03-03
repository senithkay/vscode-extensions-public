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

import { ActionStatement, RemoteMethodCallAction } from "@ballerina/syntax-tree";
import { Box, FormControl, FormHelperText, Typography } from "@material-ui/core";

import { WizardType } from "../../../../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { PrimaryButton } from "../../../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../Elements/DropDown/SelectDropdownWithButton";
import { RadioControl } from "../../../../Elements/RadioControl/FormRadioControl";
import { FormTextInput } from "../../../../Elements/TextField/FormTextInput";
import { EndConfig, RespondConfig } from "../../../../types";
import { useStyles as useFormStyles } from "../../../style";

import { RespondIcon } from "../../../../../../../../assets/icons";

interface RespondFormProps {
    config: EndConfig;
    onCancel: () => void;
    onSave: () => void;
}

export const DEFINE_RESPOND_EXP: string = "Define Respond Expression";
export const EXISTING_PROPERTY: string = "Select Existing Property";

export function AddRespondForm(props: RespondFormProps) {
    const { state } = useContext(DiagramContext);
    const { isMutationProgress: isMutationInProgress } = state;
    const formClasses = useFormStyles();
    const { config, onCancel, onSave } = props;
    let initIsExp = !(config.scopeSymbols.length > 0);

    const respondFormConfig: RespondConfig = config.expression as RespondConfig;

    if (config.wizardType === WizardType.EXISTING) {
        const respondModel: ActionStatement = config.model as ActionStatement;
        const remoteCallModel: RemoteMethodCallAction = respondModel.expression.expression as RemoteMethodCallAction;
        respondFormConfig.respondExpression = remoteCallModel.arguments[0].source;
        const regexp = /"(.*?)"/g;
        initIsExp = !(config.scopeSymbols.length > 0) && !regexp.test(respondFormConfig.respondExpression);
    }

    const [isExpression, setIsExpression] = useState(initIsExp);

    const isFormValid = (): boolean => {
        return (respondFormConfig.caller !== '') && (respondFormConfig.respondExpression !== '');
    };

    const [validForm, setValidForm] = useState(isFormValid());

    const onExpressionChange = (value: any) => {
        setIsExpression(true);
        respondFormConfig.respondExpression = value;
        setValidForm(isFormValid());
    };

    const customExprDefaultVal: string = isExpression ? DEFINE_RESPOND_EXP : "";
    const existingExprDefaultVal: string = isExpression ? "" : EXISTING_PROPERTY;

    const onExistingRadioBtnChange = (value: string) => {
        setIsExpression((value === DEFINE_RESPOND_EXP));
        if (value === EXISTING_PROPERTY) {
            respondFormConfig.respondExpression = '';
            setIsExpression(false);
        }
        setValidForm(false);
    };

    const onDefineRadioBtnChange = (value: string) => {
        setIsExpression((value === DEFINE_RESPOND_EXP));
        if (value === DEFINE_RESPOND_EXP) {
            respondFormConfig.respondExpression = '';
            setIsExpression(true);
        }
        setValidForm(false);
    };

    const onDropdownChange = (value: string) => {
        setIsExpression((value === ''));
        if (value) {
            respondFormConfig.respondExpression = value;
            setValidForm(isFormValid());
        }
    };

    const onCallerChange = (value: any) => {
        respondFormConfig.caller = value;
        setValidForm(isFormValid());
    };

    const existingActiveClass = isExpression ? formClasses.inActiveWrapper : null;
    const customActiveClass = !isExpression ? formClasses.inActiveWrapper : null;

    return (
        <FormControl data-testid="respond-form" className={formClasses.wizardFormControl}>
            <div className={formClasses.formTitleWrapper}>
                <div className={formClasses.mainTitleWrapper}>
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2}>Respond</Box>
                    </Typography>
                    <RespondIcon />
                </div>
            </div>
            <div className={formClasses.formWrapper}>
                <FormTextInput
                    onChange={onCallerChange}
                    label={"Caller name"}
                    defaultValue={respondFormConfig.caller}
                    placeholder={"Enter caller name"}
                />

                <div className={formClasses.labelWrapper}>
                    <FormHelperText className={formClasses.inputLabelForRequired}>Respond Expression</FormHelperText>
                    <FormHelperText className={formClasses.starLabelForRequired}>*</FormHelperText>
                </div>
                <div className={formClasses.groupedForm}>
                    <RadioControl
                        onChange={onExistingRadioBtnChange}
                        defaultValue={existingExprDefaultVal}
                        customProps={{ collection: [EXISTING_PROPERTY], disabled: !(config.scopeSymbols.length > 0) }}
                    />
                    <div className={existingActiveClass}>
                        <SelectDropdownWithButton
                            customProps={{
                                disableCreateNew: true, values: config.scopeSymbols, clearSelection: isExpression
                            }}
                            onChange={onDropdownChange}
                            placeholder="Select Property"
                            defaultValue={respondFormConfig.respondExpression}
                        />
                    </div>

                    <div className={formClasses.divider} />

                    <RadioControl
                        onChange={onDefineRadioBtnChange}
                        defaultValue={customExprDefaultVal}
                        customProps={{ collection: [DEFINE_RESPOND_EXP] }}
                    />
                    <div className={customActiveClass}>
                        <FormTextInput
                            customProps={{ clearInput: !isExpression }}
                            onChange={onExpressionChange}
                            defaultValue={respondFormConfig.respondExpression}
                            placeholder={'eg: "Executed successfully!"'}
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
