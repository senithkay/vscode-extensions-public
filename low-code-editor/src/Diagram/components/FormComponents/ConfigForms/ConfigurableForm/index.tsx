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

import { CaptureBindingPattern, ModuleVarDecl, NodePosition } from '@ballerina/syntax-tree';
import { Box, FormControl, FormHelperText, Typography } from '@material-ui/core';
import { v4 as uuid } from "uuid";

import { ConfigurableIcon } from '../../../../../assets/icons';
import { useDiagramContext } from '../../../../../Contexts/Diagram';
import { ConfigOverlayFormStatus, STModification } from '../../../../../Definitions';
import { createConfigurableDecl, updateConfigurableVarDecl } from '../../../../utils/modification-util';
import { PrimaryButton } from '../../FormFieldComponents/Button/PrimaryButton';
import { SecondaryButton } from '../../FormFieldComponents/Button/SecondaryButton';
import CheckBoxGroup from '../../FormFieldComponents/CheckBox';
import { SelectDropdownWithButton } from '../../FormFieldComponents/DropDown/SelectDropdownWithButton';
import ExpressionEditor from '../../FormFieldComponents/ExpressionEditor';
import { InjectableItem } from '../../FormGenerator';
import { VariableNameInput } from '../Components/VariableNameInput';
import { wizardStyles as useFormStyles } from "../style";

import { ConfigurableFormState, getFormConfigFromModel, isFormConfigValid } from './util';
import { ConfigurableFormActionTypes, moduleVarFormReducer } from './util/reducer';

const variableTypes: string[] = ["int", "float", "boolean", "string", "xml"];
interface ConfigurableFormProps {
    model?: ModuleVarDecl;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    configOverlayFormStatus?: ConfigOverlayFormStatus;
}

export function ConfigurableForm(props: ConfigurableFormProps) {
    const formClasses = useFormStyles();
    const { api: { code: { modifyDiagram } } } = useDiagramContext();
    const { onSave, onCancel, targetPosition, model, configOverlayFormStatus } = props;
    const [state, dispatch] = useReducer(moduleVarFormReducer, getFormConfigFromModel(model));

    const { updateInjectables, updateParentConfigurable, configurableId } = configOverlayFormStatus?.formArgs || {};
    const isFromExpressionEditor = !!updateInjectables;

    const handleOnSave = () => {
        const modifyState: ConfigurableFormState = {
            ...state,
            varValue: state.hasDefaultValue ? state.varValue : '?',
        }
        if (isFromExpressionEditor && updateParentConfigurable){
            const modification = createConfigurableDecl(modifyState, targetPosition);
            const editItemIndex = updateInjectables?.list.findIndex((item: InjectableItem) => item.id === configurableId);
            let newInjectableList = updateInjectables?.list;
            const newInjectable = {
                id: configurableId,
                name: state.varName,
                value: state.varValue,
                modification,
              }
            if (editItemIndex >= 0){
                newInjectableList[editItemIndex] = newInjectable;
            }else{
                newInjectableList = [...newInjectableList, newInjectable]
            }
            updateInjectables?.setInjectables(newInjectableList);
            setTimeout(() => {
                updateParentConfigurable(state.varName);
                onCancel();
            }, 250)

        }else{
            const modifications: STModification[] = []
            if (model) {
                modifications.push(updateConfigurableVarDecl(modifyState, model.position));
            } else {
                modifications.push(createConfigurableDecl(modifyState, targetPosition));
            }
            modifyDiagram(modifications);
            onSave();
        }
    }

    const onAccessModifierChange = (modifierList: string[]) => {
        dispatch({ type: ConfigurableFormActionTypes.UPDATE_ACCESS_MODIFIER, payload: modifierList.length > 0 });
    }

    const onHasDefaultValChange = (defaultValList: string[]) => {
        dispatch({ type: ConfigurableFormActionTypes.SET_DEFAULT_INCLUDED, payload: defaultValList.length > 0 });
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
            hideTextLabel: true
        },
        onChange: onValueChange,
        defaultValue: state.varValue,
    };

    const expressionEditorConfigForLabel = {
        model: {
            name: "Label",
            displayName: "Configurable Description",
            typeName: 'string',
            optional: true
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
            }
        },
        onChange: onLabelChange,
        defaultValue: state.label,
    };

    const disableSaveBtn: boolean = !isFormConfigValid(state);

    const typeSelectorCustomProps = {
        disableCreateNew: true,
        values: variableTypes,
    };

    let namePosition: NodePosition = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }

    if (model && (model?.typedBindingPattern?.bindingPattern as CaptureBindingPattern)?.variableName?.position) {
        namePosition = (model.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.position;
    } else {
        namePosition.startLine = targetPosition.startLine;
        namePosition.endLine = targetPosition.startLine;
    }

    return (
        <FormControl data-testid="module-variable-config-form" className={formClasses.wizardFormControl}>
            <div className={formClasses.formTitleWrapper}>
                <div className={formClasses.mainTitleWrapper}>
                    <ConfigurableIcon />
                    <Box textAlign="center" flex={1} paddingTop={2} paddingBottom={2} >
                        <Typography variant="h4">
                            {isFromExpressionEditor ? 'Add Configurable' : 'Configurable'}
                        </Typography>
                    </Box>
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
                label={isFromExpressionEditor ? "type" : "Select type"}
                onChange={onVarTypeChange}
                disabled={isFromExpressionEditor}
            />
            <VariableNameInput
                // Fixme: Prevent editing name if the configurable is being referenced somewhere
                displayName={'Configurable Name'}
                value={state.varName}
                onValueChange={handleOnVarNameChange}
                validateExpression={updateExpressionValidity}
                position={namePosition}
                isEdit={!isFromExpressionEditor && !!model}
            />
            <div className={formClasses.labelWrapper}>
                <FormHelperText className={formClasses.inputLabelForRequired}>
                    <FormattedMessage
                        id="lowcode.develop.configForms.ModuleVarDecl.defaultValueIncluded"
                        defaultMessage="Default Value :"
                    />
                </FormHelperText>
            </div>
            <CheckBoxGroup
                values={["Include Default Value"]}
                defaultValues={state.hasDefaultValue ? ['Include Default Value'] : []}
                onChange={onHasDefaultValChange}
            />
            <div hidden={!state.hasDefaultValue}>
                <ExpressionEditor
                    {...expressionEditorConfigForValue}
                />
            </div>
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
