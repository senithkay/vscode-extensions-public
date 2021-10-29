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
import React, { useContext, useReducer } from "react"
import { FormattedMessage } from "react-intl";

import { ConstDeclaration, NodePosition, STKindChecker } from "@ballerina/syntax-tree"
import { Box, FormControl, FormHelperText, Typography } from "@material-ui/core";
import { v4 as uuid } from 'uuid';

import { ConstantIcon } from "../../../../../../assets/icons";
import { useDiagramContext } from "../../../../../../Contexts/Diagram";
import { STModification } from "../../../../../../Definitions";
import { createConstDeclaration, updateConstDeclaration } from "../../../../../utils/modification-util";
import { PrimaryButton } from "../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../Elements/Button/SecondaryButton";
import CheckBoxGroup from "../../Elements/CheckBox";
import { SelectDropdownWithButton } from "../../Elements/DropDown/SelectDropdownWithButton";
import ExpressionEditor from "../../Elements/ExpressionEditor";
import { FormTextInput } from "../../Elements/TextField/FormTextInput";
import { useStyles as useFormStyles } from "../style";

import { ConstantVarNameRegex, generateConfigFromModel, isFormConfigValid } from "./util";
import { ConstantConfigFormActionTypes, constantConfigFormReducer } from "./util/reducer";
import { VariableNameInput } from "../Components/VariableNameInput";

interface ConstantConfigFormProps {
    model?: ConstDeclaration;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
}

export function ConstantConfigForm(props: ConstantConfigFormProps) {
    const formClasses = useFormStyles();
    const { api: { code: { modifyDiagram } } } = useDiagramContext();
    const { model, targetPosition, onCancel, onSave } = props;
    const [config, dispatch] = useReducer(constantConfigFormReducer, generateConfigFromModel(model));

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

    const handleAccessModifierChange = () => {
        dispatch({ type: ConstantConfigFormActionTypes.TOGGLE_ACCESS_MODIFIER });
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
        const modifications: STModification[] = [];

        if (model) {
            modifications.push(updateConstDeclaration(config, model.position));
        } else {
            modifications.push(createConstDeclaration(config, targetPosition));
        }

        modifyDiagram(modifications);
        onSave();
    }

    const disableSaveBtn: boolean = !isFormConfigValid(config);

    let namePosition: NodePosition = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }

    if (model) {
        namePosition = model.variableName.position;
    } else {
        namePosition.startLine = targetPosition.startLine;
        namePosition.endLine = targetPosition.startLine;
    }

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
            <div className={formClasses.labelWrapper}>
                <FormHelperText className={formClasses.inputLabelForRequired}>
                    <FormattedMessage
                        id="lowcode.develop.configForms.ConstDecl.accessModifier"
                        defaultMessage="Access Modifier :"
                    />
                </FormHelperText>
            </div>
            <CheckBoxGroup
                values={["public"]}
                defaultValues={config.isPublic ? ["public"] : []}
                onChange={handleAccessModifierChange}
            />
            <VariableNameInput
                displayName={"Constant Name"}
                value={config.constantName}
                onValueChange={handleNameChange}
                validateExpression={updateExpressionValidity}
                position={namePosition}
                isEdit={!!model}
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
