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

import { ReturnStatement } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";

import { WizardType } from "../../../../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { getVaribaleNamesFromVariableDefList } from "../../../../../utils";
import { PrimaryButton } from "../../../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../Elements/DropDown/SelectDropdownWithButton";
import { RadioControl } from "../../../../Elements/RadioControl/FormRadioControl";
import { FormTextInput } from "../../../../Elements/TextField/FormTextInput";
import { EndConfig } from "../../../../types";
import { useStyles } from "../../../style";

import { ReturnIcon } from "../../../../../../../../assets/icons";

interface ReturnFormProps {
    config: EndConfig;
    onCancel: () => void;
    onSave: () => void;
}

export const DEFINE_RETURN_EXR: string = "Define Return Expression";
export const EXISTING_PROPERTY: string = "Select Existing Property";

export function AddReturnForm(props: ReturnFormProps) {
    const { state } = useContext(DiagramContext);
    const { currentApp, isMutationProgress: isMutationInProgress, stSymbolInfo } = state;
    const triggerType = currentApp ? currentApp.displayType : undefined;
    const { config, onCancel, onSave } = props;
    let initCustomExpression = !(config.scopeSymbols.length > 0);
    const classes = useStyles();

    // config.scopeSymbols = ['simpleError', 'test1', 'test2', 'b', 'property'];

    if (config.wizardType === WizardType.EXISTING) {
        const returnStmtModel: ReturnStatement = config.model as ReturnStatement;
        initCustomExpression = returnStmtModel.expression.kind !== 'SimpleNameReference';
        config.expression = returnStmtModel.expression.source;
    }

    const [customExpression, setCustomExpression] = useState(initCustomExpression);

    const onReturnValueChange = (value: any) => {
        config.expression = value;
        setCustomExpression(true);
    };

    const onExistingRadioBtnChange = (value: string) => {
        setCustomExpression((value === DEFINE_RETURN_EXR));
        if (value === EXISTING_PROPERTY) {
            config.expression = '';
            setCustomExpression(false);
        }
    };

    const onDefineRadioBtnChange = (value: string) => {
        setCustomExpression((value === DEFINE_RETURN_EXR));
        if (value === DEFINE_RETURN_EXR) {
            config.expression = '';
            setCustomExpression(true);
        }
    };

    const onDropdownChange = (value: string) => {
        setCustomExpression((value === ''));
        if (value) {
            config.expression = value;
        }
    };

    const customExprDefaultVal: string = customExpression ? DEFINE_RETURN_EXR : "";
    const existingExprDefaultVal: string = customExpression ? "" : EXISTING_PROPERTY;

    const existingActiveClass = customExpression ? classes.inActiveWrapper : null;
    const customActiveClass = !customExpression ? classes.inActiveWrapper : null;
    const containsMainFunction = triggerType && (triggerType === "Manual" || triggerType === "Schedule"); // todo: this is not working due to triggerType is blank.
    const errorVariables = stSymbolInfo ? [...getVaribaleNamesFromVariableDefList(stSymbolInfo.variables.get('error'))] : [];
    return (
        <FormControl data-testid="return-form" className={classes.wizardFormControl}>
            <div className={classes.formTitleWrapper}>
                <div className={classes.mainTitleWrapper}>
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2}>Return</Box>
                    </Typography>
                    <ReturnIcon />
                </div>
            </div>
            <div className={classes.formWrapper}>
                {
                    containsMainFunction ?
                        (
                            <div className={classes.groupedForm}>
                                <SelectDropdownWithButton
                                    label={"Select Error property"}
                                    customProps={{
                                        disableCreateNew: true,
                                        values: errorVariables,
                                        clearSelection: customExpression,
                                        optional: true
                                    }}
                                    onChange={onDropdownChange}
                                    placeholder="Select Property"
                                    defaultValue={config.expression}
                                />
                            </div>
                        ) :
                        (
                            <div className={classes.groupedForm}>
                                <RadioControl
                                    onChange={onExistingRadioBtnChange}
                                    defaultValue={existingExprDefaultVal}
                                    customProps={{ collection: [EXISTING_PROPERTY], disabled: !(config.scopeSymbols.length > 0) }}
                                />
                                <div className={existingActiveClass}>
                                    <SelectDropdownWithButton
                                        customProps={{
                                            disableCreateNew: true,
                                            values: config.scopeSymbols,
                                            clearSelection: customExpression
                                        }}
                                        onChange={onDropdownChange}
                                        placeholder="Select Property"
                                        defaultValue={config.expression}
                                    />
                                </div>

                                <div className={classes.divider} />

                                <RadioControl
                                    onChange={onDefineRadioBtnChange}
                                    defaultValue={customExprDefaultVal}
                                    customProps={{ collection: [DEFINE_RETURN_EXR] }}
                                />
                                <div className={customActiveClass}>
                                    <FormTextInput
                                        customProps={{ clearInput: !customExpression }}
                                        onChange={onReturnValueChange}
                                        placeholder={"eg: \"Hello\""}
                                        defaultValue={config.expression}
                                    />
                                </div>
                            </div>
                        )
                }
                <div className={classes.wizardBtnHolder}>
                    <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                    <PrimaryButton
                        text="Save"
                        disabled={isMutationInProgress}
                        fullWidth={false}
                        onClick={onSave}
                    />
                </div>
                <div className={classes.formCreate} />
            </div>
        </FormControl>
    );
}
