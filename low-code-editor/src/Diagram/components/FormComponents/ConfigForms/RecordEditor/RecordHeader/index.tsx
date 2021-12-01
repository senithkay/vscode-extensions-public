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
import React, { useContext, useEffect, useState } from "react";

import { Typography } from "@material-ui/core";

import DeleteButton from "../../../../../../assets/icons/DeleteButton";
import EditButton from "../../../../../../assets/icons/EditButton";
import { Context, FormState } from "../../../../../../Contexts/RecordEditor";
import { ComponentExpandButton } from "../../../../LowCodeDiagram/Components/ComponentExpandButton";
import { FormTextInput } from "../../../FormFieldComponents/TextField/FormTextInput";
import { recordStyles } from "../style";
import { RecordModel, SimpleField } from "../types";
import { genRecordName } from "../utils";

export interface RecordHeaderProps {
    recordModel: RecordModel;
    parentRecordModel: RecordModel;
    recordExpanded: boolean;
    toggleRecordExpand: () => void;
}

export function RecordHeader(props: RecordHeaderProps) {
    const { recordModel, parentRecordModel, recordExpanded, toggleRecordExpand } = props;

    const recordClasses = recordStyles();

    const { state, callBacks } = useContext(Context);

    const [recordNameError, setRecordNameError] = useState<string>("");
    const [isRecordEditInProgress, setIsRecordEditInProgress] = useState((recordModel.name === "") ||
        (recordModel.name === undefined));
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

    const handleIsClosedChange = () => {
        state.currentRecord.isActive = false;

        recordModel.isClosed = !recordModel.isClosed;
        recordModel.isActive = true;
        callBacks.onUpdateCurrentRecord(recordModel);
        callBacks.onUpdateModel(state.recordModel);
    };

    const handleIsPublicChange = () => {
        state.currentRecord.isActive = false;

        recordModel.isPublic = !recordModel.isPublic;
        recordModel.isActive = true;
        callBacks.onUpdateCurrentRecord(recordModel);
        callBacks.onUpdateModel(state.recordModel);
    };

    const handleIsArrayChange = () => {
        state.currentRecord.isActive = false;

        recordModel.isArray = !recordModel.isArray;
        recordModel.isActive = true;
        callBacks.onUpdateCurrentRecord(recordModel);
        callBacks.onUpdateModel(state.recordModel);
    };

    const handleOptionalChange = () => {
        state.currentRecord.isActive = false;

        recordModel.isOptional = !recordModel.isOptional;
        recordModel.isActive = true;
        callBacks.onUpdateCurrentRecord(recordModel);
        callBacks.onUpdateModel(state.recordModel);
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
        return newField;
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

    const handleRecordClick = () => {
        if (state.currentField && state.currentField.name  === "" && (state.currentField.value === "" ||
            state.currentField.value === undefined) && state.currentField.type === "" &&
            state.currentField.isEditInProgress) {
            // Removing draft field
            const index = state.currentRecord.fields.indexOf(state.currentField);
            state.currentRecord.fields.splice(index, 1);

            state.currentRecord.isActive = false;
            recordModel.isActive = true;
            setIsRecordEditInProgress(true);
            callBacks.onUpdateCurrentRecord(recordModel);
            callBacks.onUpdateModel(state.recordModel);
            callBacks.onUpdateRecordSelection(true);
            callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
        } else if (!(state.isEditorInvalid || state.currentField?.name === "" || state.currentField?.type === "")) {
            state.currentRecord.isActive = false;
            recordModel.isActive = true;
            setIsRecordEditInProgress(true);
            callBacks.onUpdateCurrentRecord(recordModel);
            callBacks.onUpdateModel(state.recordModel);
            callBacks.onUpdateRecordSelection(true);
            callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
        }
    };

    const accessModifier = `${recordModel.isPublic ? "public " : ""}`;
    const recordTypeNVisibility = `${recordModel.isTypeDefinition ? `${accessModifier} type` : ""}`;
    const openBraceTokens = `{ ${recordModel.isClosed ? "|" : ""}`;
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
                        <ComponentExpandButton onClick={toggleRecordExpand} isExpanded={recordExpanded} />
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
                        {!recordExpanded && (
                            <div className={recordClasses.dotExpander} onClick={toggleRecordExpand}>
                                ....
                            </div>
                        )}
                    </div>
                    {!state.isEditorInvalid && (
                        <div className={recordModel.isTypeDefinition ? recordClasses.typeDefEditBtnWrapper : recordClasses.recordHeaderBtnWrapper}>
                            {recordModel.isTypeDefinition && (
                                <div style={{background: "green", width: 25}} onClick={handleIsPublicChange} />
                            )}
                            <div style={{background: "red", width: 25, height: 20}} onClick={handleIsClosedChange} />
                            {!recordModel.isTypeDefinition && (
                                <>
                                    <div style={{background: "blue", width: 25, height: 20}} onClick={handleIsArrayChange} />
                                    <div style={{background: "yellow", width: 25, height: 20}} onClick={handleOptionalChange} />
                                </>
                            )}
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
            </div>
        </div>
    )
}
