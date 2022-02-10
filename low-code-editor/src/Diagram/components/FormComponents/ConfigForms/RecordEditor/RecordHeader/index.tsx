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
import React, { useContext, useState } from "react";

import { Typography } from "@material-ui/core";

import ActiveArray from "../../../../../../assets/icons/ActiveArray";
import ActiveClosed from "../../../../../../assets/icons/ActiveClosed";
import ActiveOptional from "../../../../../../assets/icons/ActiveOptional";
import ActivePublic from "../../../../../../assets/icons/ActivePublic";
import DeleteButton from "../../../../../../assets/icons/DeleteButton";
import EditButton from "../../../../../../assets/icons/EditButton";
import InactiveArray from "../../../../../../assets/icons/InactiveArray";
import InactiveClosed from "../../../../../../assets/icons/InactiveClosed";
import InactiveOptional from "../../../../../../assets/icons/InactiveOptional";
import InactivePublic from "../../../../../../assets/icons/InactivePublic";
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
    isRecordEditInProgress: boolean;
    toggleRecordExpand: () => void;
    setIsRecordEditInProgress: (isEditInProgress: boolean) => void;
    onEditRecord: () => void;
}

export function RecordHeader(props: RecordHeaderProps) {
    const { recordModel, parentRecordModel, recordExpanded, isRecordEditInProgress, toggleRecordExpand,
            setIsRecordEditInProgress, onEditRecord } = props;

    const recordClasses = recordStyles();

    const { state, callBacks } = useContext(Context);

    const [recordNameError, setRecordNameError] = useState<string>("");
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

    const handleRecordEdit = () => {
        onEditRecord();
    };

    const accessModifier = `${recordModel.isPublic ? "public " : ""}`;
    const recordTypeNVisibility = `${recordModel.isTypeDefinition ? `${accessModifier} type` : ""}`;
    const openBraceTokens = `{ ${recordModel.isClosed ? "|" : ""}`;
    const typeDefName = `${recordModel.isTypeDefinition ? `${recordModel.name ? recordModel.name : ""}` : ""}`;

    return (
        <div data-testid={recordModel.name}>
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
                                onClick={handleRecordEdit}
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
                                <div className={recordClasses.actionBtnWrapper}>
                                    {recordModel.isPublic ? (
                                        <div className={recordClasses.activeBtnWrapper}>
                                            <ActivePublic
                                                onClick={handleIsPublicChange}
                                                toolTipTitle="Public"
                                                toolTipContent="Make record visibility Public"
                                            />
                                        </div>
                                    ) : (
                                        <div className={recordClasses.inactiveBtnWrapper}>
                                            <InactivePublic
                                                onClick={handleIsPublicChange}
                                                toolTipTitle="Public"
                                                toolTipContent="Make record visibility Public"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={recordClasses.actionBtnWrapper}>
                                {recordModel.isClosed ? (
                                    <div className={recordClasses.activeBtnWrapper}>
                                        <ActiveClosed
                                            onClick={handleIsClosedChange}
                                            toolTipTitle="Closed"
                                            toolTipContent="Make record Closed"
                                        />
                                    </div>
                                ) : (
                                    <div className={recordClasses.inactiveBtnWrapper}>
                                        <InactiveClosed
                                            onClick={handleIsClosedChange}
                                            toolTipTitle="Closed"
                                            toolTipContent="Make record Closed"
                                        />
                                    </div>
                                )}
                            </div>
                            {!recordModel.isTypeDefinition && (
                                <>
                                    <div className={recordClasses.actionBtnWrapper}>
                                        {recordModel.isArray ? (
                                            <div className={recordClasses.activeBtnWrapper}>
                                                <ActiveArray
                                                    onClick={handleIsArrayChange}
                                                    toolTipTitle="Array"
                                                    toolTipContent="Make array type record"
                                                />
                                            </div>
                                        ) : (
                                            <div className={recordClasses.inactiveBtnWrapper}>
                                                <InactiveArray
                                                    onClick={handleIsArrayChange}
                                                    toolTipTitle="Array"
                                                    toolTipContent="Make array type Record"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className={recordClasses.actionBtnWrapper}>
                                        {recordModel.isOptional ? (
                                            <div className={recordClasses.activeBtnWrapper}>
                                                <ActiveOptional
                                                    onClick={handleOptionalChange}
                                                    toolTipTitle="Optional"
                                                    toolTipContent="Make optional record"
                                                />
                                            </div>
                                        ) : (
                                            <div className={recordClasses.inactiveBtnWrapper}>
                                                <InactiveOptional
                                                    onClick={handleOptionalChange}
                                                    toolTipTitle="Optional"
                                                    toolTipContent="Make optional record"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            <div className={recordClasses.actionBtnWrapper}>
                                <EditButton onClick={handleRecordEdit}/>
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
