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
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useState } from 'react';

import { Box, FormControl, Typography } from "@material-ui/core";

import { FormField } from "../../../../../ConfigurationSpec/types";
import { FormState, useRecordEditorContext } from "../../../../../Contexts/RecordEditor";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import CheckBoxGroup from "../../../Portals/ConfigForm/Elements/CheckBox";
import { SelectDropdownWithButton } from "../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import ExpressionEditor from "../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { FormElementProps } from "../../../Portals/ConfigForm/types";
import { wizardStyles } from "../../style";
import { SimpleField } from "../types";

export function EditFieldForm() {

    const { state, callBacks } = useRecordEditorContext();

    const overlayClasses = wizardStyles();
    const classes = useStyles();

    const isFieldUpdate = state.currentForm === FormState.UPDATE_FIELD;
    let type = "int";
    let fieldName = "";
    let nameValidity = false;
    let defaultValValidity = true;
    let fieldOptianality = false;
    let typeOptianality = false;
    let defaultVal = "";
    if (isFieldUpdate) {
        type = state.currentField.type;
        fieldName = state.currentField.name;
        nameValidity = true;
        defaultValValidity = true;
        fieldOptianality = state.currentField.isFieldOptional;
        typeOptianality = state.currentField.isFieldTypeOptional;
        defaultVal = state.currentField.value;
    }
    const [selectedType, setSelectedType] = useState(type);
    const [name, setName] = useState(fieldName);
    const [isValidName, setIsValidName] = useState(nameValidity);
    const [isFieldOptional, setIsFieldOptional] = useState(fieldOptianality);
    const [isTypeOptional, setIsTypeOptional] = useState(typeOptianality);
    const [defaultValue, setDefaultValue] = useState(defaultVal);
    const [validDefaultValue, setValidDefaultValue] = useState(defaultValValidity);
    // const [editorFocus, setEditorFocus] = useState(false);

    const handleTypeSelect = (typeSelected: string) => {
        setSelectedType(typeSelected);
        setDefaultValue("");
        // setEditorFocus(true);
    };

    const handleNameChange = (inputText: string) => {
        setName(inputText);
    };

    const handleDefaultValueChange = (inputText: string) => {
        setDefaultValue(inputText);
    };

    const validateNameValue = (value: string) => {
        // TODO: Add name validations for same record name in updating
        const isNameAlreadyExists = state.currentRecord.fields.find(field => (field.name === value)) &&
            !(state.currentField?.name === value);
        setIsValidName(!isNameAlreadyExists);
        return !isNameAlreadyExists;
    };

    const validateDefaultValue = (fName: string, isInvalidFromField: boolean) => {
        setValidDefaultValue(!isInvalidFromField);
    }

    const handleOptionalFieldChange = (text: string[]) => {
        if (text) {
            setIsFieldOptional(text.length > 0);
        }
        setDefaultValue("");
    };

    const handleOptionalTypeChange = (text: string[]) => {
        if (text) {
            setIsTypeOptional(text.length > 0);
        }
    };

    const handleFieldAdd = () => {
        if (!isFieldUpdate) {
            // Avoiding field add in field updates
            const field: SimpleField = {
                name,
                isFieldOptional,
                isFieldTypeOptional: isTypeOptional,
                type: selectedType,
                isActive: true,
                value: defaultValue
            };
            state.currentRecord.fields.push(field);
            callBacks.onUpdateCurrentField(field);
        } else {
            state.currentField.name = name;
            state.currentField.isFieldOptional = isFieldOptional;
            state.currentField.isFieldTypeOptional = isTypeOptional
            state.currentField.type = selectedType;
            state.currentField.isActive = true;
            state.currentField.value = defaultValue;
        }
        callBacks.onUpdateModel(state.recordModel);
        callBacks.onChangeFormState(FormState.UPDATE_FIELD);
    }

    const resetFields = () => {
        setSelectedType("int");
        setName("");
        setIsFieldOptional(false);
        setIsValidName(false);
        setIsTypeOptional(false);
        setValidDefaultValue(true);
    };

    const updateFields = () => {
        setSelectedType(state.currentField.type);
        setName(state.currentField.name);
        setIsFieldOptional(state.currentField.isFieldOptional);
        setIsValidName(true);
        setIsTypeOptional(state.currentField.isFieldTypeOptional);
    };

    // const revertEditorFocus = () => {
    //     setEditorFocus(false);
    // };
    //
    // const focusEditor = () => {
    //     setEditorFocus(true);
    // };

    const formField: FormField = {
        name: "defaultValue",
        optional: true,
        displayName: "Default Value",
        typeName: selectedType,
        value: defaultValue
    }
    const defaultValueProps: FormElementProps = {
        model: formField,
        customProps: {
            validate: validateDefaultValue,
            // tooltipTitle: whileStatementTooltipMessages.title,
            // tooltipActionText: whileStatementTooltipMessages.actionText,
            // tooltipActionLink: whileStatementTooltipMessages.actionLink,
            // interactive: true,
            statementType: formField.typeName,
            // focus: editorFocus,
            // revertFocus: revertEditorFocus,
        },
        onChange: handleDefaultValueChange,
        defaultValue
    };

    const isSaveButtonDisabled = !isValidName || (selectedType === "") || (name === "") || (!isFieldOptional && !validDefaultValue);

    useEffect(() => {
        // Checks whether add from is completed and reset field addition
        if (state.currentForm === FormState.ADD_FIELD) {
            resetFields();
        }
    }, [state.currentForm]);

    useEffect(() => {
        if (state?.currentField) {
            updateFields();
        }
    }, [state.currentRecord, state?.currentField]);

    return (
        <FormControl data-testid="record-form" className={classes.wizardFormControl}>
            <div className={classes.formTitleWrapper}>
                <Typography variant="h4">
                    <Box paddingTop={2} paddingBottom={2}>{isFieldUpdate ? "Update Field" : "Add Field"}</Box>
                </Typography>
            </div>
            <FormTextInput
                dataTestId="field-name"
                customProps={{
                    validate: validateNameValue,
                    clearInput: (name === "")
                }}
                defaultValue={name}
                onChange={handleNameChange}
                label={"Field name"}
                errorMessage={!isValidName ? "Variable name already exists" : null}
                placeholder={"Enter field name"}
            />
            <CheckBoxGroup
                testId="is-optional-field"
                values={["Is optional ?"]}
                defaultValues={isFieldOptional ? ["Is optional ?"] : []}
                onChange={handleOptionalFieldChange}
            />
            <SelectDropdownWithButton
                dataTestId="field-type"
                defaultValue={selectedType}
                customProps={
                    {
                        values: ["int", "string"],
                        disableCreateNew: true
                    }
                }
                label="Type"
                placeholder="Select Type"
                onChange={handleTypeSelect}
            />
            <CheckBoxGroup
                testId="is-optional-field"
                values={["Is optional ?"]}
                defaultValues={isTypeOptional ? ["Is optional ?"] : []}
                onChange={handleOptionalTypeChange}
            />
            {!isFieldOptional && (
                <ExpressionEditor {...defaultValueProps} />
            )}

            <div className={overlayClasses.buttonWrapper}>
                <PrimaryButton
                    dataTestId={"record-from-json-save-btn"}
                    text={isFieldUpdate ? "Update" : "Add"}
                    disabled={isSaveButtonDisabled}
                    fullWidth={false}
                    onClick={handleFieldAdd}
                />
            </div>
        </FormControl>

    );
}
