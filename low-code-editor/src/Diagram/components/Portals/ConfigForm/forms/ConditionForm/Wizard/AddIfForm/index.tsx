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

import { Box, FormControl, Typography } from "@material-ui/core";

import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { PrimaryButton } from "../../../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../Elements/DropDown/SelectDropdownWithButton";
import { RadioControl } from "../../../../Elements/RadioControl/FormRadioControl";
import { FormTextInput } from "../../../../Elements/TextField/FormTextInput";
import { ConditionConfig } from "../../../../types";
import { useStyles } from "../../../style";
import { DEFINE_RANGE } from "../AddForeachForm";

interface IfProps {
    condition: ConditionConfig;
    onCancel: () => void;
    onSave: () => void;
}

export const DEFINE_CONDITION: string = "Define Condition Expression";
export const EXISTING_PROPERTY: string = "Select Boolean Property";

export function AddIfForm(props: IfProps) {
    const { state } = useContext(DiagramContext);
    const { isMutationInProgress } = state;
    const { condition, onCancel, onSave } = props;
    const classes = useStyles();
    const defaultValue = condition.conditionExpression ? condition.conditionExpression : "";

    const [isExpressionProvided, setIsExpressionProvided] = useState(defaultValue !== "");
    const [isDefineCondition, setIsDefineCondition] = useState(!(condition.scopeSymbols.length > 0));
    const [isDropdownSelected, setIsDropdownSelected] = useState(false);

    const onExpressionChange = (value: string) => {
        setIsDefineCondition(true);
        condition.conditionExpression = value;
        setIsExpressionProvided(value && value !== '');
        setIsDropdownSelected(false);
    };

    const onExistingRadioBtnChange = (value: string) => {
        setIsDefineCondition((value === DEFINE_RANGE));
        condition.conditionExpression = '';
        setIsDropdownSelected(false);
        setIsExpressionProvided(false);
    };

    const onDefineRadioBtnChange = (value: string) => {
        setIsDefineCondition((value === DEFINE_RANGE));
        condition.conditionExpression = '';
        setIsDefineCondition(value === DEFINE_CONDITION);
        setIsDropdownSelected(false);
        setIsExpressionProvided(false);
    };

    const onDropdownChange = (value: string) => {
        setIsDropdownSelected((value !== ''));
        setIsDefineCondition((value === ''));
        if (value) {
            condition.conditionExpression = value;
        }
    };

    const defineExprDefaultVal: string = isDefineCondition ? DEFINE_CONDITION : "";
    const existingExprDefaultVal: string = isDefineCondition ? "" : EXISTING_PROPERTY;

    const existingActiveClass = isDefineCondition ? classes.inActiveWrapper : null;
    const customActiveClass = !isDefineCondition ? classes.inActiveWrapper : null;

    return (
        <FormControl data-testid="if-form" className={classes.wizardFormControl}>
            <div className={classes.formTitleWrapper}>
                <div className={classes.mainTitleWrapper}>
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2}>If Condition</Box>
                    </Typography>
                    <img src="../../../../../../images/If.svg" />
                </div>
            </div>
            <div className={classes.formWrapper}>
                <div className={classes.groupedForm}>
                    <RadioControl
                        onChange={onExistingRadioBtnChange}
                        defaultValue={existingExprDefaultVal}
                        customProps={{ collection: [EXISTING_PROPERTY], disabled: !(condition.scopeSymbols.length > 0) }}
                    />
                    <div className={existingActiveClass}>
                        <SelectDropdownWithButton
                            customProps={{
                                disableCreateNew: true, values: condition.scopeSymbols, clearSelection: isDefineCondition
                            }}
                            onChange={onDropdownChange}
                            defaultValue=""
                            placeholder="Select"
                        />
                    </div>
                    <div className={classes.divider} />
                    <RadioControl
                        onChange={onDefineRadioBtnChange}
                        defaultValue={defineExprDefaultVal}
                        customProps={{ collection: [DEFINE_CONDITION] }}
                    />
                    <div className={customActiveClass}>
                        <FormTextInput
                            customProps={{ clearInput: !isDefineCondition }}
                            defaultValue={defaultValue}
                            onChange={onExpressionChange}
                            placeholder={"eg: a==0 && isValid"}
                        />
                    </div>
                </div>
                <div className={classes.wizardBtnHolder}>
                    <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                    <PrimaryButton
                        text="Save"
                        disabled={
                            isMutationInProgress || !(isExpressionProvided || isDropdownSelected)
                        }
                        fullWidth={false}
                        onClick={onSave}
                    />
                </div>
                <div className={classes.formCreate} />
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

// export const AddIfForm = connect(mapStateToProps)(AddIfFormC);
