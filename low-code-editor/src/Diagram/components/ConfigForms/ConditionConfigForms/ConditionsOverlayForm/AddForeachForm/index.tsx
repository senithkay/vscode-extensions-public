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

import { BinaryExpression, ForeachStatement } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";

import { ForEachIcon } from "../../../../../../assets/icons";

import { FormField } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { getAllVariables } from "../../../../../utils/mixins";
import { ButtonWithIcon } from "../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { PrimaryButton } from "../../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { FormTextInput } from "../../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles } from "../../../../Portals/ConfigForm/forms/style";
import { ConditionConfig, ForeachConfig, FormElementProps } from "../../../../Portals/ConfigForm/types";
import { genVariableName } from "../../../../Portals/utils";
import { tooltipMessages } from "../../../../Portals/utils/constants";
import { wizardStyles } from "../../../style";

interface Iterations {
    start?: string;
    end?: string;
}

interface ForeachProps {
    condition: ConditionConfig | any;
    onCancel: () => void;
    onSave: () => void;
    isNewConditionForm: boolean;
}

export const DEFINE_RANGE: string = "Define Range";
export const EXISTING_PROPERTY: string = "Select Existing Property";

export function AddForeachForm(props: ForeachProps) {
    const { state } = useContext(Context);
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

    const classes = useStyles();
    const overlayClasses = wizardStyles();

    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

    const conditionExpression: ForeachConfig = condition.conditionExpression as ForeachConfig;

    const validateNameValue = (value: string) => {
        if (value && value !== '') {
            return nameRegex.test(value);
        }
        return true;
    };

    const onVariableNameChange = (value: string) => {
        conditionExpression.variable = nameRegex.test(value) ? value : '';
    };

    if (!conditionExpression.variable || (conditionExpression.variable === '')) {
        conditionExpression.variable = genVariableName("item", getAllVariables(stSymbolInfo));
    };

    const [isInvalid, setIsInvalid] = useState(true);

    const handleExpEditorChange = (value: string) => {
        conditionExpression.collection = value;
    }

    const validateField = (fieldName: string, isInvalidFromField: boolean) => {
        setIsInvalid(isInvalidFromField)
    }

    const formField: FormField = {
        name: "iterable expression",
        displayName: "Iterable Expression",
        type: "var"
    }

    const expElementProps: FormElementProps = {
        model: formField,
        customProps: {
            validate: validateField,
            tooltipTitle: tooltipMessages.expressionEditor.title,
            tooltipActionText: tooltipMessages.expressionEditor.actionText,
            tooltipActionLink: tooltipMessages.expressionEditor.actionLink,
            interactive: true
        },
        onChange: handleExpEditorChange,
        defaultValue: conditionExpression.collection
    };

    return (
        <FormControl data-testid="foreach-form" className={classes.wizardFormControl}>
            <div className={overlayClasses.configWizardContainer}>
                <div className={classes.formWrapper}>
                    <ButtonWithIcon
                        className={classes.overlayDeleteBtn}
                        onClick={onCancel}
                        icon={<CloseRounded fontSize="small" />}
                    />
                    <div className={classes.formTitleWrapper}>
                        <div className={classes.mainTitleWrapper}>
                            <ForEachIcon />
                            <Typography variant="h4">
                                <Box paddingTop={2} paddingBottom={2}>Foreach</Box>
                            </Typography>
                        </div>
                    </div>
                    <FormTextInput
                        customProps={{
                            validate: validateNameValue,
                            tooltipTitle: tooltipMessages.currentValue
                        }}
                        onChange={onVariableNameChange}
                        defaultValue={conditionExpression.variable}
                        label={"Current Value Variable"}
                        placeholder={""}
                        errorMessage={"Invalid Collection Name"}
                    />
                    <div className="exp-wrapper">
                        <ExpressionEditor {...expElementProps} />
                    </div>
                </div>
                <div className={overlayClasses.buttonWrapper}>
                    <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                    <PrimaryButton
                        text="Save"
                        disabled={isMutationInProgress || isInvalid}
                        fullWidth={false}
                        onClick={onSave}
                    />
                </div>
            </div>
        </FormControl>
    );
}

