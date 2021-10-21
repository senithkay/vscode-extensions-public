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
import React, { useState } from 'react';

import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import CheckBoxGroup from "../../../Portals/ConfigForm/Elements/CheckBox";
import { SelectDropdownWithButton } from "../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { wizardStyles } from "../../style";
import { Record } from "../Record";
import { recordStyles } from "../style";
import { Field, SimpleField } from "../types";

export interface FieldEditorProps {
    addedFields: Field[];
    onSaveFiled: (field: SimpleField) => void;
    onCancel: () => void;
}

export function FieldEditor(props: FieldEditorProps) {
    const { addedFields, onSaveFiled, onCancel } = props;
    const overlayClasses = wizardStyles();
    const classes = useStyles();
    const recordClasses = recordStyles();

    const [selectedType, setSelectedType] = useState("");
    const [name, setName] = useState("");
    const [isValidName, setIsValidName] = useState(false);
    const [isFieldOptional, setIsFieldOptional] = useState(false);
    const [isTypeOptional, setIsTypeOptional] = useState(false);

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
        const isNameAlreadyExists = addedFields.find(field => (field.name === value));
        setIsValidName(!isNameAlreadyExists);
        return !isNameAlreadyExists;
    };

    const handleOptionalFieldChange = (text: string[]) => {
        if (text) {
            setIsFieldOptional(text.length > 1);
        }
    };

    const handleOptionalTypeChange = (text: string[]) => {
        if (text) {
            setIsTypeOptional(text.length > 1);
        }
    };

    const handleRecordAdd = () => {
        const field: SimpleField = {
            name,
            isFieldOptional,
            isFieldTypeOptional: isTypeOptional,
            type: selectedType
        };
        onSaveFiled(field);
        onCancel();
    }

    return (
        <div className={recordClasses.fieldEditorWrapper}>
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
                        values: ["int", "string", "record"],
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

            {/*{(selectedType === "record") && (*/}
            {/*    <Record onSave={null} onCancel={handleRecordClose} recordModel={null} />*/}
            {/*)}*/}
            <div className={overlayClasses.buttonWrapper}>
                <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                <PrimaryButton
                    dataTestId={"record-from-json-save-btn"}
                    text={"Add"}
                    // disabled={isMutationInProgress || !isFormValid}
                    fullWidth={false}
                    onClick={handleRecordAdd}
                />
            </div>
        </div>
    );
}
