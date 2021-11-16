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
import React, {useEffect, useState} from 'react';
import { useIntl } from "react-intl";

import { RecordTypeDesc } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";

import { FormField } from '../../../../../../ConfigurationSpec/types';
import { useDiagramContext } from '../../../../../../Contexts/Diagram';
import { useRecordEditorContext } from '../../../../../../Contexts/RecordEditor';
import { keywords } from "../../../../Portals/utils/constants";
import { PrimaryButton } from '../../../FormFieldComponents/Button/PrimaryButton';
import CheckBoxGroup from '../../../FormFieldComponents/CheckBox';
import { SelectDropdownWithButton } from '../../../FormFieldComponents/DropDown/SelectDropdownWithButton';
import ExpressionEditor from '../../../FormFieldComponents/ExpressionEditor';
import { FormTextInput } from '../../../FormFieldComponents/TextField/FormTextInput';
import { FormElementProps } from "../../../Types";
import { variableTypes } from '../../ProcessConfigForms/ProcessForm/AddVariableConfig';
import { wizardStyles as useStyles } from "../../style";
import { recordStyles } from "../style";

export function EditFieldForm() {

    const { props: { stSymbolInfo } } = useDiagramContext();
    const { state, callBacks } = useRecordEditorContext();

    const classes = useStyles();
    const recordClasses = recordStyles();
    const intl = useIntl();

    const editFieldiTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.editField.editTitle",
        defaultMessage: "Edit Field"
    });
    const jsonGenText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.jsonButton.text",
        defaultMessage: "Import JSON"
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

    const [nameError, setNameError] = useState("");
    const [clearExpEditor, setClearExpEditor] = useState(false);
    const [defaultValue, setDefaultValue] = useState(state.currentField.value);

    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

    const allVariableTypes: string[] = variableTypes.slice();
    allVariableTypes.push("record");
    stSymbolInfo.recordTypeDescriptions.forEach((value: RecordTypeDesc) => {
        allVariableTypes.push(value?.typeData?.typeSymbol?.name);
    })

    const handleTypeSelect = (typeSelected: string) => {
        state.currentField.type = typeSelected;
        setClearExpEditor(true);
        callBacks.onUpdateCurrentField(state.currentField);
    };

    const handleNameChange = (inputText: string) => {
        state.currentField.name = inputText;
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
        callBacks.onUpdateCurrentField(state.currentField);
    };

    const handleDefaultValueChange = (inputText: string) => {
        setDefaultValue(inputText);
    };

    const validateDefaultValue = (fName: string, isInvalidFromField: boolean) => {
        state.currentField.isValueInvalid = isInvalidFromField;
        callBacks.onUpdateCurrentField(state.currentField);
        callBacks.updateEditorValidity(isInvalidFromField || state.currentField.isNameInvalid);
    }

    const handleOptionalFieldChange = (text: string[]) => {
        if (text) {
            state.currentField.isFieldOptional = (text.length > 0);
        }
        state.currentField.value = "";
        callBacks.onUpdateCurrentField(state.currentField);
    };

    const handleOptionalTypeChange = (text: string[]) => {
        if (text) {
            state.currentField.isFieldTypeOptional = (text.length > 0);
        }
        callBacks.onUpdateCurrentField(state.currentField);
    };

    const handleArrayChange = (text: string[]) => {
        if (text) {
            state.currentField.isArray = (text.length > 0);
        }
        callBacks.onUpdateCurrentField(state.currentField);
    };

    const revertClearInput = () => {
        setClearExpEditor(false);
    };

    const formField: FormField = {
        name: "defaultValue",
        optional: true,
        displayName: defaultValText,
        typeName: state.currentField?.isArray ? `${state.currentField?.type}[]` : state.currentField?.type,
        value: defaultValue
    }
    const defaultValueProps: FormElementProps = {
        model: formField,
        customProps: {
            validate: validateDefaultValue,
            statementType: formField.typeName,
            clearInput: clearExpEditor,
            revertClearInput
        },
        onChange: handleDefaultValueChange,
        defaultValue
    };

    useEffect(() => {
        state.currentField.value = defaultValue;
        callBacks.updateCurrentField(state.currentField);
    }, [defaultValue]);

    useEffect(() => {
        setClearExpEditor(state.currentField.value === "" || state.currentField.value === undefined);
    }, [state.currentField.value]);

    return (
        <FormControl data-testid="record-form" className={classes.wizardFormControl}>
            <div className={classes.formTitleWrapper}>
                <Typography variant="h4">
                    <Box paddingTop={2} paddingBottom={2}>{editFieldiTitle}</Box>
                </Typography>
            </div>
            <SelectDropdownWithButton
                dataTestId="field-type"
                defaultValue={state.currentField?.type}
                customProps={
                    {
                        values: allVariableTypes,
                        disableCreateNew: true
                    }
                }
                label={typeLabel}
                placeholder={typePlaceholder}
                onChange={handleTypeSelect}
            />
            <CheckBoxGroup
                testId="is-optional-type"
                values={["Is optional ?"]}
                defaultValues={state.currentField?.isFieldTypeOptional ? ["Is optional ?"] : []}
                onChange={handleOptionalTypeChange}
            />
            <CheckBoxGroup
                testId="is-array"
                values={["Is Array ?"]}
                defaultValues={state.currentField?.isArray ? ["Is Array ?"] : []}
                onChange={handleArrayChange}
            />
            <div className={classes.sectionSeparator} />
            <FormTextInput
                dataTestId="field-name"
                customProps={{
                    clearInput: (state.currentField?.name === ""),
                    isErrored: (nameError !== "")
                }}
                defaultValue={state.currentField?.name}
                onChange={handleNameChange}
                label={fieldNameText}
                errorMessage={nameError}
                placeholder={"Enter field name"}
            />
            <CheckBoxGroup
                testId="is-optional-field"
                values={["Is optional ?"]}
                defaultValues={state.currentField?.isFieldOptional ? ["Is optional ?"] : []}
                onChange={handleOptionalFieldChange}
            />
            {!state.currentField?.isFieldOptional && (state.currentField?.type !== "record") &&
            (variableTypes.includes(state.currentField?.type)) && (
                <div>
                    <div className={classes.sectionSeparator} />
                    <ExpressionEditor {...defaultValueProps} />
                </div>
            )}

            <div className={recordClasses.fieldAddButtonWrapper}>
                {(state.currentField?.type === "record") && (
                    <div className={recordClasses.jsonButtonWrapper}>
                        <PrimaryButton
                            dataTestId={"import-json"}
                            text={jsonGenText}
                            disabled={false}
                            fullWidth={false}
                            onClick={null}
                        />
                    </div>
                )}
            </div>
        </FormControl>

    );
}
