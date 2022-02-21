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
import React, { useContext, useReducer } from 'react';

import { FormControl } from '@material-ui/core';
import { ExpressionEditorProps } from '@wso2-enterprise/ballerina-expression-editor';
import {
    ConfigOverlayFormStatus,
    FormActionButtons,
    FormElementProps,
    FormHeaderSection,
    PrimaryButton,
    SecondaryButton,
    STModification
} from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { CaptureBindingPattern, ModuleVarDecl, NodePosition } from '@wso2-enterprise/syntax-tree';
import { v4 as uuid } from "uuid";

import { Context, useDiagramContext } from '../../../../../Contexts/Diagram';
import { ADD_CONFIGURABLE, LowcodeEvent } from '../../../../models';
import { createConfigurableDecl, updateConfigurableVarDecl } from '../../../../utils/modification-util';
import { useStyles as useFormStyles } from "../../DynamicConnectorForm/style";
import CheckBoxGroup from '../../FormFieldComponents/CheckBox';
import { SelectDropdownWithButton } from '../../FormFieldComponents/DropDown/SelectDropdownWithButton';
import { LowCodeExpressionEditor } from "../../FormFieldComponents/LowCodeExpressionEditor";
import { TextLabel } from '../../FormFieldComponents/TextField/TextLabel';
import { InjectableItem } from '../../FormGenerator';
import { VariableNameInput } from '../Components/VariableNameInput';
import { VariableTypeInput, VariableTypeInputProps } from '../Components/VariableTypeInput';

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
    isLastMember?: boolean;
}

export function ConfigurableForm(props: ConfigurableFormProps) {
    const formClasses = useFormStyles();
    const { api: { code: { modifyDiagram }, insights: { onEvent } }, props: { stSymbolInfo } } = useDiagramContext();
    const { onSave, onCancel, targetPosition, model, configOverlayFormStatus, formType, isLastMember } = props;
    const [state, dispatch] = useReducer(moduleVarFormReducer, getFormConfigFromModel(model, stSymbolInfo));

    const { updateInjectables, updateParentConfigurable, configurableId } = configOverlayFormStatus?.formArgs || {};
    const isFromExpressionEditor = !!updateInjectables;

    const handleOnSave = () => {
        const modifyState: ConfigurableFormState = {
            ...state,
            varValue: state.hasDefaultValue ? state.varValue : '?',
        }
        if (isFromExpressionEditor && updateParentConfigurable) {
            const modification = createConfigurableDecl(modifyState, targetPosition, isLastMember);
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
            // const event: LowcodeEvent = {
            //     type: ADD_CONFIGURABLE,
            //     name: state.varName
            // };
            // onEvent(event);
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

    const expressionEditorConfigForValue: FormElementProps<ExpressionEditorProps> = {
        model: {
            name: "valueExpression",
            displayName: "Value Expression",
            typeName: state.varType,
            value: state.varValue,
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
            hideTextLabel: true,
            initialDiagnostics: model?.initializer?.typeData?.diagnostics,
        },
        onChange: onValueChange,
        defaultValue: state.varValue
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
    const disableSaveBtn: boolean = isFormConfigValid(state);
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

    const validateExpression = (fieldName: string, isInvalidType: boolean) => {
        updateExpressionValidity(fieldName, isInvalidType);
    };

    const variableTypeConfig: VariableTypeInputProps = {
        displayName: 'Variable Type',
        value: state.varType,
        onValueChange: onVarTypeChange,
        validateExpression,
        position: model ? {
            ...model.position,
            endLine: 0,
            endColumn: 0,
        } : targetPosition,
        overrideTemplate: {
            defaultCodeSnippet: `|()  tempVarType = ();`,
            targetColumn: 1
        }
    }

    const variableTypeInput = (
        <div className="exp-wrapper">
            <VariableTypeInput {...variableTypeConfig} />
        </div>
    );

    return (
        <FormControl data-testid="module-variable-config-form" className={formClasses.wizardFormControl}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={isFromExpressionEditor ? "lowcode.develop.configForms.ModuleVarDecl.AddConfigurableTitle" : "lowcode.develop.configForms.ModuleVarDecl.ConfigurableTitle"}
                defaultMessage={isFromExpressionEditor ? 'Add Configurable' : 'Configurable'}
                formType={formType}
            />
            <div className={formClasses.formContentWrapper}>
                <div className={formClasses.formNameWrapper}>
                    <TextLabel
                        required={true}
                        textLabelId="lowcode.develop.configForms.ModuleVarDecl.configureNewListener"
                        defaultMessage="Access Modifier :"
                    />
                    <CheckBoxGroup
                        values={["public"]}
                        defaultValues={state.isPublic ? ['public'] : []}
                        onChange={onAccessModifierChange}
                    />
                    {variableTypeInput}
                    <VariableNameInput
                        // Fixme: Prevent editing name if the configurable is being referenced somewhere
                        displayName={'Configurable Name'}
                        value={state.varName}
                        onValueChange={handleOnVarNameChange}
                        validateExpression={updateExpressionValidity}
                        position={namePosition}
                        isEdit={!isFromExpressionEditor && !!model}
                        initialDiagnostics={model?.typedBindingPattern?.typeData?.diagnostics}
                    />
                    <TextLabel
                        required={true}
                        textLabelId="lowcode.develop.configForms.ModuleVarDecl.defaultValueIncluded"
                        defaultMessage="Default Value :"
                    />
                    <CheckBoxGroup
                        values={["Include Default Value"]}
                        defaultValues={state.hasDefaultValue ? ['Include Default Value'] : []}
                        onChange={onHasDefaultValChange}
                    />
                    <div hidden={!state.hasDefaultValue}>
                        <LowCodeExpressionEditor
                            {...expressionEditorConfigForValue}
                        />
                    </div>
                </div>
            </div>
            <FormActionButtons
                cancelBtnText="Cancel"
                cancelBtn={true}
                saveBtnText="Save"
                onSave={handleOnSave}
                onCancel={onCancel}
                validForm={disableSaveBtn}
            />
        </FormControl>
    )
}
