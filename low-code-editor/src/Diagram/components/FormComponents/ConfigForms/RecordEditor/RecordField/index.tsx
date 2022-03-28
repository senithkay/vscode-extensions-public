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
import React, { ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { Typography } from "@material-ui/core";

import { AddIcon } from "../../../../../../assets/icons";
import { Context as DiagramContext } from "../../../../../../Contexts/Diagram";
import { Context, FormState } from "../../../../../../Contexts/RecordEditor";
import { getAllVariables } from "../../../../../utils";
import { genVariableName } from "../../../../Portals/utils";
import { keywords } from "../../../../Portals/utils/constants";
import { FormTextInput } from "../../../FormFieldComponents/TextField/FormTextInput";
import { FormGenerator } from "../../../FormGenerator";
import { FieldEditor } from "../FieldEditor";
import { FieldItem } from "../FieldItem";
import { RecordHeader } from "../RecordHeader";
import { recordStyles } from "../style";
import { RecordModel, SimpleField } from "../types";
import { genRecordName, getFieldNames } from "../utils";

export interface CodePanelProps {
    recordModel: RecordModel;
    parentRecordModel?: RecordModel;
}

export function RecordField(props: CodePanelProps) {
    const { recordModel, parentRecordModel } = props;

    const recordClasses = recordStyles();

    const intl = useIntl();

    const addFieldText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.recordField.addBtnText",
        defaultMessage: "Add Field"
    });

    const { state, callBacks } = useContext(Context);
    const { props: { stSymbolInfo } } = useContext(DiagramContext);

    const allRecodVariables = useMemo(() => getAllVariables(stSymbolInfo), [stSymbolInfo]);
    const recordNames: string[] = [];
    allRecodVariables.forEach((variable) => {
        const data = variable.split(':').pop();
        recordNames.push(data);
    });
    const defaultRecordName = genVariableName("Record_name", recordNames);
    const [recordName, setRecordName] = useState<string>(defaultRecordName);
    // TODO: Fix record expand and collapse
    const [isRecordExpanded, setIsRecordExpanded] = useState(true);
    const [isImportFormVisible, setIsImportFormVisible] = useState(false);
    const [fieldNameError, setFieldNameError] = useState<string>("");
    const [recordNameError, setRecordNameError] = useState<string>("");
    const [isRecordEditInProgress, setIsRecordEditInProgress] = useState((recordModel.name === "") ||
        (recordModel.name === undefined));
    const [isRecordFocus, setIsRecordFocus] = useState(true);
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

    const handleFieldEdit = (field: SimpleField) => {
        setIsRecordEditInProgress(false)
        if (state.currentField && state.currentField.name  === "" && (state.currentField.value === "" ||
            state.currentField.value === undefined) && state.currentField.type === "" &&
            state.currentField.isEditInProgress) {
            // Removing draft field
            const index = state.currentRecord.fields.indexOf(state.currentField);
            state.currentRecord.fields.splice(index, 1);

            const selectedFieldIndex = recordModel.fields.indexOf(field);
            if (selectedFieldIndex !== -1) {
                // Changes the active state to selected record model
                state.currentRecord.isActive = false;
                recordModel.isActive = true;

                // Changes the active state to selected field
                if (state.currentField) {
                    state.currentField.isActive = false;
                    state.currentField.isEditInProgress = false;
                }
                field.isActive = true;
                field.isEditInProgress = true;

                callBacks.onUpdateCurrentField(field);
                callBacks.onUpdateCurrentRecord(recordModel);
                callBacks.onUpdateModel(state.recordModel);
                callBacks.onChangeFormState(FormState.UPDATE_FIELD);
            }
        } else if (!(state.isEditorInvalid || (state.currentField && state.currentField.name === "" ||
            state.currentField?.type === ""))) {
            const index = recordModel.fields.indexOf(field);
            if (index !== -1) {
                // Changes the active state to selected record model
                state.currentRecord.isActive = false;
                recordModel.isActive = true;

                // Changes the active state to selected field
                if (state.currentField) {
                    state.currentField.isActive = false;
                    state.currentField.isEditInProgress = false;
                }
                field.isActive = true;
                field.isEditInProgress = true;

                callBacks.onUpdateCurrentField(field);
                callBacks.onUpdateCurrentRecord(recordModel);
                callBacks.onUpdateModel(state.recordModel);
                callBacks.onChangeFormState(FormState.UPDATE_FIELD);
            }
        }
    }

    const handleFieldDelete = (field: SimpleField) => {
        setIsRecordEditInProgress(false)
        const index = recordModel.fields.indexOf(field);
        if (index !== -1) {
            recordModel.fields.splice(index, 1);

            // Changes the active state to selected record model
            state.currentRecord.isActive = false;
            recordModel.isActive = true;

            if (field.isEditInProgress) {
                callBacks.onUpdateCurrentField(undefined);
            }
            callBacks.onUpdateModel(state.recordModel);
            callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
            callBacks.updateEditorValidity(false);
        }
    };

    const getNewField = () : SimpleField => {
        const newField: SimpleField = {type: "", name: "", isFieldOptional: false, isActive: true,
                                       isValueInvalid: false, isNameInvalid: true, isTypeInvalid: true,
                                       isEditInProgress: true};
        recordModel.fields.push(newField);
        return newField;
    };

    const handleAddField = () => {
        if ((state.currentField && state.currentField.name  === "" && (state.currentField.value === "" ||
            state.currentField.value === undefined) && state.currentField.type === "" &&
            state.currentField.isEditInProgress) || (state.currentField && state.currentField.name &&
            state.currentField.type === "")) {
            // Removing draft field
            const index = state.currentRecord.fields.indexOf(state.currentField);
            state.currentRecord.fields.splice(index, 1);
        }

        // Changes the active state to selected record model
        state.currentRecord.isActive = false;
        if (state.currentField && state.currentField.name === "") {
            state.currentField.name = genRecordName("fieldName", getFieldNames(state.currentRecord.fields));
        }
        recordModel.isActive = true;

        const newField = getNewField();

        if (!recordModel.name) {
            recordModel.name = genRecordName("Record", []);
        }

        // Changes the active state to selected field
        if (state.currentField) {
            state.currentField.isActive = false;
            state.currentField.isEditInProgress = false;
        }

        callBacks.onChangeFormState(FormState.ADD_FIELD);
        callBacks.onUpdateCurrentRecord(recordModel);
        callBacks.onUpdateModel(state.recordModel);
        callBacks.onUpdateCurrentField(newField);
    };

    const handleImportClicked = () => {
        if (state.currentField && state.currentField.name  === "" && (state.currentField.value === "" ||
            state.currentField.value === undefined) && state.currentField.type === "" &&
            state.currentField.isEditInProgress) {
            // Removing draft field
            const index = state.currentRecord.fields.indexOf(state.currentField);
            state.currentRecord.fields.splice(index, 1);
        }

        state.currentRecord.isActive = false;
        recordModel.isActive = true;
        callBacks.onUpdateCurrentRecord(recordModel);
        callBacks.updateEditorValidity(false);
        setIsImportFormVisible(true);
    }

    const handleImportFormClose = () => {
        setIsImportFormVisible(false);
        callBacks.updateEditorValidity(false);
    }

    const handleImportFormSave = () => {
        setIsImportFormVisible(false);
        callBacks.updateEditorValidity(false);
    }

    const handleKeyUp = (event: any) => {
        if (event.key === 'Enter') {
            if (!event.target.value) {
                recordModel.name = genRecordName("Record", []);
                state.currentField = getNewField();
                callBacks.onUpdateCurrentField(state.currentField);
                setIsRecordEditInProgress(false);
                setRecordNameError("");
                callBacks.onUpdateRecordSelection(false);
                callBacks.onChangeFormState(FormState.UPDATE_FIELD);
                callBacks.updateEditorValidity(false);
            } else if (nameRegex.test(event.target.value)) {
                state.currentField = getNewField();
                callBacks.onUpdateCurrentField(state.currentField);
                setIsRecordEditInProgress(false);
                setRecordNameError("");
                callBacks.onUpdateRecordSelection(false);
                callBacks.onChangeFormState(FormState.UPDATE_FIELD);
                callBacks.updateEditorValidity(false);
            } else {
                callBacks.updateEditorValidity(true);
                setRecordNameError("Invalid name");
            }
        } else {
            state.currentRecord.name = event.target.value;
            callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
        }
        callBacks.onUpdateModel(state.recordModel);
    };

    const handleOnBlur = (event: any) => {
        if (!event.target.value) {
            recordModel.name = genRecordName("Record", []);
            callBacks.onUpdateModel(state.recordModel);
        }
        setIsRecordEditInProgress(false);
        callBacks.onUpdateRecordSelection(false);
    };

    const handleFieldEditorChange = (event: any) => {
        let isNameAlreadyExists;
        if (keywords.includes(event.target.value)) {
            // Add ' character when we have a keyword to check whether it is existing
            isNameAlreadyExists = state.currentRecord.fields.find(field => (field.name === `'${event.target.value}`)) &&
                !(state.currentField?.name === `'${event.target.value}`);
        } else {
            isNameAlreadyExists = state.currentRecord.fields.find(field => (field.name === event.target.value)) &&
                !(state.currentField?.name === event.target.value);
        }
        if (event.key === 'Enter') {
            if (!event.target.value) {
                state.currentField.name = genRecordName("fieldName", getFieldNames(state.currentRecord.fields));
                state.currentField.isNameInvalid = false;
            }
            if (keywords.includes(event.target.value)) {
                state.currentField.name = `'${event.target.value}`;
            }
            if (state.currentField.isNameInvalid || !state.currentField.type ||
                state.currentField.isTypeInvalid) {
                return;
            } else {
                state.currentField.isEditInProgress = false;
                state.currentField.isActive = true;
                state.currentField = getNewField();
            }
        } else if (!(((event.keyCode >= 65) && (event.keyCode <= 90)) || ((event.keyCode >= 97) &&
            (event.keyCode <= 122)) || ((event.keyCode >= 48) && (event.keyCode <= 57)) || (event.key === "Backspace")
            || (event.key === "Delete"))) {
            // Escaping special keys
            return;
        } else {
            state.currentField.name = event.target.value;
        }
        if (isNameAlreadyExists) {
            setFieldNameError("Name already exists");
            state.currentField.isNameInvalid = true;
            callBacks.updateEditorValidity(state.currentField.isNameInvalid ||
                state.currentField.isValueInvalid);
        } else if ((event.target.value !== "") && !nameRegex.test(event.target.value)
            && !keywords.includes(event.target.value.replace("'", ""))) {
            setFieldNameError("Invalid name");
            state.currentField.isNameInvalid = true;
            callBacks.updateEditorValidity(state.currentField.isNameInvalid ||
                state.currentField.isValueInvalid);
        } else {
            setFieldNameError("");
            state.currentField.isNameInvalid = false;
            callBacks.updateEditorValidity(state.currentField.isNameInvalid ||
                state.currentField.isValueInvalid);
        }
        callBacks.onUpdateCurrentField(state.currentField);
    };

    const handleSubItemFocusLost = (event: any) => {
        if (!event.target.value && state.currentField.type && !state.currentField.isTypeInvalid) {
            state.currentField.name = state.currentField.type === "record" ?
                genRecordName("Record", getFieldNames(state.currentRecord.fields)) :
                genRecordName("fieldName", getFieldNames(state.currentRecord.fields));
        }
        callBacks.onUpdateCurrentField(state.currentField);
    };

    const handleRecordEdit = () => {
        setRecordName(state.currentRecord.name)
        if (state.currentField && state.currentField.name  === "" && (state.currentField.value === "" ||
            state.currentField.value === undefined) && state.currentField.type === "" &&
            state.currentField.isEditInProgress) {
            // Removing draft field
            const index = state.currentRecord.fields.indexOf(state.currentField);
            state.currentRecord.fields.splice(index, 1);

            recordModel.isActive = true;
            setIsRecordEditInProgress(true);
            callBacks.onUpdateCurrentRecord(recordModel);
            callBacks.onUpdateModel(state.recordModel);
            callBacks.onUpdateRecordSelection(true);
            callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
            setIsRecordFocus(true)
        } else if ((!(state.isEditorInvalid || state.currentField?.name === "" || state.currentField?.type === "")) ||
            (!state.currentField)) {
            state.currentRecord.isActive = false;
            recordModel.isActive = true;
            setIsRecordEditInProgress(true);
            setRecordName(state.currentRecord.name)
            callBacks.onUpdateCurrentRecord(recordModel);
            callBacks.onUpdateModel(state.recordModel);
            callBacks.onUpdateRecordSelection(true);
            callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
            setIsRecordFocus(true)
        }
    };
    const handleRevertFocus = () => {
        setIsRecordFocus(false);
    }
    const handleRecordExpand = () => {
        setIsRecordExpanded(!isRecordExpanded);
    };

    const handleRecordEditInProgress = (isEditInProgress: boolean) => {
        setIsRecordEditInProgress(isEditInProgress);
    };

    let isDraftRecordAdded = false;
    const fieldItems: ReactNode[] = [];
    recordModel.fields.forEach((field: SimpleField | RecordModel) => {
        if ((field.type !== "record") && !(field as SimpleField).isEditInProgress) {
            // Rendering configured fields
            fieldItems.push(
                <FieldItem
                    field={field as SimpleField}
                    onDeleteClick={handleFieldDelete}
                    onEditCLick={handleFieldEdit}
                />
            )
        } else if ((field.type !== "record") && (field as SimpleField).isEditInProgress) {
            fieldItems.push(
                <FieldEditor
                    field={field as SimpleField}
                    nameError={fieldNameError}
                    onChange={handleFieldEditorChange}
                    onDeleteClick={handleFieldDelete}
                    onFocusLost={handleSubItemFocusLost}
                    onEnterPress={null}
                />
            );
            isDraftRecordAdded = true;
        } else if (field.type === "record") {
            fieldItems.push(<RecordField recordModel={field as RecordModel} parentRecordModel={recordModel} />);
        }
    });

    const recordEn = `${recordModel.isClosed ? "| }" : "}"}${recordModel.isArray ? "[]" : ""}`;
    const typeDescName = `${recordModel.isTypeDefinition ? "" : `${recordModel.name}`}`;

    useEffect(() => {
        // Checks whether record is clicked to edit, if so resetting field insertion
        if (state.isRecordSelected) {
            if (state.currentRecord !== recordModel) {
                // Setting all other objects record editing false except the record being edited;
                setIsRecordEditInProgress(false);
            }
            if (state.currentField) {
                state.currentField.isEditInProgress = false;
                state.currentField.isActive = false;
            }
            callBacks.onUpdateCurrentField(state.currentField);
        }
    }, [state.isRecordSelected]);

    return (
        <div>
            <div
                className={recordModel.isActive ? recordClasses.activeRecordEditorWrapper :
                    recordClasses.recordEditorWrapper}
            >
                <RecordHeader
                    recordModel={recordModel}
                    parentRecordModel={parentRecordModel}
                    recordExpanded={isRecordExpanded}
                    isRecordEditInProgress={isRecordEditInProgress}
                    setIsRecordEditInProgress={handleRecordEditInProgress}
                    toggleRecordExpand={handleRecordExpand}
                    onEditRecord={handleRecordEdit}
                    recordName={recordName}
                    isRecordFocued={isRecordFocus}
                    recordRevertFocus={handleRevertFocus}
                />
                {isRecordExpanded && (
                    <div data-testid={`fieldItems-${recordModel.name}`}className={recordModel?.isActive ? recordClasses.activeRecordSubFieldWrapper : recordClasses.recordSubFieldWrapper}>
                        {fieldItems}
                        {!state.isEditorInvalid && !isDraftRecordAdded && (
                            <>
                                <div className={recordClasses.addFieldBtnWrap} onClick={handleAddField}>
                                    <AddIcon/>
                                    <p>{addFieldText}</p>
                                </div>
                                <div className={recordClasses.addFieldBtnWrap} onClick={handleImportClicked}>
                                    <AddIcon/>
                                    <p>Import JSON</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
                {isImportFormVisible && (
                    <FormGenerator
                        configOverlayFormStatus={{
                            formType: "RecordJson",
                            isLoading: false
                        }}
                        onCancel={handleImportFormClose}
                        onSave={handleImportFormSave}
                    />
                )}
                <div id="test"/>
                <div className={recordClasses.endRecordCodeWrapper}>
                    <Typography
                        variant='body2'
                        className={recordClasses.closeBraceTokenWrapper}
                    >
                        {recordEn}
                    </Typography>
                    {!recordModel.isTypeDefinition && isRecordEditInProgress && (
                        <div className={recordClasses.typeTextFieldWrapper}>
                            <FormTextInput
                                dataTestId="record-name"
                                customProps={{
                                    isErrored: (recordNameError !== ""),
                                    focused: true
                                }}
                                defaultValue={typeDescName}
                                onKeyUp={handleKeyUp}
                                onBlur={handleOnBlur}
                                errorMessage={recordNameError}
                                placeholder={"Record name"}
                                size="small"
                            />
                        </div>
                    )}
                    {!isRecordEditInProgress && typeDescName && (
                        <Typography
                            variant='body2'
                            className={recordClasses.endRecordCode}
                            onClick={handleRecordEdit}
                        >
                            {typeDescName}
                        </Typography>
                    )}
                    {recordModel.isOptional && (
                        <Typography
                            variant='body2'
                            className={recordClasses.singleTokenWrapperWithMargin}
                            onClick={handleRecordEdit}
                        >
                            ?
                        </Typography>
                    )}
                    <Typography
                        variant='body2'
                        className={(!recordModel.isTypeDefinition && isRecordEditInProgress) ?
                            recordClasses.editRecordEndSemicolonWrapper : recordClasses.recordEndSemicolonWrapper}
                    >
                        ;
                    </Typography>
                </div>
            </div>
        </div>
    )
}
