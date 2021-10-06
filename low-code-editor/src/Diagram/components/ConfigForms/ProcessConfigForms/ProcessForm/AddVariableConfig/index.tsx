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
import React, {ReactNode, useContext, useState} from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { LocalVarDecl, STKindChecker } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";

import { CloseRounded, EditIcon, PropertyIcon } from "../../../../../../assets/icons";
import { PrimitiveBalType, WizardType } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../utils/constants";
import { getAllVariables } from "../../../../../utils/mixins";
import { ButtonWithIcon } from "../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { StatementEditorButton } from "../../../../Portals/ConfigForm/Elements/Button/StatementEditorButton";
import { SelectDropdownWithButton } from "../../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { FormActionButtons } from "../../../../Portals/ConfigForm/Elements/FormActionButtons";
import { ViewContainer } from "../../../../Portals/ConfigForm/Elements/StatementEditor/components/ViewContainer/ViewContainer";
import { FormTextInput } from "../../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles } from "../../../../Portals/ConfigForm/forms/style";
import { ProcessConfig } from "../../../../Portals/ConfigForm/types";
import { checkVariableName, genVariableName } from "../../../../Portals/utils";
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
    let varExpression;
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
        variableName = localVarDec.typedBindingPattern.bindingPattern.source.trim();
        varExpression = localVarDec.initializer.source;
    } else {
        variableName = null;
        varExpression = null;
    }

    const [selectedType, setSelectedType] = useState(initialModelType);
    const [otherType, setOtherType] = useState<string>(modelType);
    const [varName, setVarName] = useState(variableName);
    const [defaultVarName, setDefaultVarName] = useState<string>(undefined);
    const [varNameError, setVarNameError] = useState("");
    const [isValidVarName, setIsValidVarName] = useState(false);
    const [validExpresssionValue, setValidExpresssionValue] = useState(config.config !== "");
    const [variableExpression, setVariableExpression] = useState<string>(varExpression);
    const [editorFocus, setEditorFocus] = useState<boolean>(false);
    const [isStmtEditor, setIsStmtEditor] = useState(false);
    const [isStringType, setIsStringType] = useState(initialModelType === 'string');

    if (defaultVarName === undefined) {
        setDefaultVarName(variableName);
    }

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

    const validateNameValue = (value: string) => {
        if (value !== undefined && value !== null) {
            const varValidationResponse = checkVariableName("variable name", value, defaultVarName, stSymbolInfo);
            if (varValidationResponse?.error) {
                setVarNameError(varValidationResponse.message);
                setIsValidVarName(false);
                return false;
            }
        } else if (value === null) {
            setIsValidVarName(false);
            return true;
        }
        setIsValidVarName(true);
        return true;
    };

    let variableHasReferences = false;

    if (existingProperty && STKindChecker.isLocalVarDecl(config.model)) {
        const symbolRefArray = stSymbolInfo.variableNameReferences.get(variableName);
        variableHasReferences = symbolRefArray ? symbolRefArray.length > 0 : false;
    }

    const validateExpression = (fieldName: string, isInvalid: boolean) => {
        setValidExpresssionValue(!isInvalid);
    };

    const handleStmtEditorButtonClick = () => {
        setIsStmtEditor(true);
    };

    const handleStmtEditorCancel = () => {
        setIsStmtEditor(false);
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

    const validForm: boolean = (isValidVarName && validExpresssionValue);

    // todo: Support other data types
    const variableTypes: string[] = ["var", "int", "float", "decimal", "boolean", "string", "json", "xml", "error", "any", "anydata", "other"];

    const userInputs = {
            selectedType,
            otherType,
            varName,
            variableExpression,
            formField
    };

    let exprEditor =
        <FormControl data-testid="property-form" className={classes.wizardFormControl}>
            {!isCodeEditorActive ?
                (
                    <div>
                        <div className={classes.formFeilds}>
                            <div className={classes.formTitleWrapper}>
                                <div className={classes.mainTitleWrapper}>
                                    <div className={classes.iconWrapper}>
                                        <PropertyIcon />
                                    </div>
                                    <Typography variant="h4">
                                        <Box paddingTop={2} paddingBottom={2}><FormattedMessage id="lowcode.develop.configForms.variable.title" defaultMessage="Variable" /></Box>
                                    </Typography>
                                </div>
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
                                <FormTextInput
                                    dataTestId="variable-name"
                                    customProps={{
                                        validate: validateNameValue,
                                        disabled: variableHasReferences
                                    }}
                                    defaultValue={varName}
                                    onChange={handleNameOnChange}
                                    label={addVariableNameLabel}
                                    errorMessage={varNameError}
                                    placeholder={addVariablePlaceholder}
                                />
                                <div className="exp-wrapper">
                                    <ExpressionEditor
                                        key={selectedType}
                                        model={{ name: "Expression", value: variableExpression, type: (modelType ? modelType : "other") }}
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
                )
                :
                null
            }
        </FormControl >;

    if (isStmtEditor) {
        exprEditor = <FormControl data-testid="property-form">
            {!isCodeEditorActive ? (
                <div>
                    <div className={classes.formTitleWrapper}>
                        <div className={classes.mainTitleWrapper}>
                            <Typography variant="h4">
                                <Box paddingTop={2} paddingBottom={2}><FormattedMessage id="lowcode.develop.configForms.statementEditor.title" defaultMessage="Statement Editor" /></Box>
                            </Typography>
                        </div>
                    </div>
                    <ViewContainer
                        kind="DefaultString" // TODO: Derive the kind from the user input
                        label="Variable Statement"
                        formArgs={formArgs}
                        userInputs={userInputs}
                        isMutationInProgress={isMutationInProgress}
                        validForm={validForm}
                        onCancel={handleStmtEditorCancel}
                        onSave={handleSave}
                        onChange={onPropertyChange}
                        validate={validateExpression}
                    />
                </div>
            ) : null}
        </FormControl>;
    }

    return (
        exprEditor
    );
}
