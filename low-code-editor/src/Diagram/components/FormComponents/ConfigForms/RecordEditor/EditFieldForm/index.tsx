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
import {
    FormElementProps,
    FormField,
    FormHeaderSection,
    PrimaryButton
} from '@wso2-enterprise/ballerina-low-code-edtior-commons';

import { useRecordEditorContext } from '../../../../../../Contexts/RecordEditor';
import { keywords } from "../../../../Portals/utils/constants";
import CheckBoxGroup from '../../../FormFieldComponents/CheckBox';
import { LowCodeExpressionEditor } from "../../../FormFieldComponents/LowCodeExpressionEditor";
import { wizardStyles as useStyles } from "../../style";
import { recordStyles } from "../style";
import { genRecordName, getFieldNames } from "../utils";

export function EditFieldForm() {

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
    const defaultValText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.defaultVal.text",
        defaultMessage: "Default Value"
    });

    const [nameError, setNameError] = useState("");
    const [clearExpEditor, setClearExpEditor] = useState(false);
    const [defaultValue, setDefaultValue] = useState(state.currentField.value);

    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

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
        // if (state.currentField.name === "" || state.currentField.type === "") {
            // callBacks.updateEditorValidity(true);
        // } else {
        //     callBacks.updateEditorValidity(isInvalidFromField || state.currentField.isNameInvalid);
        // }
    };

    const handleOptionalFieldChange = (text: string[]) => {
        if (text) {
            state.currentField.isFieldOptional = (text.length > 0);
        }
        state.currentField.value = "";
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
    };
    const handleDefaultValueFocus = (value: string) => {
        if (!state.currentField.name) {
            state.currentField.name = genRecordName("fieldName", getFieldNames(state.currentRecord.fields));
            callBacks.onUpdateCurrentField(state.currentField);
        }
    };

    const defaultValueProps: FormElementProps = {
        model: formField,
        customProps: {
            validate: validateDefaultValue,
            statementType: formField.typeName,
            clearInput: clearExpEditor,
            revertClearInput,
            onFocus: handleDefaultValueFocus,
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
            <FormHeaderSection
                onCancel={state.onCancel}
                formTitle={"lowcode.develop.configForms.recordEditor.editField.addTitle"}
                defaultMessage={"Add Field"}
            />
            <div className={classes.formWrapper}>
                <CheckBoxGroup
                    testId="is-optional-field"
                    values={["Is field optional ?"]}
                    defaultValues={state.currentField?.isFieldOptional ? ["Is field optional ?"] : []}
                    onChange={handleOptionalFieldChange}
                />
                {!state.currentField?.isFieldOptional && (state.currentField?.type !== "record") && (
                    <div>
                        <div className={classes.sectionSeparator} />
                        <LowCodeExpressionEditor {...defaultValueProps} />
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
            </div>
        </FormControl>

    );
}
