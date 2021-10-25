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
import { v4 as uuid } from "uuid";

import { ConfigurableIcon } from '../../../../../../assets/icons';
import { useDiagramContext } from '../../../../../../Contexts/Diagram';
import { STModification } from '../../../../../../Definitions';
import { createConfigurableDecl, updateConfigurableVarDecl } from '../../../../../utils/modification-util';
import { PrimaryButton } from '../../Elements/Button/PrimaryButton';
import { SecondaryButton } from '../../Elements/Button/SecondaryButton';
import CheckBoxGroup from '../../Elements/CheckBox';
import { SelectDropdownWithButton } from '../../Elements/DropDown/SelectDropdownWithButton';
import ExpressionEditor from '../../Elements/ExpressionEditor';
import { FormTextInput } from '../../Elements/TextField/FormTextInput';
import { useStyles as useFormStyles } from "../style";

import { getFormConfigFromModel, isFormConfigValid, ModuleVarNameRegex, VariableQualifiers } from './util';
import { ConfigurableFormActionTypes, moduleVarFormReducer } from './util/reducer';

interface ConfigurableFormProps {
    model?: ModuleVarDecl;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
}

export function ConfigurableForm(props: ConfigurableFormProps) {
    const formClasses = useFormStyles();
    const { api: { code: { modifyDiagram } } } = useDiagramContext();
    const { onSave, onCancel, targetPosition, model } = props;
    const [state, dispatch] = useReducer(moduleVarFormReducer, getFormConfigFromModel(model));
    const variableTypes: string[] = ["int", "float", "boolean", "string", "json", "xml"];

    const handleOnSave = () => {
        const modifications: STModification[] = []
        if (model) {
            modifications.push(updateConfigurableVarDecl(state, model.position));
        } else {
            modifications.push(createConfigurableDecl(state, targetPosition));
        }
        modifyDiagram(modifications);
        onSave();
    }

    const onAccessModifierChange = (modifierList: string[]) => {
        dispatch({ type: ConfigurableFormActionTypes.UPDATE_ACCESS_MODIFIER, payload: modifierList.length > 0 });
    }

    const onVarTypeChange = (type: string) => {
        dispatch({ type: ConfigurableFormActionTypes.SET_VAR_TYPE, payload: type });
    }

    const onValueChange = (value: string) => {
        dispatch({ type: ConfigurableFormActionTypes.SET_VAR_VALUE, payload: value });
    }

    const onLabelChange = (value: string) => {
        dispatch({ type: ConfigurableFormActionTypes.SET_VAR_LABEL, payload: value });
    }

    const updateExpressionValidity = (fieldName: string, isInValid: boolean) => {
        dispatch({ type: ConfigurableFormActionTypes.UPDATE_EXPRESSION_VALIDITY, payload: !isInValid });
    }

    const handleOnVarNameChange = (value: string) => {
        dispatch({ type: ConfigurableFormActionTypes.SET_VAR_NAME, payload: value });
    }

    const validateNameValue = (value: string) => {
        if (value && value !== '') {
            return ModuleVarNameRegex.test(value);
        }
        return true;
    };

    const expressionEditorConfigForValue = {
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
            },
            customTemplate: {
                defaultCodeSnippet: `configurable ${state.varType} temp_var_${uuid().replaceAll('-', '_')} = ;`,
                targetColumn: 62 + state.varType.length,
            },
        },
        onChange: onValueChange,
        defaultValue: state.varValue,
    };

    const expressionEditorConfigForLabel = {
        model: {
            name: "Label",
            displayName: "Configurable Description",
            typeName: 'string'
        },
        customProps: {
            validate: updateExpressionValidity,
            interactive: true,
            statementType: 'string',
            editPosition: {
                startLine: model ? model.position.startLine : targetPosition.startLine,
                endLine: model ? model.position.startLine : targetPosition.startLine,
                startColumn: 0,
                endColumn: 0
            },
        },
        onChange: onLabelChange,
        defaultValue: state.label,
    };

    const disableSaveBtn: boolean = !isFormConfigValid(state);

    const typeSelectorCustomProps = {
        disableCreateNew: true,
        values: variableTypes,
    };

    const variableNameTextFieldCustomProps = {
        validate: validateNameValue
    };

    return (
        <FormControl data-testid="module-variable-config-form" className={formClasses.wizardFormControl}>
            <div className={formClasses.formTitleWrapper}>
                <div className={formClasses.mainTitleWrapper}>
                    <ConfigurableIcon />
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2} paddingLeft={15}>Configurable</Box>
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
                label={"Configurable Name"}
                errorMessage={"Invalid Configurable Name"}
                placeholder={"Enter Configurable Name"}
            />
            <ExpressionEditor
                {...expressionEditorConfigForValue}
            />
            <ExpressionEditor
                {...expressionEditorConfigForLabel}
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
