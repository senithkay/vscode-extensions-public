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

import { BinaryExpression, ForeachStatement } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";
import classNames from "classnames";

import { ForEachIcon } from "../../../../../../../../assets/icons";
import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { getAllVariables } from "../../../../../../../utils/mixins";
import { genVariableName } from "../../../../../utils";
import { PrimaryButton } from "../../../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../Elements/DropDown/SelectDropdownWithButton";
import { RadioControl } from "../../../../Elements/RadioControl/FormRadioControl";
import { FormTextInput } from "../../../../Elements/TextField/FormTextInput";
import { ConditionConfig, ForeachConfig } from "../../../../types";
// import "../../../ConnectorInitForm/Wizard/style.scss";
import { useStyles } from "../../../style";

interface Iterations {
    start?: string;
    end?: string;
}

interface ForeachProps {
    condition: ConditionConfig;
    onCancel: () => void;
    onSave: () => void;
    isNewConditionForm: boolean;
}

export const DEFINE_RANGE: string = "Define Range";
export const EXISTING_PROPERTY: string = "Select Existing Property";

export function AddForeachForm(props: ForeachProps) {
    const { state } = useContext(DiagramContext);
    const { isMutationProgress: isMutationInProgress, stSymbolInfo } = state;
    const { condition, onCancel, onSave, isNewConditionForm } = props;

    let initCollectionDefined: boolean = (condition.scopeSymbols.length > 0);
    const initIterations: Iterations = {
        start: undefined,
        end: undefined
    };

    if (!isNewConditionForm) {
        const forEachModel: ForeachStatement = (condition.conditionExpression as ForeachConfig).model as ForeachStatement;
        switch (forEachModel.actionOrExpressionNode.kind) {
            case 'BinaryExpression':
                const expression = forEachModel.actionOrExpressionNode as BinaryExpression;
                if (expression.operator.kind === 'EllipsisToken') {
                    initCollectionDefined = false;
                    initIterations.start = expression.lhsExpr.source.trim();
                    initIterations.end = expression.rhsExpr.source.trim();
                }

                break;
            case 'SimpleNameReference':
                initCollectionDefined = true;
                break;
        }

    }

    const [allTextFilled, setAllTextFilled] = useState(!isNewConditionForm);
    const [defineCollection, setDefineCollection] = useState(!initCollectionDefined);

    const [iterations, setIterations] = useState(initIterations);
    const classes = useStyles();

    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const intRegex = new RegExp("^\\d+$");

    const conditionExpression: ForeachConfig = condition.conditionExpression as ForeachConfig;

    const allFieldsFilled = (): boolean => {
        return (conditionExpression.collection !== '') && (conditionExpression.variable !== '');
    };

    const validateNameValue = (value: string) => {
        if (value && value !== '') {
            return nameRegex.test(value);
        }
        return true;
    };

    const validateIntValues = (value: string) => {
        if (value && value !== '') {
            return intRegex.test(value);
        }
        return true;
    };

    const onVariableNameChange = (value: string) => {
        conditionExpression.variable = nameRegex.test(value) ? value : '';
        setAllTextFilled(allFieldsFilled());
    };

    const onStartChange = (value: string) => {
        setDefineCollection(true);
        conditionExpression.collection = '';
        if (value && (value !== '') && intRegex.test(value)) {
            setIterations({ ...iterations, start: value });
            if (iterations.end) {
                conditionExpression.collection = value + " ... " + iterations.end;
            }
        } else {
            setIterations({ ...iterations, start: undefined });
            conditionExpression.collection = '';
        }
        setAllTextFilled(allFieldsFilled());
    };

    const onEndChange = (value: string) => {
        setDefineCollection(true);
        conditionExpression.collection = '';
        if (value && (value !== '') && intRegex.test(value)) {
            setIterations({ ...iterations, end: value });
            if (iterations.start) {
                conditionExpression.collection = iterations.start + " ... " + value;
            }
        } else {
            setIterations({ ...iterations, end: undefined });
            conditionExpression.collection = '';
        }
        setAllTextFilled(allFieldsFilled());
    };

    const onExistingRadioBtnChange = (value: string) => {
        setDefineCollection((value === DEFINE_RANGE));
        if (value === EXISTING_PROPERTY) {
            conditionExpression.collection = '';
            setDefineCollection(false);
        }
        setAllTextFilled(false);
    };

    const onDefineRadioBtnChange = (value: string) => {
        setDefineCollection((value === DEFINE_RANGE));
        if (value === DEFINE_RANGE) {
            conditionExpression.collection = '';
            setDefineCollection(true);
        }
        setAllTextFilled(false);
    };

    const onDropdownChange = (value: string) => {
        setDefineCollection((value === ''));
        setIterations({ ...iterations, end: undefined, start: undefined });
        conditionExpression.collection = '';
        if (value) {
            conditionExpression.collection = value;
            setAllTextFilled(allFieldsFilled());
        }
    };

    if (!conditionExpression.variable || (conditionExpression.variable === '')) {
        conditionExpression.variable = genVariableName("item", getAllVariables(stSymbolInfo));
    }

    const defineExprDefaultVal: string = defineCollection ? DEFINE_RANGE : "";
    const existingExprDefaultVal: string = defineCollection ? "" : EXISTING_PROPERTY;

    const existingActiveClass = defineCollection ? classes.inActiveWrapper : null;
    const customActiveClass = !defineCollection ? classes.inActiveWrapper : null;
    return (
        <FormControl data-testid="foreach-form" className={classes.wizardFormControl}>
            <div className={classes.formTitleWrapper}>
                <div className={classes.mainTitleWrapper}>
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2}>Foreach</Box>
                    </Typography>
                    <ForEachIcon />
                </div>
            </div>
            <div className={classes.formWrapper}>
                <FormTextInput
                    customProps={{
                        validate: validateNameValue
                    }}
                    onChange={onVariableNameChange}
                    defaultValue={conditionExpression.variable}
                    label={"Variable Name"}
                    placeholder={"Enter Variable Name"}
                    errorMessage={"Invalid Collection Name"}
                />

                <div className={classNames(classes.groupedForm, classes.marginTB)}>
                    <RadioControl
                        onChange={onExistingRadioBtnChange}
                        defaultValue={existingExprDefaultVal}
                        customProps={{
                            collection: [EXISTING_PROPERTY],
                            disabled: !(condition.scopeSymbols.length > 0)
                        }}
                    />
                    <div className={existingActiveClass}>
                        <SelectDropdownWithButton
                            customProps={{
                                disableCreateNew: true, values: condition.scopeSymbols, clearSelection: defineCollection
                            }}
                            onChange={onDropdownChange}
                            defaultValue={conditionExpression.collection}
                            placeholder={"Select"}
                        />
                    </div>

                    <div className={classes.divider} />

                    <RadioControl
                        onChange={onDefineRadioBtnChange}
                        defaultValue={defineExprDefaultVal}
                        customProps={{ collection: [DEFINE_RANGE] }}
                    />
                    <div className={customActiveClass}>
                        <div className={classes.smallInputWrapper}>
                            <div className={classes.smallInput}>
                                <FormTextInput
                                    customProps={{
                                        clearInput: !defineCollection
                                    }}
                                    onChange={onStartChange}
                                    label={"Start"}
                                    placeholder={"eg: 1"}
                                    errorMessage={"Invalid input"}
                                    defaultValue={iterations.start}
                                />
                            </div>
                            <div className={classes.smallInput}>
                                <FormTextInput
                                    customProps={{
                                        clearInput: !defineCollection
                                    }}
                                    onChange={onEndChange}
                                    label={"End"}
                                    placeholder={"eg: 10"}
                                    errorMessage={"Invalid input"}
                                    defaultValue={iterations.end}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={classes.wizardBtnHolder}>
                    <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                    <PrimaryButton
                        text="Save"
                        disabled={isMutationInProgress || !allTextFilled}
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
//     const { isMutationProgress, stSymbolInfo } = diagramState;
//     return {
//         isMutationInProgress: isMutationProgress,
//         stSymbolInfo
//     }
// };

// export const AddForeachForm = connect(mapStateToProps)(AddForeachFormC);
