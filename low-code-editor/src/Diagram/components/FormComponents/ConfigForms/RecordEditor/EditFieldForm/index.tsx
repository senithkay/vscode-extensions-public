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

import { RecordTypeDesc } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";

import { FormField } from '../../../../../../ConfigurationSpec/types';
import { useDiagramContext } from '../../../../../../Contexts/Diagram';
import { FormState, useRecordEditorContext } from '../../../../../../Contexts/RecordEditor';
import { keywords } from "../../../../Portals/utils/constants";
import { FormHeaderSection } from '../../../Commons/FormHeaderSection';
import { VariableTypeInput, VariableTypeInputProps } from "../../../ConfigForms/Components/VariableTypeInput";
import { PrimaryButton } from '../../../FormFieldComponents/Button/PrimaryButton';
import CheckBoxGroup from '../../../FormFieldComponents/CheckBox';
import { SelectDropdownWithButton } from '../../../FormFieldComponents/DropDown/SelectDropdownWithButton';
import ExpressionEditor from '../../../FormFieldComponents/ExpressionEditor';
import { FormTextInput } from '../../../FormFieldComponents/TextField/FormTextInput';
import { FormElementProps } from "../../../Types";
import { variableTypes } from '../../ProcessConfigForms/ProcessForm/AddVariableConfig';
import { wizardStyles as useStyles } from "../../style";
import { recordStyles } from "../style";
import { RecordModel, SimpleField } from "../types";

export function EditFieldForm() {

    const { props: { stSymbolInfo } } = useDiagramContext();
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
    const jsonGenText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.jsonButton.text",
        defaultMessage: "Import JSON"
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
    const type = isFieldUpdate ? state.currentField.type : "int";
    const fieldName = isFieldUpdate ? state.currentField.name : "";
    const fieldOptianality = isFieldUpdate ? state.currentField.isFieldOptional : false;
    const defaultVal = isFieldUpdate ? state.currentField.value : "";

    const [selectedType, setSelectedType] = useState(type);
    const [name, setName] = useState(fieldName);
    const [nameError, setNameError] = useState("");
    const [isFieldOptional, setIsFieldOptional] = useState(fieldOptianality);
    const [defaultValue, setDefaultValue] = useState(defaultVal);
    const [validDefaultValue, setValidDefaultValue] = useState(true);
    const [validType, setValidType] = useState(true);
    const [clearExpEditor, setClearExpEditor] = useState(false);

    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");


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

    const validateTypeName = (fName: string, isInvalidFromField: boolean) => {
        setValidType(!isInvalidFromField);
    }

    const handleOptionalFieldChange = (text: string[]) => {
        if (text) {
            setIsFieldOptional(text.length > 0);
        }
        setDefaultValue("");
    };

    const handleFieldAdd = () => {
        if (!isFieldUpdate) {
            if (state.currentField) {
                state.currentField.isActive = false;
            }
            state.currentField = undefined;
            if (selectedType === "record") {
                if (state.currentRecord?.isActive) {
                    state.currentRecord.isActive = false;
                }
                const recordModel: RecordModel = {
                    name,
                    isOptional: isFieldOptional,
                    isActive: true,
                    type: selectedType,
                    isTypeDefinition: false,
                    isInline: true,
                    fields: []
                };
                state.currentRecord.fields.push(recordModel);
                state.currentRecord = recordModel;
                callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
            } else {
                // Avoiding field add in field updates
                const field: SimpleField = {
                    name,
                    isFieldOptional,
                    type: selectedType,
                    isActive: true,
                    value: defaultValue
                };
                state.currentRecord.fields.push(field);
                callBacks.onUpdateCurrentField(field);
                callBacks.onChangeFormState(FormState.UPDATE_FIELD);
            }
        } else {
            // Avoiding field add in field updates
            if (selectedType === "record") {
                const foundIndex = state.currentRecord.fields.indexOf(state.currentField);
                state.currentRecord.isActive = false;
                state.currentRecord.fields[foundIndex] = {
                    name,
                    isOptional: isFieldOptional,
                    isActive: true,
                    type: selectedType,
                    isTypeDefinition: false,
                    isInline: true,
                    fields: []
                };
                callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
            } else {
                // Updating a simple field
                const curField: SimpleField = {
                    name,
                    isFieldOptional,
                    type: selectedType,
                    value: defaultValue,
                    isActive: true
                };
                callBacks.updateCurrentField(curField);
                callBacks.onChangeFormState(FormState.UPDATE_FIELD);
            }
        }
        callBacks.onUpdateModel(state.recordModel);
    };

    const revertClearInput = () => {
        setClearExpEditor(false);
    };

    const resetFields = () => {
        setSelectedType("int");
        setName("");
        setIsFieldOptional(false);
        setNameError("");
        setValidDefaultValue(true);
        setDefaultValue("");
        setClearExpEditor(true);
    };

    const updateFields = () => {
        setSelectedType(state.currentField.type);
        setName(state.currentField.name);
        setIsFieldOptional(state.currentField.isFieldOptional);
        setNameError("");
        setDefaultValue(state.currentField.value);
    };

    const formField: FormField = {
        name: "defaultValue",
        optional: true,
        displayName: defaultValText,
        typeName: selectedType,
        value: defaultValue || ""
    }
    const defaultValueProps: FormElementProps = {
        model: formField,
        customProps: {
            validate: validateDefaultValue,
            statementType: selectedType,
            editPosition: state.sourceModel?.position || state.targetPosition,
            clearInput: clearExpEditor,
            revertClearInput
        },
        onChange: handleDefaultValueChange,
        defaultValue
    };

    const varTypeProps: VariableTypeInputProps = {
        displayName: typeLabel,
        value: selectedType,
        onValueChange: setSelectedType,
        validateExpression: validateTypeName,
        position: state.sourceModel?.position || state.targetPosition,
        overrideTemplate: {
            defaultCodeSnippet: `type tempRecordName record {  ${selectedType === 'record' ? '{}' : ''} varType; };`,
            targetColumn: 30
        },
    };

    const isAddButtonDisabled = (nameError !== "") || (selectedType === "") || (name === "") ||
        (!isFieldOptional && !validDefaultValue) || !validType;

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
            <FormHeaderSection
                onCancel={state.onCancel}
                formTitle={"lowcode.develop.configForms.recordEditor.editField.addTitle"}
                defaultMessage={"Add Field"}
            />
            <div className={classes.formWrapper}>
                <VariableTypeInput {...varTypeProps} key={`${name}-typeSelector`} />
                <div className={classes.sectionSeparator} />
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
                {!isFieldOptional && (selectedType !== "record") && (
                    <div>
                        <div className={classes.sectionSeparator} />
                        <ExpressionEditor {...defaultValueProps} key={`${state.currentField?.name}-${selectedType}`} />
                    </div>
                )}

                <div className={recordClasses.fieldAddButtonWrapper}>
                    {(!isFieldUpdate && (selectedType === "record")) && (
                        <div className={recordClasses.jsonButtonWrapper}>
                            <PrimaryButton
                                dataTestId={"import-json"}
                                text={jsonGenText}
                                disabled={isAddButtonDisabled}
                                fullWidth={false}
                                onClick={null}
                            />
                        </div>
                    )}
                    <PrimaryButton
                        dataTestId={"record-add-btn"}
                        text={isFieldUpdate ? updateButtonText : addButtonText}
                        disabled={isAddButtonDisabled}
                        fullWidth={false}
                        onClick={handleFieldAdd}
                    />
                </div>
            </div>
        </FormControl>

    );
}
