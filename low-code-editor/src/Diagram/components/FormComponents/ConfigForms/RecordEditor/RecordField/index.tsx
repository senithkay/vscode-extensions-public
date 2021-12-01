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
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { Typography } from "@material-ui/core";

import { AddIcon } from "../../../../../../assets/icons";
import DeleteButton from "../../../../../../assets/icons/DeleteButton";
import EditButton from "../../../../../../assets/icons/EditButton";
import { Context, FormState } from "../../../../../../Contexts/RecordEditor";
import { ComponentExpandButton } from "../../../../LowCodeDiagram/Components/ComponentExpandButton";
import { keywords } from "../../../../Portals/utils/constants";
import { FormTextInput } from "../../../FormFieldComponents/TextField/FormTextInput";
import { FieldEditor } from "../FieldEditor";
import { FieldItem } from "../FieldItem";
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

    const [isRecordExpanded, setIsRecordExpanded] = useState(true);
    const [fieldNameError, setFieldNameError] = useState<string>("");
    const [recordNameError, setRecordNameError] = useState<string>("");
    const [isRecordEditInProgress, setIsRecordEditInProgress] = useState((recordModel.name === "") ||
        (recordModel.name === undefined));
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

    const handleFieldEdit = (field: SimpleField) => {
        if (!(state.isEditorInvalid || (state.currentField && state.currentField.name === "" ||
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
        const index = recordModel.fields.indexOf(field);
        if (index !== -1) {
            recordModel.fields.splice(index, 1);

            // Changes the active state to selected record model
            state.currentRecord.isActive = false;
            recordModel.isActive = true;

            callBacks.onUpdateModel(state.recordModel);
            callBacks.onUpdateCurrentField(undefined);
            callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
            callBacks.updateEditorValidity(false);
        }
    };

    const handleRecordDelete = () => {
        if (parentRecordModel) {
            const index = parentRecordModel.fields.indexOf(recordModel);
            if (index !== -1) {
                parentRecordModel.fields.splice(index, 1);
            }
            state.currentRecord.isActive = false;
            parentRecordModel.isActive = true;
            state.currentRecord = parentRecordModel;
            callBacks.onUpdateModel(state.recordModel);
            callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
        }
    };

    const getNewField = () : SimpleField => {
        const newField: SimpleField = {type: "", name: "", isFieldOptional: false, isActive: true,
                                       isNameInvalid: false, isEditInProgress: true};
        recordModel.fields.push(newField);
        callBacks.updateEditorValidity(true);
        return newField;
    };

    const handleAddField = () => {
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

    const handleRecordExpand = () => {
        setIsRecordExpanded(!isRecordExpanded);
    };

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
        if (event.key === 'Enter') {
            if (!event.target.value) {
                state.currentField.name = genRecordName("fieldName", getFieldNames(state.currentRecord.fields));
            }
            if (!state.currentField.isNameInvalid) {
                state.currentField.isEditInProgress = false;
                state.currentField.isActive = true;
            }
        } else {
            state.currentField.name = event.target.value;
        }
        const isNameAlreadyExists = state.currentRecord.fields.find(field => (field.name === event.target.value)) &&
            !(state.currentField?.name === event.target.value);
        if (isNameAlreadyExists) {
            setFieldNameError("Name already exists");
            state.currentField.isNameInvalid = true;
            callBacks.updateEditorValidity(state.currentField.isNameInvalid ||
                state.currentField.isValueInvalid);
        } else if (keywords.includes(event.target.value)) {
            setFieldNameError("Keyword are not allowed");
            state.currentField.isNameInvalid = true;
            callBacks.updateEditorValidity(state.currentField.isNameInvalid ||
                state.currentField.isValueInvalid);
        } else if ((event.target.value !== "") && !nameRegex.test(event.target.value)) {
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
        if (!event.target.value) {
            state.currentField.name = state.currentField.type === "record" ?
                genRecordName("Record", getFieldNames(state.currentRecord.fields)) :
                genRecordName("fieldName", getFieldNames(state.currentRecord.fields));
        }
        callBacks.onUpdateCurrentField(state.currentField);
    };

    const handleRecordClick = () => {
        if (!(state.isEditorInvalid || state.currentField?.name === "" || state.currentField?.type === "")) {
            state.currentRecord.isActive = false;
            recordModel.isActive = true;
            setIsRecordEditInProgress(true);
            callBacks.onUpdateCurrentRecord(recordModel);
            callBacks.onUpdateModel(state.recordModel);
            callBacks.onUpdateRecordSelection(true);
            callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
        }
    };

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
                    field={state.currentField}
                    nameError={fieldNameError}
                    onChange={handleFieldEditorChange}
                    onDeleteClick={handleFieldDelete}
                    onFocusLost={handleSubItemFocusLost}
                    onEnterPress={null}
                />
            );
        } else if (field.type === "record") {
            fieldItems.push(<RecordField recordModel={field as RecordModel} parentRecordModel={recordModel} />);
        }
    });

    const accessModifier = `${recordModel.isPublic ? "public " : ""}`;
    const recordTypeNVisibility = `${recordModel.isTypeDefinition ? `${accessModifier} type` : ""}`;
    const openBraceTokens = `{ ${recordModel.isClosed ? "|" : ""}`;
    const recordEn = `${recordModel.isClosed ? "|}" : "}"}${recordModel.isArray ? "[]" :
        ""}${recordModel.isOptional ? "?" : ""}`;
    const typeDescName = `${recordModel.isTypeDefinition ? "" : `${recordModel.name}`}`;
    const typeDefName = `${recordModel.isTypeDefinition ? `${recordModel.name ? recordModel.name : ""}` : ""}`;

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
                <div className={recordClasses.recordHeader}>
                    <div className={recordClasses.recordExpandBtnWrapper}>
                        <ComponentExpandButton onClick={handleRecordExpand} isExpanded={isRecordExpanded} />
                    </div>
                    <div className={recordClasses.recordHeading}>
                        {recordTypeNVisibility && (
                            <Typography
                                variant='body2'
                                className={recordClasses.typeNVisibilityWrapper}
                            >
                                {recordTypeNVisibility}
                            </Typography>
                        )}
                        {recordModel.isTypeDefinition && isRecordEditInProgress && (
                            <div className={recordClasses.typeTextFieldWrapper}>
                                <FormTextInput
                                    dataTestId="record-name"
                                    customProps={{
                                        isErrored: false,
                                        focused: true
                                    }}
                                    defaultValue={typeDefName}
                                    onKeyUp={handleKeyUp}
                                    onBlur={handleOnBlur}
                                    errorMessage={""}
                                    placeholder={"Record name"}
                                    size="small"
                                />
                            </div>
                        )}
                        {typeDefName && !isRecordEditInProgress && (
                            <Typography
                                variant='body2'
                                className={recordClasses.typeDefNameWrapper}
                                onClick={handleRecordClick}
                            >
                                {typeDefName}
                            </Typography>
                        )}
                        <Typography
                            variant='body2'
                            className={recordClasses.recordKeywordWrapper}
                        >
                            record
                        </Typography>
                        <Typography
                            variant='body2'
                            className={recordClasses.openBraceTokenWrapper}
                        >
                            {openBraceTokens}
                        </Typography>
                        {!isRecordExpanded && (
                            <div className={recordClasses.dotExpander} onClick={handleRecordExpand}>
                                ....
                            </div>
                        )}
                    </div>
                    {!state.isEditorInvalid && (
                        <div className={recordModel.isTypeDefinition ? recordClasses.typeDefEditBtnWrapper : recordClasses.recordHeaderBtnWrapper}>
                            <div className={recordClasses.actionBtnWrapper}>
                                <EditButton onClick={handleRecordClick}/>
                            </div>
                            {!recordModel.isTypeDefinition && (
                                <div className={recordClasses.actionBtnWrapper}>
                                    <DeleteButton onClick={handleRecordDelete}/>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {isRecordExpanded && (
                    <div className={recordModel?.isActive ? recordClasses.activeRecordSubFieldWrapper : recordClasses.recordSubFieldWrapper}>
                        {fieldItems}
                        {!state.isEditorInvalid && (
                            <div className={recordClasses.addFieldBtnWrap} onClick={handleAddField}>
                                <AddIcon/>
                                <p>{addFieldText}</p>
                            </div>
                        )}
                    </div>
                )}
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
                            onClick={handleRecordClick}
                        >
                            {typeDescName}
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
