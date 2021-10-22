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
import React, { useReducer } from "react"

import { ConstDeclaration, NodePosition } from "@ballerina/syntax-tree"
import { Box, FormControl, Typography } from "@material-ui/core";
import { v4 as uuid } from 'uuid';

import { ConstantIcon } from "../../../../../../assets/icons";
import { PrimaryButton } from "../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../Elements/Button/SecondaryButton";
import CheckBoxGroup from "../../Elements/CheckBox";
import { SelectDropdownWithButton } from "../../Elements/DropDown/SelectDropdownWithButton";
import ExpressionEditor from "../../Elements/ExpressionEditor";
import { FormTextInput } from "../../Elements/TextField/FormTextInput";
import { useStyles as useFormStyles } from "../style";


interface ConstantConfigFormProps {
    model?: ConstDeclaration;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
}


const ConstantVarNameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

export interface ConstantConfigFormState {
    isTypeDefined: boolean;
    constantName: string;
    constantValue: string;
    constantType: string;
    isExpressionValid: boolean;
}

export enum ConstantConfigFormActionTypes {
    SET_CONSTANT_NAME,
    SET_CONSTANT_VALUE,
    SET_CONSTANT_TYPE,
    TOGGLE_INCLUDE_TYPE,
    UPDATE_EXPRESSION_VALIDITY
}

type ConstantConfigFormActions =
    { type: ConstantConfigFormActionTypes.SET_CONSTANT_NAME, payload: string }
    | { type: ConstantConfigFormActionTypes.SET_CONSTANT_VALUE, payload: string }
    | { type: ConstantConfigFormActionTypes.SET_CONSTANT_TYPE, payload: string }
    | { type: ConstantConfigFormActionTypes.TOGGLE_INCLUDE_TYPE }
    | { type: ConstantConfigFormActionTypes.UPDATE_EXPRESSION_VALIDITY, paylaod: boolean };

export function constantConfigFormReducer(state: ConstantConfigFormState, action: ConstantConfigFormActions): ConstantConfigFormState {
    switch (action.type) {
        case ConstantConfigFormActionTypes.SET_CONSTANT_NAME:
            return { ...state, constantName: action.payload }
        case ConstantConfigFormActionTypes.SET_CONSTANT_VALUE:
            return { ...state, constantValue: action.payload }
        case ConstantConfigFormActionTypes.SET_CONSTANT_TYPE:
            return { ...state, constantType: action.payload }
        case ConstantConfigFormActionTypes.TOGGLE_INCLUDE_TYPE:
            return { ...state, constantType: '', isTypeDefined: !state.isTypeDefined, constantValue: '' }
        case ConstantConfigFormActionTypes.UPDATE_EXPRESSION_VALIDITY:
            return { ...state, isExpressionValid: action.paylaod }
        default:
            return state;
    }
}

const defaultConstantFormState: ConstantConfigFormState = {
    isTypeDefined: false,
    constantName: '',
    constantType: '',
    constantValue: '',
    isExpressionValid: false
}

export function isFormConfigValid(config: ConstantConfigFormState): boolean {
    const { constantValue, constantName, constantType, isTypeDefined, isExpressionValid } = config;
    if (isTypeDefined) {
        return constantName.length > 0 && ConstantVarNameRegex.test(constantName) && constantType.length > 0
            && isExpressionValid && constantValue.length > 0;

    } else {
        return constantName.length > 0 && ConstantVarNameRegex.test(constantName) && isExpressionValid
            && constantValue.length > 0;
    }
}

export function ConstantConfigForm(props: ConstantConfigFormProps) {
    const formClasses = useFormStyles();
    const { model, targetPosition, onCancel, onSave } = props;
    const [config, dispatch] = useReducer(constantConfigFormReducer, defaultConstantFormState)

    const variableTypes: string[] = ["int", "float", "byte", "boolean", "string"];

    const validateNameValue = (value: string) => {
        if (value && value !== '') {
            return ConstantVarNameRegex.test(value);
        }
        return true;
    };

    const updateExpressionValidity = (fieldName: string, isInValid: boolean) => {
        dispatch({ type: ConstantConfigFormActionTypes.UPDATE_EXPRESSION_VALIDITY, paylaod: !isInValid });
    }

    const variableNameTextFieldCustomProps = {
        validate: validateNameValue
    };

    const handleTypeEnableToggle = () => {
        dispatch({ type: ConstantConfigFormActionTypes.TOGGLE_INCLUDE_TYPE });
    }

    const handleTypeChange = (type: string) => {
        dispatch({ type: ConstantConfigFormActionTypes.SET_CONSTANT_TYPE, payload: type })
    }

    const handleNameChange = (name: string) => {
        dispatch({ type: ConstantConfigFormActionTypes.SET_CONSTANT_NAME, payload: name })
    }

    const handleValueChange = (value: string) => {
        dispatch({ type: ConstantConfigFormActionTypes.SET_CONSTANT_VALUE, payload: value })
    }

    const expressionEditorConfig = {
        model: {
            name: "valueExpression",
            displayName: "Value Expression",
            typeName: config.isTypeDefined ? config.constantType : undefined
        },
        customProps: {
            validate: updateExpressionValidity,
            interactive: true,
            statementType: config.isTypeDefined ? config.constantType : undefined,
            editPosition: {
                startLine: model ? model.position.startLine : targetPosition.startLine,
                endLine: model ? model.position.startLine : targetPosition.startLine,
                startColumn: 0,
                endColumn: 0
            },
            customTemplate: config.isTypeDefined ? undefined : {
                defaultCodeSnippet: `const temp_var_${uuid().replaceAll('-', '_')} = ;`,
                targetColumn: 54,
            },
        },
        onChange: handleValueChange,
        defaultValue: config.constantValue,
    };

    const typeSelectorCustomProps = {
        disableCreateNew: true,
        values: variableTypes
    };

    const typeSelector = (
        <SelectDropdownWithButton
            defaultValue={config.constantType}
            customProps={typeSelectorCustomProps}
            label={"Select type"}
            onChange={handleTypeChange}
        />
    );

    const handleOnSave = () => {

        onSave();
    }

    const disableSaveBtn: boolean = !isFormConfigValid(config);

    return (
        <FormControl data-testid="module-variable-config-form" className={formClasses.wizardFormControl}>
            <div className={formClasses.formTitleWrapper}>
                <div className={formClasses.mainTitleWrapper}>
                    <ConstantIcon />
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2} paddingLeft={15}>Constant</Box>
                    </Typography>

                </div>
            </div>
            <FormTextInput
                customProps={variableNameTextFieldCustomProps}
                defaultValue={config.constantName}
                onChange={handleNameChange}
                label={"Constant Name"}
                errorMessage={"Invalid Constant Name"}
                placeholder={"Enter Constant Name"}
            />
            <CheckBoxGroup
                values={["Include type in declaration"]}
                defaultValues={config.isTypeDefined ? ["Include type in declaration"] : []}
                onChange={handleTypeEnableToggle}
            />
            {config.isTypeDefined && typeSelector}
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
                    disabled={disableSaveBtn}
                    text="Save"
                    fullWidth={false}
                    onClick={handleOnSave}
                />
            </div>
        </FormControl>
    )
}
