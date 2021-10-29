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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { CaptureBindingPattern, LocalVarDecl, STKindChecker } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";
import classnames from "classnames";

import { PrimitiveBalType, WizardType } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../utils/constants";
import { getAllVariables } from "../../../../../utils/mixins";
import { getVariableNameFromST } from "../../../../../utils/st-util";
import { createModuleVarDecl, getInitialSource} from "../../../../../utils/modification-util";
import { SelectDropdownWithButton } from "../../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { FormActionButtons } from "../../../../Portals/ConfigForm/Elements/FormActionButtons";
import { useStatementEditor } from "../../../../Portals/ConfigForm/Elements/StatementEditor/hooks";
import { FormTextInput } from "../../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import {
    VariableNameInput,
    VariableNameInputProps
} from "../../../../Portals/ConfigForm/forms/Components/VariableNameInput";
import { useStyles } from "../../../../Portals/ConfigForm/forms/style";
import { ProcessConfig } from "../../../../Portals/ConfigForm/types";
import { wizardStyles } from "../../../style";

interface AddVariableConfigProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
}

const defaultJsonVal = `{“key”: “Click the Tooltip for examples”}`;
const defaultXmlVal = `xml \`<obj>Click the Tooltip for examples</obj>\``;
const defaultValues = [defaultJsonVal, defaultXmlVal];
// todo: Support other data types
export const variableTypes: string[] = ["var", "int", "float", "decimal", "boolean", "string", "json",
    "xml", "error", "any", "anydata", "other"];

export function AddVariableConfig(props: AddVariableConfigProps) {
    const classes = useStyles();
    const overlayClasses = wizardStyles();
    const intl = useIntl();
    const { config, formArgs, onCancel, onSave } = props;

    const {
        props: {
            isCodeEditorActive,
            isMutationProgress: isMutationInProgress,
            stSymbolInfo
        }
    } = useContext(Context);

    let initialModelType: string = 'json';
    let modelType;
    let variableName: string = '';
    let varExpression: string = '';
    const formField: string = 'Expression';

    const existingProperty = config && config.model;
    if (existingProperty && STKindChecker.isLocalVarDecl(config.model)) {
        const localVarDec: LocalVarDecl = config.model as LocalVarDecl;
        const typeDescriptor = localVarDec.typedBindingPattern.typeDescriptor;
        if (STKindChecker.isIntTypeDesc(typeDescriptor) || STKindChecker.isFloatTypeDesc(typeDescriptor) ||
            STKindChecker.isDecimalTypeDesc(typeDescriptor) || STKindChecker.isBooleanTypeDesc(typeDescriptor) ||
            STKindChecker.isStringTypeDesc(typeDescriptor) || STKindChecker.isJsonTypeDesc(typeDescriptor) ||
            STKindChecker.isVarTypeDesc(typeDescriptor) || STKindChecker.isAnyTypeDesc(typeDescriptor) ||
            STKindChecker.isAnydataTypeDesc(typeDescriptor)) {
            initialModelType = typeDescriptor.name.value;
        } else if (STKindChecker.isErrorTypeDesc(typeDescriptor)) {
            initialModelType = typeDescriptor.errorKeywordToken.value;
        } else if (STKindChecker.isXmlTypeDesc(typeDescriptor)) {
            initialModelType = typeDescriptor.source.trim();
        } else {
            initialModelType = "other";
            modelType = typeDescriptor.source.trim();
        }
        variableName = getVariableNameFromST(config.model).value;
        varExpression = localVarDec.initializer.source;
    } else {
        variableName = '';
        varExpression = '';
    }

    const [selectedType, setSelectedType] = useState(initialModelType);
    const [otherType, setOtherType] = useState<string>(modelType);
    const [varName, setVarName] = useState(variableName);
    const [validExpresssionValue, setValidExpresssionValue] = useState(config.config !== "");
    const [variableExpression, setVariableExpression] = useState<string>(varExpression);
    const [editorFocus, setEditorFocus] = useState<boolean>(false);
    const [isStringType, setIsStringType] = useState(initialModelType === 'string');
    const [initialSource, setInitialSource] = useState('');

    useEffect(() => {
        (async () => {
            const s = await getInitialSource(createModuleVarDecl(
                {
                    varName: varName ? varName : "default",
                    varOptions: [],
                    varType:  selectedType === "other" ? otherType : selectedType,
                    varValue: variableExpression ? variableExpression : "expression"
                },
                {
                    endColumn: 0, endLine: 0, startColumn: 0, startLine: 0
                }
            ));
            setInitialSource(s);
        })();
    }, [varName, selectedType, variableExpression]);

    const onPropertyChange = (property: string) => {
        setVariableExpression(property);
    };

    const handleNameOnChange = (name: string) => {
        setVarName(name);
    };

    const handleOtherTypeOnChange = (type: string) => {
        setValidExpresssionValue(false);
        setOtherType(type);
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        if (type === "string") {
            setIsStringType(true);
        } else {
            setIsStringType(false);
        }

        setValidExpresssionValue(false);
        if (type !== "other") {
            setOtherType(undefined);
        } else {
            setOtherType("var");
        }
        setEditorFocus(true);

        if (!!!variableExpression || defaultValues.includes(variableExpression)) {
            if (type === "xml") {
                onPropertyChange(defaultXmlVal);
            } else if (type === 'json') {
                onPropertyChange(defaultJsonVal);
            } else if (defaultValues.includes(variableExpression)) {
                onPropertyChange("");
            }
        }
    };

    let variableHasReferences = false;

    if (existingProperty && STKindChecker.isLocalVarDecl(config.model)) {
        const symbolRefArray = stSymbolInfo.variableNameReferences.get(variableName);
        variableHasReferences = symbolRefArray ? symbolRefArray.length > 0 : false;
    }

    const validateExpression = (fieldName: string, isInvalid: boolean) => {
        setValidExpresssionValue(!isInvalid);
    };

    const handleSave = () => {
        if (variableExpression) {
            config.config = otherType ? otherType + " " + varName + " = " + variableExpression + ";" :
                selectedType + " " + varName + " = " + variableExpression + ";";
            onSave();
        }
    };

    const revertEditorFocus = () => {
        setEditorFocus(false);
    };

    const saveVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.saveButton.text",
        defaultMessage: "Save"
    });

    const cancelVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.cancelButton.text",
        defaultMessage: "Cancel"
    });

    const addVariablePlaceholder = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.addVariable.placeholder",
        defaultMessage: "Enter variable name"
    });

    const addVariableNameLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.addVariable.name.label",
        defaultMessage: "Name"
    });

    const enterTypePlaceholder = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.enterType.placeholder",
        defaultMessage: "Enter type"
    });

    const otherTypeLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.otherType.label",
        defaultMessage: "Other Type"
    });

    const variableTypeLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.type.label",
        defaultMessage: "Type"
    });

    const variableTooltipMessages = {
        customVariableType: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.variable.customVariableType.tooltip.title",
                defaultMessage: "Enter the variable type."
            })
        },
        expressionEditor: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.variable.expressionEditor.tooltip.title",
                defaultMessage: "Enter a Ballerina expression."
            }),
            actionText: intl.formatMessage({
                id: "lowcode.develop.configForms.variable.expressionEditor.tooltip.actionText",
                defaultMessage: "Learn Ballerina expressions"
            }),
            actionLink: intl.formatMessage({
                id: "lowcode.develop.configForms.variable.expressionEditor.tooltip.actionTitle",
                defaultMessage: "{learnBallerina}"
            }, { learnBallerina: BALLERINA_EXPRESSION_SYNTAX_PATH })
        }
    };

    modelType = (selectedType === "other") ? otherType : selectedType;

    const validForm: boolean = varName.length > 0 && variableExpression.length > 0 && validExpresssionValue;

    const userInputs = {
        selectedType,
        otherType,
        varName,
        variableExpression,
        formField
    };

    const variableNameConfig: VariableNameInputProps = {
        displayName: 'Variable Name',
        value: varName,
        onValueChange: setVarName,
        validateExpression,
        position: config.model ?
            getVariableNameFromST(config.model as LocalVarDecl).position
            : formArgs.targetPosition,
        isEdit: !!config.model,
    }

    const {stmtEditorButton , stmtEditorComponent} = useStatementEditor(
        {
            label: "Variable Statement",
            initialSource,
            formArgs: {formArgs},
            userInputs,
            isMutationInProgress,
            validForm,
            onSave: handleSave,
            onChange: onPropertyChange,
            validate: validateExpression
        },
        !isStringType);

    const {stmtEditorButton , stmtEditorComponent} = useStatementEdior(
                                                {
                                                    label: "Variable Statement",
                                                    initialSource: getInitialSource(selectedType, varName, variableExpression, otherType),
                                                    formArgs: {formArgs},
                                                    userInputs,
                                                    isMutationInProgress,
                                                    validForm,
                                                    onSave: handleSave,
                                                    onChange: onPropertyChange,
                                                    validate: validateExpression
                                                },
                                                !isStringType);

    if (!stmtEditorComponent) {
        return (
            <FormControl data-testid="property-form" className={classes.wizardFormControl}>
                <div>
                    <div className={classes.formFeilds}>
                        <div className={classes.formTitleWrapper}>
                            <div className={classes.mainTitleWrapper}>
                                <Typography variant="h4">
                                    <Box paddingTop={2} paddingBottom={2}>
                                        <FormattedMessage
                                            id="lowcode.develop.configForms.variable.title"
                                            defaultMessage="Variable"
                                        />
                                    </Box>
                                </Typography>
                            </div>
                            {stmtEditorButton}
                        </div>
                        <div className={classes.activeWrapper}>
                            <SelectDropdownWithButton
                                defaultValue={selectedType === "other" ? "other" : modelType}
                                customProps={{
                                    disableCreateNew: true,
                                    values: variableTypes,
                                }}
                                label={variableTypeLabel}
                                onChange={handleTypeChange}
                            />
                            {(selectedType === "other") && (
                                <FormTextInput
                                    defaultValue={otherType}
                                    onChange={handleOtherTypeOnChange}
                                    label={otherTypeLabel}
                                    placeholder={enterTypePlaceholder}
                                />
                            )}
                            <VariableNameInput {...variableNameConfig} />
                            <div className="exp-wrapper">
                                <ExpressionEditor
                                    key={selectedType}
                                    model={{
                                        name: "Expression",
                                        value: variableExpression,
                                        type: (modelType ? modelType : "other")
                                    }}
                                    customProps={{
                                        validate: validateExpression,
                                        expandDefault: (selectedType === "other"),
                                        tooltipTitle: variableTooltipMessages.expressionEditor.title,
                                        tooltipActionText: variableTooltipMessages.expressionEditor.actionText,
                                        tooltipActionLink: variableTooltipMessages.expressionEditor.actionLink,
                                        interactive: true,
                                        focus: editorFocus,
                                        statementType: (modelType ? modelType : "other") as PrimitiveBalType,
                                        revertFocus: revertEditorFocus
                                    }}
                                    onChange={onPropertyChange}
                                    defaultValue={variableExpression}
                                />
                            </div>
                        </div>
                    </div>
                    <FormActionButtons
                        cancelBtnText={cancelVariableButtonText}
                        saveBtnText={saveVariableButtonText}
                        isMutationInProgress={isMutationInProgress}
                        validForm={validForm}
                        onSave={handleSave}
                        onCancel={onCancel}
                    />
                </div>
            </FormControl >
        );
    }
    else {
        return stmtEditorComponent;
    }
}
