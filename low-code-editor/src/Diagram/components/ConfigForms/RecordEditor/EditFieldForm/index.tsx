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
import { useIntl } from "react-intl";

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
import { keywords } from "../../../Portals/utils/constants";
import { recordStyles } from "../style";
import { SimpleField } from "../types";

export function EditFieldForm() {

    const { state, callBacks } = useRecordEditorContext();

    const classes = useStyles();
    const recordClasses = recordStyles();
    const intl = useIntl();

    const titleAdd = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.editField.addTitle",
        defaultMessage: "Add Field"
    });
    const titleUpdate = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.editField.updateTitle",
        defaultMessage: "Update Field"
    });
    const addButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.addButton.text",
        defaultMessage: "Add"
    });
    const updateButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.updateButton.text",
        defaultMessage: "Update"
    });
    const fieldNameText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.fieldName.text",
        defaultMessage: "Field name"
    });
    const typeLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.type.label",
        defaultMessage: "Type"
    });
    const typePlaceholder = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.type.placeholder",
        defaultMessage: "Select Type"
    });
    const defaultValText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.defaultVal.text",
        defaultMessage: "Default Value"
    });

    const isFieldUpdate = state.currentForm === FormState.UPDATE_FIELD;
    let type = "int";
    let fieldName = "";
    const varNameError = "";
    let defaultValValidity = true;
    let fieldOptianality = false;
    let typeOptianality = false;
    let isArrayDefaultVal = false;
    let defaultVal = "";
    if (isFieldUpdate) {
        type = state.currentField.type;
        fieldName = state.currentField.name;
        defaultValValidity = true;
        fieldOptianality = state.currentField.isFieldOptional;
        typeOptianality = state.currentField.isFieldTypeOptional;
        defaultVal = state.currentField.value;
        isArrayDefaultVal = state.currentField.isArray;
    }
    const [selectedType, setSelectedType] = useState(type);
    const [name, setName] = useState(fieldName);
    const [nameError, setNameError] = useState(varNameError);
    const [isFieldOptional, setIsFieldOptional] = useState(fieldOptianality);
    const [isTypeOptional, setIsTypeOptional] = useState(typeOptianality);
    const [isArray, setIsArray] = useState(isArrayDefaultVal);
    const [defaultValue, setDefaultValue] = useState(defaultVal);
    const [validDefaultValue, setValidDefaultValue] = useState(defaultValValidity);

    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

    const variableTypes: string[] = ["int", "float", "decimal", "boolean", "string", "json", "xml", "error", "any",
        "anydata"];

    const handleTypeSelect = (typeSelected: string) => {
        setSelectedType(typeSelected);
        setDefaultValue("");
    };

    const handleNameChange = (inputText: string) => {
        setName(inputText);
        const isNameAlreadyExists = state.currentRecord.fields.find(field => (field.name === inputText)) &&
            !(state.currentField?.name === inputText);
        if (isNameAlreadyExists) {
            setNameError("Variable name already exists");
        } else if (keywords.includes(inputText)) {
            setNameError("Keywords are not allowed");
        } else if ((inputText !== "") && !nameRegex.test(inputText)) {
            setNameError("Enter a valid name");
        } else {
            setNameError("");
        }
    };

    const handleDefaultValueChange = (inputText: string) => {
        setDefaultValue(inputText);
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

    const handleArrayChange = (text: string[]) => {
        if (text) {
            setIsArray(text.length > 0);
        }
    };

    const handleFieldAdd = () => {
        if (!isFieldUpdate) {
            // Avoiding field add in field updates
            const field: SimpleField = {
                name,
                isFieldOptional,
                isArray,
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
            state.currentField.isArray = isArray;
        }
        callBacks.onUpdateModel(state.recordModel);
        callBacks.onChangeFormState(FormState.UPDATE_FIELD);
    }

    const resetFields = () => {
        setSelectedType("int");
        setName("");
        setIsFieldOptional(false);
        setNameError("");
        setIsTypeOptional(false);
        setValidDefaultValue(true);
        setIsArray(false);
    };

    const updateFields = () => {
        setSelectedType(state.currentField.type);
        setName(state.currentField.name);
        setIsFieldOptional(state.currentField.isFieldOptional);
        setNameError("");
        setIsTypeOptional(state.currentField.isFieldTypeOptional);
        setIsArray(state.currentField.isArray);
    };

    const formField: FormField = {
        name: "defaultValue",
        optional: true,
        displayName: defaultValText,
        typeName: selectedType,
        value: defaultValue
    }
    const defaultValueProps: FormElementProps = {
        model: formField,
        customProps: {
            validate: validateDefaultValue,
            statementType: formField.typeName
        },
        onChange: handleDefaultValueChange,
        defaultValue
    };

    const isAddButtonDisabled = (nameError !== "") || (selectedType === "") || (name === "") ||
        (!isFieldOptional && !validDefaultValue);

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
                    <Box paddingTop={2} paddingBottom={2}>{isFieldUpdate ? titleUpdate : titleAdd}</Box>
                </Typography>
            </div>
            <FormTextInput
                dataTestId="field-name"
                customProps={{
                    clearInput: (name === ""),
                    isErrored: (nameError !== "")
                }}
                defaultValue={name}
                onChange={handleNameChange}
                label={fieldNameText}
                errorMessage={nameError}
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
                        values: variableTypes,
                        disableCreateNew: true
                    }
                }
                label={typeLabel}
                placeholder={typePlaceholder}
                onChange={handleTypeSelect}
            />
            <CheckBoxGroup
                testId="is-optional-field"
                values={["Is optional ?"]}
                defaultValues={isTypeOptional ? ["Is optional ?"] : []}
                onChange={handleOptionalTypeChange}
            />
            <CheckBoxGroup
                testId="is-array"
                values={["Is Array ?"]}
                defaultValues={isArray ? ["Is Array ?"] : []}
                onChange={handleArrayChange}
            />
            {!isFieldOptional && (
                <ExpressionEditor {...defaultValueProps} />
            )}

            <div className={recordClasses.fieldAddButtonWrapper}>
                <PrimaryButton
                    dataTestId={"record-add-btn"}
                    text={isFieldUpdate ? updateButtonText : addButtonText}
                    disabled={isAddButtonDisabled}
                    fullWidth={false}
                    onClick={handleFieldAdd}
                />
            </div>
        </FormControl>

    );
}
