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
import { FormattedMessage, useIntl } from "react-intl";

import { BinaryExpression, ForeachStatement } from "@wso2-enterprise/syntax-tree";
import classnames from "classnames";
import { FormControl, Typography } from "@material-ui/core";

import {
    FormField,
    FormActionButtons,
    FormElementProps,
    FormHeaderSection
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { Context } from "../../../../../../../Contexts/Diagram";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../../utils/constants";
import { getAllVariables } from "../../../../../../utils/mixins";
import { createForeachStatement, getInitialSource } from "../../../../../../utils/modification-util";
import { genVariableName } from "../../../../../Portals/utils";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { SelectDropdownWithButton } from "../../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import { ExpressionEditorProps } from "@wso2-enterprise/ballerina-expression-editor";
import { FormTextInput } from "../../../../FormFieldComponents/TextField/FormTextInput";
import { useStatementEditor } from "@wso2-enterprise/ballerina-statement-editor";
import { ConditionConfig, ForeachConfig } from "../../../../Types";
import { wizardStyles } from "../../../style";
import { VariableTypeInput, VariableTypeInputProps } from "../../../Components/VariableTypeInput";
import Tooltip from '../../../../../../../components/TooltipV2'
import { LowCodeExpressionEditor } from "../../../../FormFieldComponents/LowCodeExpressionEditor";

interface Iterations {
    start?: string;
    end?: string;
}

interface ForeachProps {
    condition: ConditionConfig | any;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export const DEFINE_RANGE: string = "Define Range";
export const EXISTING_PROPERTY: string = "Select Existing Property";

export function AddForeachForm(props: ForeachProps) {
    const {
        props: {
            isMutationProgress: isMutationInProgress,
            stSymbolInfo,
            currentFile
        },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram },
            library: { getLibrariesList }
        }
    } = useContext(Context);

    const { condition, formArgs, onCancel, onSave, onWizardClose } = props;

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

    const [expressionValue, setExpressionValue] = useState(conditionExpression.collection)
    const [isValidExpression, setIsValidExpression] = useState(!!conditionExpression.collection);

    // FIXME: Replace with type selection expression editor!
    const variableTypes: string[] = ["var", "int", "float", "decimal", "boolean", "string", "json", "xml"];

    const [selectedType, setSelectedType] = useState(conditionExpression.type ? conditionExpression.type : "var");

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        conditionExpression.type = type;
    };

    const handleExpEditorChange = (value: string) => {
        conditionExpression.collection = value;
        setExpressionValue(value);
    }

    const handleSave = () => {
        condition.conditionExpression = conditionExpression;
        conditionExpression.type = selectedType;
        onSave();
    }

    const validateField = (fieldName: string, isInvalidFromField: boolean) => {
        setIsValidExpression(!isInvalidFromField)
    }

    const formField: FormField = {
        name: "iterable expression",
        displayName: "Iterable Expression",
        typeName: selectedType + "[]",
        value: expressionValue,
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
        },
        codeBlockTooltip: intl.formatMessage({
            id: "lowcode.develop.configForms.IFStatementTooltipMessages.expressionEditor.tooltip.codeBlock",
            defaultMessage: "To add code inside the foreach block, save foreach statement form and use the diagram add buttons",
        }),
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

    const expElementProps: FormElementProps<ExpressionEditorProps> = {
        model: formField,
        customProps: {
            validate: validateField,
            tooltipTitle: forEachTooltipMessages.expressionEditor.title,
            tooltipActionText: forEachTooltipMessages.expressionEditor.actionText,
            tooltipActionLink: forEachTooltipMessages.expressionEditor.actionLink,
            interactive: true,
            statementType: selectedType,
            changed: selectedType,
            customTemplate: {
                defaultCodeSnippet: `foreach ${selectedType} temp_var in  {}`,
                targetColumn: 22 + selectedType.length,
            },
            initialDiagnostics: formArgs?.model?.actionOrExpressionNode?.typeData?.diagnostics,
            editPosition: {
                startLine: formArgs?.model ? formArgs?.model.position.startLine : formArgs.targetPosition.startLine,
                endLine: formArgs?.model ? formArgs?.model.position.startLine : formArgs.targetPosition.startLine,
                startColumn: 0,
                endColumn: 0
            }
        },
        onChange: handleExpEditorChange,
        defaultValue: conditionExpression.collection
    };

    const initialSource = formArgs.model ? formArgs.model.source : getInitialSource(createForeachStatement(
        conditionExpression.collection ? conditionExpression.collection : 'EXPRESSION',
        conditionExpression.variable,
        selectedType
    ));

    const handleStatementEditorChange = (partialModel: ForeachStatement) => {
        conditionExpression.type = partialModel.typedBindingPattern.typeDescriptor.source.trim();
        conditionExpression.variable = partialModel.typedBindingPattern.bindingPattern.source.trim();
        conditionExpression.collection = partialModel.actionOrExpressionNode.source.trim();
        setSelectedType(partialModel.typedBindingPattern.typeDescriptor.source.trim());
    }

    const { handleStmtEditorToggle, stmtEditorComponent } = useStatementEditor(
        {
            label: intl.formatMessage({ id: "lowcode.develop.configForms.forEach.statementEditor.label" }),
            initialSource,
            formArgs: { formArgs },
            validForm: isValidExpression,
            config: condition,
            onWizardClose,
            handleStatementEditorChange,
            onCancel,
            currentFile,
            getLangClient: getExpressionEditorLangClient,
            applyModifications: modifyDiagram,
            getLibrariesList
        }
    );

    const validateExpression = (fieldName: string, isInvalidType: boolean) => {
        setIsValidExpression(!isInvalidType)
    };

    const variableTypeConfig: VariableTypeInputProps = {
        displayName: 'Variable Type',
        value: selectedType,
        onValueChange: handleTypeChange,
        validateExpression,
        position: formArgs?.model ? {
            ...(formArgs?.model).position,
            endLine: 0,
            endColumn: 0,
        } : formArgs.targetPosition,
    }

    const variableTypeInput = (
        <div className="exp-wrapper">
            <VariableTypeInput {...variableTypeConfig} />
        </div>
    );

    if (!stmtEditorComponent) {
        return (
            <FormControl data-testid="foreach-form" className={classes.wizardFormControlExtended}>
                <FormHeaderSection
                    onCancel={onCancel}
                    statementEditor={true}
                    formTitle={"lowcode.develop.configForms.foreach.title"}
                    defaultMessage={"Foreach"}
                    handleStmtEditorToggle={handleStmtEditorToggle}
                    toggleChecked={false}
                />
                <div className={classes.formContentWrapper}>
                    <div className={classes.formCodeBlockWrapper}>
                        <div className={classes.formCodeExpressionWrapper}>
                            <Typography variant='body2' className={classes.startTitleCode}>foreach</Typography>
                            <div className={classes.variableExpEditorWrapper}>
                                {variableTypeInput}
                            </div>
                            <div className={classes.variableExpEditorWrapper}>
                                <FormTextInput
                                    customProps={{
                                        validate: validateNameValue,
                                    }}
                                    onChange={onVariableNameChange}
                                    defaultValue={conditionExpression.variable}
                                    label="Current Value"
                                    placeholder={""}
                                    errorMessage={invalidConnectionErrorMessage}
                                />
                            </div>
                        </div>
                        <div className={classes.formCodeExpressionEndWrapper}>
                            <Typography variant='body2' className={classnames(classes.endCode)}>in</Typography>
                            <div className={classes.formCodeExpressionLargeField}>
                                <div className={classes.stmtEditorWrapper}>
                                    <LowCodeExpressionEditor {...expElementProps} hideLabelTooltips={true} />
                                </div>
                            </div>
                            <Typography variant='body2' className={classes.endCode}>{`{`}</Typography>
                        </div>
                    </div>
                    <div className={classes.formCodeBlockWrapper}>
                        <div className={classes.middleDottedwrapper}>
                            <Tooltip type='info' text={{ content: forEachTooltipMessages.codeBlockTooltip }}>
                                <Typography variant='body2' className={classes.middleCode}>{`...`}</Typography>
                            </Tooltip>
                        </div>
                        <Typography variant='body2' className={classes.endCode}>{`}`}</Typography>
                    </div>
                </div>
                <FormActionButtons
                    cancelBtnText={cancelForEachButtonLabel}
                    cancelBtn={true}
                    saveBtnText={saveForEachButtonLabel}
                    isMutationInProgress={isMutationInProgress}
                    validForm={isValidExpression && expressionValue.length > 0}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            </FormControl>
        );
    }
    else {
        return stmtEditorComponent;
    }
}
