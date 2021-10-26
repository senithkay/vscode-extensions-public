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

import { CloseRounded, ForEachIcon, EditIcon } from "../../../../../../assets/icons";

import { FormField } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { getAllVariables } from "../../../../../utils/mixins";
import { ButtonWithIcon } from "../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { FormTextInput } from "../../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles } from "../../../../Portals/ConfigForm/forms/style";
import { ConditionConfig, ForeachConfig, FormElementProps } from "../../../../Portals/ConfigForm/types";
import { genVariableName } from "../../../../Portals/utils";
import { wizardStyles } from "../../../style";
import { FormattedMessage, useIntl } from "react-intl";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../utils/constants";
import { FormActionButtons } from "../../../../Portals/ConfigForm/Elements/FormActionButtons";
import { ViewContainer } from "../../../../Portals/ConfigForm/Elements/StatementEditor/components/ViewContainer/ViewContainer";
import { StatementEditorButton } from "../../../../Portals/ConfigForm/Elements/Button/StatementEditorButton";

interface Iterations {
    start?: string;
    end?: string;
}

interface ForeachProps {
    condition: ConditionConfig | any;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
}

export const DEFINE_RANGE: string = "Define Range";
export const EXISTING_PROPERTY: string = "Select Existing Property";

export function AddForeachForm(props: ForeachProps) {
    const {
        props: {
            isCodeEditorActive,
            isMutationProgress: isMutationInProgress,
            stSymbolInfo
        }
    } = useContext(Context);
    const { condition, formArgs, onCancel, onSave } = props;

    const [conditionExpression] = useState(condition.conditionExpression);
    let initCollectionDefined: boolean = (condition.scopeSymbols.length > 0);
    const initIterations: Iterations = {
        start: undefined,
        end: undefined
    };

    if (conditionExpression.model) {
        const forEachModel: ForeachStatement = (conditionExpression as ForeachConfig).model as ForeachStatement;
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
    const intl = useIntl();

    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$|^\[[a-zA-Z0-9_]*, *[a-zA-Z0-9_]*\]$");

    // const conditionExpression: ForeachConfig = condition.conditionExpression as ForeachConfig;

    const validateNameValue = (value: string) => {
        if (value && value !== '') {
            return value.match(nameRegex) !== null;
        }
        return true;
    };

    const onVariableNameChange = (value: string) => {
        conditionExpression.variable = value.match(nameRegex) !== null ? value : '';
    };

    if (!conditionExpression.variable || (conditionExpression.variable === '')) {
        conditionExpression.variable = genVariableName("item", getAllVariables(stSymbolInfo));
    };

    const [isInvalid, setIsInvalid] = useState(!!conditionExpression.collection);
    const [isStmtEditor, setIsStmtEditor] = useState(false);

    const handleExpEditorChange = (value: string) => {
        conditionExpression.collection = value;
    }

    const handleSave = () => {
        condition.conditionExpression = conditionExpression;
        onSave();
    }

    const validateField = (fieldName: string, isInvalidFromField: boolean) => {
        const isValidExpression = !isInvalidFromField ? (conditionExpression.collection !== undefined && conditionExpression.collection !== "") : false;
        setIsInvalid(!isValidExpression)
    }

    const handleStmtEditorButtonClick = () => {
        setIsStmtEditor(true);
    };

    const handleStmtEditorCancel = () => {
        setIsStmtEditor(false);
    };

    const formField: FormField = {
        name: "iterable expression",
        displayName: "Iterable Expression",
        typeName: "var"
    };

    const forEachTooltipMessages = {
        expressionEditor: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.forEach.expressionEditor.tooltip.title",
                defaultMessage: "Enter a Ballerina expression."
            }),
            actionText: intl.formatMessage({
                id: "lowcode.develop.configForms.forEach.expressionEditor.tooltip.actionText",
                defaultMessage: "Learn Ballerina expressions"
            }),
            actionLink: intl.formatMessage({
                id: "lowcode.develop.configForms.forEach.expressionEditor.tooltip.actionTitle",
                defaultMessage: "{learnBallerina}"
            }, { learnBallerina: BALLERINA_EXPRESSION_SYNTAX_PATH })
        },
        currentValueVariable: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.forEach.currentValueVariable.tooltip.title",
                defaultMessage: "Current Value Variable"
            }),
        }
    };
    const saveForEachButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.forEach.saveButton.label",
        defaultMessage: "Save"
    });

    const currentValueVariableLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.forEach.currentValueVariable.label",
        defaultMessage: "Current Value Variable"
    });

    const invalidConnectionErrorMessage = intl.formatMessage({
        id: "lowcode.develop.configForms.forEach.invalidConnectionErrorMessage",
        defaultMessage: "Invalid collection name."
    });

    const cancelForEachButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.forEach.cancelButton.label",
        defaultMessage: "Cancel"
    });

    const statementEditorLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.forEach.statementEditor.label",
        defaultMessage: "Foreach Statement"
    });

    const expElementProps: FormElementProps = {
        model: formField,
        customProps: {
            validate: validateField,
            tooltipTitle: forEachTooltipMessages.expressionEditor.title,
            tooltipActionText: forEachTooltipMessages.expressionEditor.actionText,
            tooltipActionLink: forEachTooltipMessages.expressionEditor.actionLink,
            interactive: true,
            statementType: formField.typeName,
            customTemplate: {
                defaultCodeSnippet: 'foreach var temp_var in  {}',
                targetColumn: 25,
            },
        },
        onChange: handleExpEditorChange,
        defaultValue: conditionExpression.collection,
    };


    let exprEditor =
        (
            <FormControl data-testid="foreach-form" className={classes.wizardFormControl}>
                {!isCodeEditorActive ?
                    (
                        <div className={classes.formWrapper}>
                            <div className={classes.formFeilds}>
                                <div className={classes.formWrapper}>
                                    <div className={classes.formTitleWrapper}>
                                        <div className={classes.mainTitleWrapper}>
                                            <Typography variant="h4">
                                                <Box paddingTop={2} paddingBottom={2}>
                                                    <FormattedMessage
                                                        id="lowcode.develop.configForms.foreach.title"
                                                        defaultMessage="Foreach"
                                                    />
                                                </Box>
                                            </Typography>
                                        </div>
                                        <div className={classes.statementEditor}>
                                            <StatementEditorButton onClick={handleStmtEditorButtonClick} disabled={true} />
                                        </div>
                                    </div>
                                    <FormTextInput
                                        customProps={{
                                            validate: validateNameValue,
                                        }}
                                        onChange={onVariableNameChange}
                                        defaultValue={conditionExpression.variable}
                                        label={currentValueVariableLabel}
                                        placeholder={""}
                                        errorMessage={invalidConnectionErrorMessage}
                                    />
                                    <div className="exp-wrapper">
                                        <ExpressionEditor {...expElementProps} />
                                    </div>
                                </div>
                            </div>
                            <FormActionButtons
                                cancelBtnText={cancelForEachButtonLabel}
                                saveBtnText={saveForEachButtonLabel}
                                isMutationInProgress={isMutationInProgress}
                                validForm={!isInvalid}
                                onSave={handleSave}
                                onCancel={onCancel}
                            />
                        </div>
                    )
                    :
                    null
                }
            </FormControl>
        );

    if (isStmtEditor) {
        exprEditor =
            (
                <FormControl data-testid="property-form">
                    {!isCodeEditorActive ? (
                        <div>
                            // TODO: Send proper props according to the form type
                            <ViewContainer
                                kind="DefaultString"
                                label={statementEditorLabel}
                                formArgs={formArgs}
                                onCancel={handleStmtEditorCancel}
                            />
                        </div>
                    ) : null}
                </FormControl>
            );
    }

    return (
        exprEditor
    );
}

