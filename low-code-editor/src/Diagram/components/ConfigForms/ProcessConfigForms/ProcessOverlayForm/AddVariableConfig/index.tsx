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
import { FormattedMessage, useIntl } from "react-intl";

import { LocalVarDecl, STKindChecker } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";

import { CHOREO_DOCS } from "../../../../../../../../../src/api/app-client";
import { CloseRounded, PropertyIcon } from "../../../../../../assets/icons";
import { PrimitiveBalType, WizardType } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { getAllVariables } from "../../../../../utils/mixins";
import { ButtonWithIcon } from "../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { PrimaryButton } from "../../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { FormTextInput } from "../../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles } from "../../../../Portals/ConfigForm/forms/style";
import { ProcessConfig } from "../../../../Portals/ConfigForm/types";
import { checkVariableName, genVariableName } from "../../../../Portals/utils";
import { wizardStyles } from "../../../style";

interface AddVariableConfigProps {
    config: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
}

export function AddVariableConfig(props: AddVariableConfigProps) {
    const classes = useStyles();
    const overlayClasses = wizardStyles();
    const intl = useIntl();
    const { config, onCancel, onSave } = props;

    const { state } = useContext(Context);
    const { isMutationProgress: isMutationInProgress, stSymbolInfo, isCodeEditorActive } = state;

    let initialModelType: string = 'var';
    let modelType = initialModelType;
    let variableName: string = '';

    const existingProperty = config && config.wizardType === WizardType.EXISTING;
    if (existingProperty && STKindChecker.isLocalVarDecl(config.model)) {
        const localVarDec: LocalVarDecl = config.model as LocalVarDecl;
        const typeDescriptor = localVarDec.typedBindingPattern.typeDescriptor;
        if (STKindChecker.isIntTypeDesc(typeDescriptor) || STKindChecker.isFloatTypeDesc(typeDescriptor) ||
            STKindChecker.isBooleanTypeDesc(typeDescriptor) || STKindChecker.isStringTypeDesc(typeDescriptor) ||
            STKindChecker.isJsonTypeDesc(typeDescriptor) || STKindChecker.isVarTypeDesc(typeDescriptor)) {
            initialModelType = typeDescriptor.name.value;
        } else if (STKindChecker.isXmlTypeDesc(typeDescriptor)) {
            initialModelType = typeDescriptor.source.trim();
        } else {
            initialModelType = "other";
            modelType = typeDescriptor.source.trim();
        }
        variableName = localVarDec.typedBindingPattern.bindingPattern.source.trim();
    } else {
        variableName = stSymbolInfo ? genVariableName("variable", getAllVariables(stSymbolInfo)) : "";
    }

    const [selectedType, setSelectedType] = useState(initialModelType);
    const [otherType, setOtherType] = useState<string>(modelType);
    const [varName, setVarName] = useState(variableName);
    const [defaultVarName, setDefaultVarName] = useState<string>(undefined);
    const [varNameError, setVarNameError] = useState("");
    const [isValidVarName, setIsValidVarName] = useState(false);
    const [validExpresssionValue, setValidExpresssionValue] = useState(config.config !== "");
    const [variableExpression, setVariableExpression] = useState<string>("");
    const [editorFocus, setEditorFocus] = useState<boolean>(false);

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
        setValidExpresssionValue(false);
        if (type !== "other") {
            setOtherType(undefined);
        } else {
            setOtherType("var");
        }
        setEditorFocus(true);
    };

    const validateNameValue = (value: string) => {
        if (value !== undefined || value !== null) {
            const varValidationResponse = checkVariableName("variable name", value, defaultVarName, state);
            if (varValidationResponse?.error) {
                setVarNameError(varValidationResponse.message);
                setIsValidVarName(false);
                return false;
            }
        }
        setIsValidVarName(true);
        return true;
    };

    let variableHasReferences = false;

    if (config.wizardType === WizardType.EXISTING) {
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
                defaultMessage: "Enter the variable type"
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
            defaultMessage: "{learnBallerina}/references/ballerina-expression-syntax/"
        }, { learnBallerina: CHOREO_DOCS })
    }
    };

    modelType = (selectedType === "other") ? otherType : selectedType;

    const validForm: boolean = (isValidVarName && validExpresssionValue);

    // todo: Support other data types
    const variableTypes: string[] = ["var", "int", "float", "boolean", "string", "json", "xml", "other"];

    return (
        <FormControl data-testid="property-form" className={classes.wizardFormControl}>
            {!isCodeEditorActive ?
                (
                    <div className={overlayClasses.configWizardContainer}>
                        <div className={classes.formWrapper}>
                            <ButtonWithIcon
                                className={classes.overlayDeleteBtn}
                                onClick={onCancel}
                                icon={<CloseRounded fontSize="small" />}
                            />
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
                                        customProps={{
                                            tooltipTitle: variableTooltipMessages.customVariableType.title,
                                        }}
                                    />
                                )}
                                <FormTextInput
                                    dataTestId="variable-name"
                                    customProps={{
                                        validate: validateNameValue,
                                        tooltipTitle: "Name of the {0}".replace("{0}", selectedType),
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
                                        model={{ name: "Expression", type: (modelType ? modelType : "other") as PrimitiveBalType }}
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
                                        defaultValue={config.config}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={overlayClasses.buttonWrapper}>
                            <SecondaryButton text={cancelVariableButtonText} fullWidth={false} onClick={onCancel} />
                                <PrimaryButton
                                    dataTestId="save-btn"
                                    text={saveVariableButtonText}
                                    disabled={isMutationInProgress || !validForm}
                                    fullWidth={false}
                                    onClick={handleSave}
                                />
                        </div>
                    </div>
                )
                :
                null
            }
        </FormControl >
    );
}
