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

import { ModuleVarDecl, NodePosition } from '@ballerina/syntax-tree';
import { Box, FormControl, FormHelperText, Typography } from '@material-ui/core';

import { VariableIcon } from '../../../../../assets/icons';
import { useDiagramContext } from '../../../../../Contexts/Diagram';
import { STModification } from '../../../../../Definitions';
import { createModuleVarDecl, updateModuleVarDecl } from '../../../../utils/modification-util';
import { PrimaryButton } from '../../FormFieldComponents/Button/PrimaryButton';
import { SecondaryButton } from '../../FormFieldComponents/Button/SecondaryButton';
import CheckBoxGroup from '../../FormFieldComponents/CheckBox';
import { SelectDropdownWithButton } from '../../FormFieldComponents/DropDown/SelectDropdownWithButton';
import ExpressionEditor from '../../FormFieldComponents/ExpressionEditor';
import { FormTextInput } from '../../FormFieldComponents/TextField/FormTextInput';
import { wizardStyles as useFormStyles } from "../style";

import { getFormConfigFromModel, isFormConfigValid, ModuleVarNameRegex, VariableOptions } from './util';
import { ModuleVarFormActionTypes, moduleVarFormReducer } from './util/reducer';


interface ModuleVariableFormProps {
    model?: ModuleVarDecl;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
}

export function ModuleVariableForm(props: ModuleVariableFormProps) {
    const formClasses = useFormStyles();
    const { api: { code: { modifyDiagram } } } = useDiagramContext();
    const { onSave, onCancel, targetPosition, model } = props;
    const [state, dispatch] = useReducer(moduleVarFormReducer, getFormConfigFromModel(model));
    const variableTypes: string[] = ["int", "float", "boolean", "string", "json", "xml"];

    if (state.varOptions.indexOf(VariableOptions.PUBLIC) === -1) {
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
        dispatch({ type: ModuleVarFormActionTypes.SET_VAR_OPTIONS, payload: modifierList });
        if (modifierList.indexOf('public') > -1 && state.varType === 'var') {
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

    const validateNameValue = (value: string) => {
        if (value && value !== '') {
            return ModuleVarNameRegex.test(value);
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
        collection: Object.values(VariableOptions),
        disabled: false
    };

    let namePosition: NodePosition = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }

    if (model) {
        namePosition = getVariableNameFromST(model).position;
    } else {
        namePosition.startLine = targetPosition.startLine;
        namePosition.endLine = targetPosition.startLine;
    }

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
                        id="lowcode.develop.configForms.ModuleVarDecl.variableQualifier"
                        defaultMessage="Select Variable Options :"
                    />
                </FormHelperText>
            </div>
            <CheckBoxGroup
                values={['public', 'final']}
                defaultValues={state.varOptions}
                onChange={onAccessModifierChange}
            />
            <SelectDropdownWithButton
                defaultValue={state.varType}
                customProps={typeSelectorCustomProps}
                label={"Select type"}
                onChange={onVarTypeChange}
            />
            <VariableNameInput
                displayName={'Variable Name'}
                value={state.varName}
                onValueChange={handleOnVarNameChange}
                validateExpression={updateExpressionValidity}
                position={namePosition}
                isEdit={!!model}
            />
            <ExpressionEditor
                {...expressionEditorConfig}
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
