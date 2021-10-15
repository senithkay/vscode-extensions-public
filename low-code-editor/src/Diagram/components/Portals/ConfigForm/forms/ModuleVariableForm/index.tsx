/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useReducer } from 'react';
import { FormattedMessage } from 'react-intl';

import { CaptureBindingPattern, ModuleVarDecl, NodePosition, ServiceDeclaration, STKindChecker, TypedBindingPattern } from '@ballerina/syntax-tree';
import { Box, FormControl, FormHelperText, Typography } from '@material-ui/core';

import { VariableIcon } from '../../../../../../assets/icons';
import { useDiagramContext } from '../../../../../../Contexts/Diagram';
import { STModification } from '../../../../../../Definitions';
import { createModuleVarDecl, updateModuleVarDecl } from '../../../../../utils/modification-util';
import { PrimaryButton } from '../../Elements/Button/PrimaryButton';
import { SecondaryButton } from '../../Elements/Button/SecondaryButton';
import CheckBoxGroup from '../../Elements/CheckBox';
import { SelectDropdownWithButton } from '../../Elements/DropDown/SelectDropdownWithButton';
import ExpressionEditor from '../../Elements/ExpressionEditor';
import { RadioControl } from '../../Elements/RadioControl/FormRadioControl';
import { FormTextInput } from '../../Elements/TextField/FormTextInput';
import { useStyles as useFormStyles } from "../style";

interface ModuleVariableFormProps {
    model?: ModuleVarDecl;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
}

enum VariableQualifiers {
    NONE = 'None',
    FINAL = 'final',
    CONFIGURABLE = 'configurable',
}

export interface ModuleVariableFormState {
    isPublic: boolean;
    varType: string;
    varName: string;
    varValue: string;
    varQualifier: string;
    isExpressionValid: boolean;
}

export enum ModuleVarFormActionTypes {
    UPDATE_ACCESS_MODIFIER,
    SET_VAR_TYPE,
    SET_VAR_NAME,
    SET_VAR_VALUE,
    SET_VAR_QUALIFIER,
    UPDATE_EXPRESSION_VALIDITY,
    RESET_VARIABLE_TYPE
}

export type ModuleVarFormAction =
    { type: ModuleVarFormActionTypes.UPDATE_ACCESS_MODIFIER, payload: boolean }
    | { type: ModuleVarFormActionTypes.SET_VAR_TYPE, payload: string }
    | { type: ModuleVarFormActionTypes.SET_VAR_NAME, payload: string }
    | { type: ModuleVarFormActionTypes.SET_VAR_VALUE, payload: string }
    | { type: ModuleVarFormActionTypes.SET_VAR_QUALIFIER, payload: string }
    | { type: ModuleVarFormActionTypes.UPDATE_EXPRESSION_VALIDITY, payload: boolean }
    | { type: ModuleVarFormActionTypes.RESET_VARIABLE_TYPE };

export function moduleVarFormReducer(state: ModuleVariableFormState, action: ModuleVarFormAction): ModuleVariableFormState {
    switch (action.type) {
        case ModuleVarFormActionTypes.UPDATE_ACCESS_MODIFIER:
            return { ...state, isPublic: action.payload };
        case ModuleVarFormActionTypes.SET_VAR_NAME:
            return { ...state, varName: action.payload };
        case ModuleVarFormActionTypes.SET_VAR_VALUE:
            return { ...state, varValue: action.payload };
        case ModuleVarFormActionTypes.SET_VAR_TYPE:
            return { ...state, varType: action.payload, varValue: '' };
        case ModuleVarFormActionTypes.SET_VAR_QUALIFIER:
            return { ...state, varQualifier: action.payload };
        case ModuleVarFormActionTypes.UPDATE_EXPRESSION_VALIDITY:
            return { ...state, isExpressionValid: action.payload };
        case ModuleVarFormActionTypes.RESET_VARIABLE_TYPE:
            return { ...state, varType: '', varValue: '' };
    }
}

const defaultFormState: ModuleVariableFormState = {
    isPublic: false,
    varType: 'int',
    varName: '',
    varValue: '',
    varQualifier: '',
    isExpressionValid: true,
}

const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

export function isFormConfigValid(config: ModuleVariableFormState): boolean {
    const { varName, varValue, isExpressionValid } = config;

    return varName.length > 0 && nameRegex.test(varName) && varValue.length > 0 && isExpressionValid;
}

export function getFormConfigFromModel(model: any): ModuleVariableFormState {
    // FixMe: model is set to any type due to missing properties in ST interface
    let varQualifier = '';
    let typeKind = 'int';

    if (model.qualifiers.length > 0) {
        if (STKindChecker.isConfigurableKeyword(model.qualifiers[0])) {
            varQualifier = VariableQualifiers.CONFIGURABLE;
        } else if (STKindChecker.isFinalKeyword(model.qualifiers[0])) {
            varQualifier = VariableQualifiers.FINAL;
        }
    }

    const typeData = model.initializer.typeData;

    if (typeData) {
        const typeSymbol = typeData.typeSymbol;
        if (typeSymbol) {
            typeKind = typeSymbol.typeKind;
        }
    }

    return {
        isPublic: model.visibilityQualifier && STKindChecker.isPublicKeyword(model.visibilityQualifier),
        varType: typeKind,
        varName: ((model.typedBindingPattern as TypedBindingPattern)
            .bindingPattern as CaptureBindingPattern).variableName.value,
        varValue: model.initializer.source,
        varQualifier,
        isExpressionValid: true,
    };
}

export function ModuleVariableForm(props: ModuleVariableFormProps) {
    const formClasses = useFormStyles();
    const { api: { code: { modifyDiagram } } } = useDiagramContext();
    const { onSave, onCancel, targetPosition, model } = props;
    const [state, dispatch] = useReducer(moduleVarFormReducer, getFormConfigFromModel(model));
    const variableTypes: string[] = ["int", "float", "boolean", "string", "json", "xml"];

    if (!state.isPublic) {
        variableTypes.unshift('var');
    }

    const handleOnSave = () => {
        const modifications: STModification[] = []
        if (model) {
            modifications.push(updateModuleVarDecl(state, model.position));
        } else {
            modifications.push(createModuleVarDecl(state, targetPosition));
        }
        modifyDiagram(modifications);
        onSave();
    }

    const onAccessModifierChange = (modifierList: string[]) => {
        dispatch({ type: ModuleVarFormActionTypes.UPDATE_ACCESS_MODIFIER, payload: modifierList.length > 0 });
        if (modifierList.length > 0 && state.varType === 'var') {
            // var type  cannot be public
            dispatch({ type: ModuleVarFormActionTypes.RESET_VARIABLE_TYPE });
        }
    }

    const onVarTypeChange = (type: string) => {
        dispatch({ type: ModuleVarFormActionTypes.SET_VAR_TYPE, payload: type });
    }

    const onValueChange = (value: string) => {
        dispatch({ type: ModuleVarFormActionTypes.SET_VAR_VALUE, payload: value });
    }

    const updateExpressionValidity = (fieldName: string, isInValid: boolean) => {
        dispatch({ type: ModuleVarFormActionTypes.UPDATE_EXPRESSION_VALIDITY, payload: !isInValid });
    }

    const handleOnVarNameChange = (value: string) => {
        dispatch({ type: ModuleVarFormActionTypes.SET_VAR_NAME, payload: value });
    }

    const handleOnVariableQualifierSelect = (value: string) => {
        dispatch({
            type: ModuleVarFormActionTypes.SET_VAR_QUALIFIER,
            payload: value === VariableQualifiers.NONE ? '' : value
        })
    }

    const validateNameValue = (value: string) => {
        if (value && value !== '') {
            return nameRegex.test(value);
        }
        return true;
    };

    const expressionEditorConfig = {
        model: {
            name: "valueExpression",
            displayName: "Value Expression",
            typeName: state.varType
        },
        customProps: {
            validate: updateExpressionValidity,
            interactive: true,
            statementType: state.varType,
            editPosition: {
                startLine: model ? model.position.startLine : targetPosition.startLine,
                endLine: model ? model.position.startLine : targetPosition.startLine,
                startColumn: 0,
                endColumn: 0
            }
        },
        onChange: onValueChange,
        defaultValue: state.varValue,
    };

    const disableSaveBtn: boolean = !isFormConfigValid(state);

    const typeSelectorCustomProps = {
        disableCreateNew: true,
        values: variableTypes,
    };

    const variableNameTextFieldCustomProps = {
        validate: validateNameValue
    };

    const variableQualifierSelectorCustomProps = {
        collection: Object.values(VariableQualifiers),
        disabled: false
    };

    return (
        <FormControl data-testid="module-variable-config-form" className={formClasses.wizardFormControl}>
            <div className={formClasses.formTitleWrapper}>
                <div className={formClasses.mainTitleWrapper}>
                    <VariableIcon />
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2} paddingLeft={15}>Variable</Box>
                    </Typography>
                </div>
            </div>
            <div className={formClasses.labelWrapper}>
                <FormHelperText className={formClasses.inputLabelForRequired}>
                    <FormattedMessage
                        id="lowcode.develop.configForms.ModuleVarDecl.configureNewListener"
                        defaultMessage="Access Modifier :"
                    />
                </FormHelperText>
            </div>
            <CheckBoxGroup
                values={["public"]}
                defaultValues={state.isPublic ? ['public'] : []}
                onChange={onAccessModifierChange}
            />
            <SelectDropdownWithButton
                defaultValue={state.varType}
                customProps={typeSelectorCustomProps}
                label={"Select type"}
                onChange={onVarTypeChange}
            />
            <FormTextInput
                customProps={variableNameTextFieldCustomProps}
                defaultValue={state.varName}
                onChange={handleOnVarNameChange}
                label={"Variable Name"}
                errorMessage={"Invalid Variable Name"}
                placeholder={"Enter Variable Name"}
            />
            <ExpressionEditor
                {...expressionEditorConfig}
            />
            <div className={formClasses.labelWrapper}>
                <FormHelperText className={formClasses.inputLabelForRequired}>
                    <FormattedMessage
                        id="lowcode.develop.configForms.ModuleVarDecl.variableQualifier"
                        defaultMessage="Select Variable Qualifier :"
                    />
                </FormHelperText>
            </div>
            <RadioControl
                onChange={handleOnVariableQualifierSelect}
                defaultValue={state.varQualifier === '' ? VariableQualifiers.NONE : state.varQualifier}
                customProps={variableQualifierSelectorCustomProps}
            />
            <div className={formClasses.wizardBtnHolder}>
                <SecondaryButton
                    text="Cancel"
                    fullWidth={false}
                    onClick={onCancel}
                />
                <PrimaryButton
                    text="Save"
                    disabled={disableSaveBtn}
                    fullWidth={false}
                    onClick={handleOnSave}
                />
            </div>
        </FormControl>
    )
}
