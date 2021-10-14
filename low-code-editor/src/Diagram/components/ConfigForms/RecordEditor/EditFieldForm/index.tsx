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
import React, { useContext, useState } from 'react';

import { Box, FormControl, Typography } from "@material-ui/core";

import { Context, FormState } from "../../../../../Contexts/RecordEditor";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import CheckBoxGroup from "../../../Portals/ConfigForm/Elements/CheckBox";
import { SelectDropdownWithButton } from "../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { wizardStyles } from "../../style";
import { recordStyles } from "../style";
import { SimpleField } from "../types";

export function EditFieldForm() {

    const { state, callBacks } = useContext(Context);

    const overlayClasses = wizardStyles();
    const classes = useStyles();
    const recordClasses = recordStyles();

    const isFieldUpdate = state.currentForm === FormState.UPDATE_FIELD;
    let type = "";
    let fieldName = "";
    let nameValidity = false;
    let fieldOptianality = false;
    let typeOptianality = false;
    if (isFieldUpdate) {
        type = state.currentField.type;
        fieldName = state.currentField.name;
        nameValidity = true;
        fieldOptianality = state.currentField.isFieldOptional;
        typeOptianality = state.currentField.isFieldTypeOptional;
    }
    const [selectedType, setSelectedType] = useState(type);
    const [name, setName] = useState(fieldName);
    const [isValidName, setIsValidName] = useState(nameValidity);
    const [isFieldOptional, setIsFieldOptional] = useState(fieldOptianality);
    const [isTypeOptional, setIsTypeOptional] = useState(typeOptianality);

    const handleTypeSelect = (typeSelected: string) => {
        setSelectedType(typeSelected);
    };

    const handleRecordClose = () => {
        setSelectedType("");
    };

    const handleNameChange = (inputText: string) => {
        setName(inputText);
    };

    const validateNameValue = (value: string) => {
        // TODO: Add name validations for same record name in updating
        const isNameAlreadyExists = state.currentRecord.fields.find(field => (field.name === value));
        setIsValidName(!isNameAlreadyExists);
        return !isNameAlreadyExists;
    };

    const handleOptionalFieldChange = (text: string[]) => {
        if (text) {
            setIsFieldOptional(text.length > 0);
        }
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
                type: selectedType
            };
            state.currentRecord.fields.push(field);
            callBacks.onUpdateCurrentField(field);
        } else {
            state.currentField.name = name;
            state.currentField.isFieldOptional = isFieldOptional;
            state.currentField.isFieldTypeOptional = isTypeOptional
            state.currentField.type = selectedType;
        }
        callBacks.onUpdateModel(state.recordModel);
        callBacks.onChangeFormState(FormState.UPDATE_FIELD);
    }

    const isSaveButtonDisabled = !isValidName || (selectedType === "") || (name === "");

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
