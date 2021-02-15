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

import {
    AnydataTypeDesc,
    ArrayTypeDesc,
    AssignmentStatement,
    ListConstructor,
    LocalVarDecl
} from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";

import { balTypes, FormField, WizardType } from "../../../../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { getAllVariables } from "../../../../../../../utils/mixins";
import { genVariableName, getParams } from "../../../../../utils";
import { PrimaryButton } from "../../../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../Elements/DropDown/SelectDropdownWithButton";
import ExpressionEditor from "../../../../Elements/ExpressionEditor";
import { FormTextInput } from "../../../../Elements/TextField/FormTextInput";
import { ProcessConfig } from "../../../../types";
import { useStyles } from "../../../style";

import { PropertyIcon } from "../../../../../../../../assets/icons"

interface AddVariableProps {
    config: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
}

export const DEFINE_VALUE: string = "Define Value";
export const DEFINE_EXPRESSION: string = "Define Expression";

export function AddVariableForm(props: AddVariableProps) {
    const { state: { isMutationProgress: isMutationInProgress, stSymbolInfo } } = useContext(DiagramContext);

    const classes = useStyles();
    const { config, onCancel, onSave } = props;

    const existingProperty = config && config.wizardType === WizardType.EXISTING;

    // let propertyType: string = '';
    let isArrayType: boolean = false;
    let typeSelected: string = 'var';
    let arrayFieldModel: FormField;
    let initArrayValue: string = "[]";
    let initPropertyName: string = '';
    let initSinglePropertyVal: string = '';
    let initExpressionValue: string = '';
    let initEnableExpression: boolean = true;

    if (existingProperty) {
        if (config.model.kind === 'LocalVarDecl') {
            const localVarDec: LocalVarDecl = config.model as LocalVarDecl;
            const fields: FormField[] = [];
            const expressionRegex = /(.*?Expression$)+/g;

            if (localVarDec.initializer.kind === 'ListConstructor') {
                isArrayType = true;
                const arrayTypeDesc: ArrayTypeDesc = localVarDec.typedBindingPattern.typeDescriptor as ArrayTypeDesc;
                const memberTypeDesc: AnydataTypeDesc = arrayTypeDesc.memberTypeDesc as AnydataTypeDesc;
                typeSelected = memberTypeDesc.name.value;
                initArrayValue = localVarDec.initializer.source;
                const listConstructor: ListConstructor = localVarDec.initializer as ListConstructor;
                listConstructor.expressions.filter((el: any) => el.kind !== 'CommaToken').forEach((el: any) => {
                    fields.push({
                        collectionDataType: typeSelected as balTypes,
                        isParam: true,
                        name: typeSelected + ' Array',
                        type: typeSelected as balTypes,
                        value: el.source
                    })
                });
            } else if (expressionRegex.test(localVarDec.initializer.kind) || localVarDec.initializer.kind === 'MethodCall') {
                initEnableExpression = false;
                initExpressionValue = localVarDec.initializer.source;
            } else {
                initSinglePropertyVal = localVarDec.initializer.source;
                typeSelected = (localVarDec.typedBindingPattern.typeDescriptor as AnydataTypeDesc).name.value;
            }
            initPropertyName = localVarDec.typedBindingPattern.bindingPattern.source.trim();
            arrayFieldModel = {
                type: "collection",
                name: typeSelected + " Array",
                isParam: true,
                collectionDataType: typeSelected as balTypes,
                fields,
                value: undefined
            };
        } else if (config.model.kind === 'AssignmentStatement') {
            const assignmentStmtModel: AssignmentStatement = config.model as AssignmentStatement;
            // todo : think of someway to handle assignment statements
        }
    }


    const [selectedType, setSelectedType] = useState(typeSelected);
    const [isDropDownOpen, setDropDownOpen] = useState(false)
    // const [defineValue, setDefineValue] = useState(initEnableExpression);
    // const [arraySelected, setArraySelected] = useState(isArrayType);


    const genPropertyName: string = existingProperty ? initPropertyName
        : stSymbolInfo ? genVariableName("variable", getAllVariables(stSymbolInfo)) : "";

    const [varName, setVarName] = useState(genPropertyName);
    const [expressionValue, setExpressionValue] = useState(initExpressionValue);
    const [validConfigProperty, setValidConfigProperty] = useState(false);
    const [configProperty, setConfigProperty] = useState("");
    const [validExpresssionValue, setValidExpresssionValue] = useState(false);
    const [fieldModel, setFieldModel] = useState(arrayFieldModel);

    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

    const onPropertyChange = (property: string) => {
        setValidConfigProperty(false);
        setValidExpresssionValue(false);
        // setSelectedType('');
        config.config = property;
        setExpressionValue(property);
    };

    const handleNameOnChange = (name: string) => {
        setVarName(name);
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setExpressionValue("");
        setValidExpresssionValue(false);
        setValidConfigProperty(false);
        const field: FormField = {
            type: type as balTypes,
            name: type + " Value",
            isParam: true
        };
        setFieldModel(field);
    };

    const validateNameValue = (value: string) => {
        if (value && value !== '') {
            return nameRegex.test(value);
        }
        return true;
    };

    const validateExpression = (fieldName: string, isInvalid: boolean) => {
        setValidExpresssionValue(!isInvalid);
    };

    const handleSave = () => {
        if (config.config !== '') {
            config.config = selectedType + " " + varName + " = " + expressionValue + ";";
            onSave();
        } else if (validConfigProperty) {
            const value: string = (
                (selectedType === 'boolean') && (configProperty === '')
            ) ? "true" : getParams([fieldModel]).toString();
            config.config = selectedType + " " + varName + "=" + value + ";";
            onSave();
        } else if (validConfigProperty) {
            const value: string = (selectedType === 'xml') ? "true" : getParams([fieldModel]).toString();
            config.config = selectedType + " " + varName + "=" + value + ";";
            onSave();
        }
    };

    const handleOnOpen = () => {
        setDropDownOpen(true);
    }

    const handleOnClose = () => {
        setDropDownOpen(false);
    }

    const validForm: boolean = (nameRegex.test(varName) && (validExpresssionValue || validConfigProperty));

    // todo: Support other data types
    const variableTypes: string[] = ["var", "int", "float", "boolean", "string", "json", "xml"];

    return (
        <FormControl data-testid="property-form" className={classes.wizardFormControl}>
            <div className={classes.formTitleWrapper}>
                <div className={classes.mainTitleWrapper}>
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2}>Variable</Box>
                    </Typography>
                    <PropertyIcon />
                </div>
            </div>
            <div className={classes.formWrapper}>

                <div className={classes.activeWrapper}>
                    <SelectDropdownWithButton
                        defaultValue={selectedType}
                        customProps={{
                            disableCreateNew: true,
                            values: variableTypes,
                            onOpenSelect: handleOnOpen,
                            onCloseSelect: handleOnClose,
                        }}
                        label={"Select type"}
                        onChange={handleTypeChange}
                    />
                    <FormTextInput
                        customProps={{
                            validate: validateNameValue
                        }}
                        defaultValue={genPropertyName}
                        onChange={handleNameOnChange}
                        label={"Variable Name"}
                        errorMessage={"Invalid Variable Name"}
                        placeholder={"Enter Variable Name"}
                    />
                    <div>
                        {!isDropDownOpen && (
                            <ExpressionEditor
                                model={{ name: selectedType + " expression", type: selectedType as balTypes }}
                                customProps={{ validate: validateExpression }}
                                onChange={onPropertyChange}
                            />
                        )}

                    </div>
                </div>

                <div className={classes.wizardBtnHolder}>
                    <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                    <PrimaryButton
                        text="Save"
                        disabled={isMutationInProgress || !validForm}
                        fullWidth={false}
                        onClick={handleSave}
                    />
                </div>
                <div className={classes.formCreate} />
            </div>
        </FormControl>
    );
}
