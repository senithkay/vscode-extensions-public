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
import React, { useContext, useState} from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { LocalVarDecl, STKindChecker } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";
import classnames from "classnames";

import { Context } from "../../../../../../../Contexts/Diagram";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../../utils/constants";
import { createModuleVarDecl, getInitialSource } from "../../../../../../utils/modification-util";
import { getVariableNameFromST } from "../../../../../../utils/st-util";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { SelectDropdownWithButton } from "../../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import ExpressionEditor from "../../../../FormFieldComponents/ExpressionEditor";
import { FormActionButtons } from "../../../../FormFieldComponents/FormActionButtons";
import { useStatementEditor } from "../../../../FormFieldComponents/StatementEditor/hooks";
import {SwitchToggle} from "../../../../FormFieldComponents/SwitchToggle";
import { FormTextInput } from "../../../../FormFieldComponents/TextField/FormTextInput";
import { ProcessConfig } from "../../../../Types";
import { VariableNameInput, VariableNameInputProps } from "../../../Components/VariableNameInput";
import {
    VariableTypeInput,
    VariableTypeInputProps
} from "../../../Components/VariableTypeInput";
import { wizardStyles } from "../../../style";

interface AddVariableConfigProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
}

// FIXME: remove variableTypes array once its references are removed from other places
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

    let initialModelType: string = '';
    let variableName: string = '';
    let varExpression: string = '';
    const formField: string = 'Expression';
    let initializedState;

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
            initialModelType = typeDescriptor.source.trim();
        }
        variableName = getVariableNameFromST(config.model).value;
        varExpression = localVarDec?.initializer?.source || '';
        initializedState = localVarDec?.initializer ? true : false;
    } else {
        variableName = '';
        varExpression = '';
        initializedState = true;
    }

    const [selectedType, setSelectedType] = useState(initialModelType);
    const [varName, setVarName] = useState(variableName);
    const [validExpresssionValue, setValidExpresssionValue] = useState(config.config !== "");
    const [variableExpression, setVariableExpression] = useState<string>(varExpression);
    const [initialized, setIsInitialized] = useState<boolean>(initializedState);

    const onPropertyChange = (property: string) => {
        setVariableExpression(property);
    };

    const handleNameOnChange = (name: string) => {
        setVarName(name);
    };


    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setValidExpresssionValue(false);
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
        if (initialized) {
            if (variableExpression) {
                config.config = selectedType + " " + varName + " = " + variableExpression + ";";
                onSave();
            }
        } else {
            config.config = selectedType + " " + varName + ";";
            onSave();
        }
    };

    const saveVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.saveButton.text",
        defaultMessage: "Save"
    });

    const cancelVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.cancelButton.text",
        defaultMessage: "Cancel"
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


    const validForm: boolean = initialized
        ? varName.length > 0 && variableExpression.length > 0 && validExpresssionValue
        : varName.length > 0;

    const userInputs = {
        selectedType,
        varName,
        variableExpression,
        formField
    };

    const variableTypeConfig: VariableTypeInputProps = {
        displayName: 'Variable Type',
        value: selectedType,
        onValueChange: setSelectedType,
        validateExpression,
        position: config.model ?
        (config.model as LocalVarDecl).typedBindingPattern.position
            : formArgs.targetPosition,
        isEdit: !!config.model,
    }

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

    const expressionEditorConfig = {
        key: selectedType,
        model: {
            name: "Expression",
            displayName: "Value Expression",
            typeName: selectedType || 'any|error',
            value: variableExpression,
        },
        customProps: {
            validate: validateExpression,
            interactive: true,
            statementType: selectedType,
            tooltipTitle: variableTooltipMessages.expressionEditor.title,
            tooltipActionText: variableTooltipMessages.expressionEditor.actionText,
            tooltipActionLink: variableTooltipMessages.expressionEditor.actionLink,
            expressionInjectables: {
                list: formArgs?.expressionInjectables?.list,
                setInjectables: formArgs?.expressionInjectables?.setInjectables
            },
        },
        onChange: onPropertyChange,
        defaultValue: variableExpression,
    };

    const initialSource = getInitialSource(createModuleVarDecl(
        {
            varName: varName ? varName : "default",
            varOptions: [],
            varType: selectedType,
            varValue: variableExpression ? variableExpression : "EXPRESSION"
        }
    ));

    const {stmtEditorButton , stmtEditorComponent} = useStatementEditor(
        {
            label: intl.formatMessage({id: "lowcode.develop.configForms.variable.statementEditor.label"}),
            initialSource,
            formArgs: {formArgs},
            userInputs,
            isMutationInProgress,
            validForm,
            onSave: handleSave,
            onChange: onPropertyChange,
            validate: validateExpression,
            handleNameOnChange,
            handleTypeChange
        }
    );

    const variableTypeInput = (
        <div className="exp-wrapper">
            <VariableTypeInput {...variableTypeConfig} />
        </div>
    );

    const variableNameInput = (
        <div className="exp-wrapper">
            <VariableNameInput {...variableNameConfig} />
        </div>
    );

    const expressionEditor = (
        <div className="exp-wrapper">
            <ExpressionEditor
                hideLabelTooltips={true}
                {...expressionEditorConfig}
            />
        </div>
    );

    const handleVarInitialize = () => {
        setIsInitialized(!initialized);
    };

    const initializedToggle = (
        <div className={classes.toggle}>
            <Typography variant="body1">
                <FormattedMessage
                    id="lowcode.develop.configForms.variable.initialize.button"
                    defaultMessage="Initialize Variable"
                />
            </Typography>
            <SwitchToggle onChange={handleVarInitialize} initSwitch={initialized}/>
        </div>
    );

    if (!stmtEditorComponent) {
        return (
            <FormControl data-testid="property-form" className={classnames(classes.wizardFormControl, classes.fitContent)}>
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
                            <div className={classnames(classes.activeWrapper, classes.blockWrapper)}>
                                <div className={classes.nameExpEditorWrapper}>
                                    {variableTypeInput}
                                </div>
                                <div className={classes.nameExpEditorWrapper}>
                                    {variableNameInput}
                                </div>
                                {
                                    initialized && (
                                        <div className={classes.inlineWrapper}>
                                            <div className={classes.codeText}>
                                                <Typography variant='body2' className={classes.endCode}>=</Typography>
                                            </div>
                                            <div className={classes.variableExpEditorWrapper}>
                                                {expressionEditor}
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                            {initializedToggle}
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
