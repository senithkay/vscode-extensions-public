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

import { Box, FormControl, FormHelperText, Typography } from '@material-ui/core';
import { ConfigOverlayFormStatus, FormHeaderSection, PrimaryButton, SecondaryButton, STModification } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { CaptureBindingPattern, ModuleVarDecl, NodePosition } from '@wso2-enterprise/syntax-tree';
import { v4 as uuid } from "uuid";

import { useDiagramContext } from '../../../../../Contexts/Diagram';
import { createConfigurableDecl, updateConfigurableVarDecl } from '../../../../utils/modification-util';
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
    formType: string;
}

export function ConfigurableForm(props: ConfigurableFormProps) {
    const formClasses = useFormStyles();
    const { api: { code: { modifyDiagram } } } = useDiagramContext();
    const { onSave, onCancel, targetPosition, model, configOverlayFormStatus, formType } = props;
    const [state, dispatch] = useReducer(moduleVarFormReducer, getFormConfigFromModel(model));

    const { updateInjectables, updateParentConfigurable, configurableId } = configOverlayFormStatus?.formArgs || {};
    const isFromExpressionEditor = !!updateInjectables;

    const handleOnSave = () => {
        const modifyState: ConfigurableFormState = {
            ...state,
            varValue: state.hasDefaultValue ? state.varValue : '?',
        }
        if (isFromExpressionEditor && updateParentConfigurable) {
            const modification = createConfigurableDecl(modifyState, targetPosition);
            const editItemIndex = updateInjectables?.list.findIndex((item: InjectableItem) => item.id === configurableId);
            let newInjectableList = updateInjectables?.list;
            const newInjectable = {
                id: configurableId,
                name: state.varName,
                value: state.varValue,
                modification,
            }
            if (editItemIndex >= 0) {
                newInjectableList[editItemIndex] = newInjectable;
            } else {
                newInjectableList = [...newInjectableList, newInjectable]
            }
            updateInjectables?.setInjectables(newInjectableList);
            setTimeout(() => {
                updateParentConfigurable(state.varName);
                onCancel();
            }, 250)

        } else {
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
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={isFromExpressionEditor ? "lowcode.develop.configForms.ModuleVarDecl.AddConfigurableTitle" : "lowcode.develop.configForms.ModuleVarDecl.ConfigurableTitle"}
                defaultMessage={isFromExpressionEditor ? 'Add Configurable' : 'Configurable'}
                formType={formType}
            />
            <div className={formClasses.formWrapper}>
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
                <div className={formClasses.expStatementWrapper}>
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
                </div>
                <div className={formClasses.expStatementWrapper}>
                    <ExpressionEditor  {...expressionEditorConfigForLabel} />
                </div>
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
            </div>
        </FormControl>
    )
}
