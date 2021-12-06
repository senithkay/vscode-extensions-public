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
import { Context, FormState } from "../../../../../../Contexts/EnumEditor";
import { ComponentExpandButton } from "../../../../LowCodeDiagram/Components/ComponentExpandButton";
import { keywords } from "../../../../Portals/utils/constants";
import { FormTextInput } from "../../../FormFieldComponents/TextField/FormTextInput";
import { FieldEditor } from "../FieldEditor";
import { FieldItem } from "../FieldItem";
import { recordStyles } from "../style";
import { EnumModel, SimpleField } from "../types";
import { genRecordName, getFieldNames } from "../utils";

export interface CodePanelProps {
    enumModel: EnumModel;
    parentRecordModel?: EnumModel;
}

export function EnumField(props: CodePanelProps) {
    const { enumModel, parentRecordModel } = props;

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
    const [isRecordEditInProgress, setIsRecordEditInProgress] = useState((enumModel.name === "") ||
        (enumModel.name === undefined));
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

    const handleFieldEdit = (field: SimpleField) => {
        if (!(state.isEditorInvalid || (state.currentField && state.currentField.name === "" ||
            state.currentField?.type === ""))) {
            const index = enumModel.fields.indexOf(field);
            if (index !== -1) {
                // Changes the active state to selected enum model
                state.currentRecord.isActive = false;
                enumModel.isActive = true;

                // Changes the active state to selected field
                if (state.currentField) {
                    state.currentField.isActive = false;
                    state.currentField.isEditInProgress = false;
                }
                field.isActive = true;
                field.isEditInProgress = true;

                callBacks.onUpdateCurrentField(field);
                callBacks.onUpdateCurrentRecord(enumModel);
                callBacks.onUpdateModel(state.enumModel);
                callBacks.onChangeFormState(FormState.UPDATE_FIELD);
            }
        }
    }

    const handleFieldDelete = (field: SimpleField) => {
        const index = enumModel.fields.indexOf(field);
        if (index !== -1) {
            enumModel.fields.splice(index, 1);

            // Changes the active state to selected enum model
            state.currentRecord.isActive = false;
            enumModel.isActive = true;

            callBacks.onUpdateModel(state.enumModel);
            callBacks.onUpdateCurrentField(undefined);
            callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
            callBacks.updateEditorValidity(false);
        }
    };

    const handleRecordDelete = () => {
        if (parentRecordModel) {
            const index = parentRecordModel.fields.indexOf(enumModel);
            if (index !== -1) {
                parentRecordModel.fields.splice(index, 1);
            }
            state.currentRecord.isActive = false;
            parentRecordModel.isActive = true;
            state.currentRecord = parentRecordModel;
            callBacks.onUpdateModel(state.enumModel);
            callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
        }
    };

    const getNewField = () : SimpleField => {
        const newField: SimpleField = {type: "", name: "", isFieldOptional: false, isActive: true,
                                       isNameInvalid: false, isEditInProgress: true};
        enumModel.fields.push(newField);
        callBacks.updateEditorValidity(true);
        return newField;
    };

    const handleAddField = () => {
        // Changes the active state to selected enum model
        state.currentRecord.isActive = false;
        if (state.currentField && state.currentField.name === "") {
            state.currentField.name = genRecordName("fieldName", getFieldNames(state.currentRecord.fields));
        }
        enumModel.isActive = true;

        const newField = getNewField();

        if (!enumModel.name) {
            enumModel.name = genRecordName("Enum", []);
        }

        // Changes the active state to selected field
        if (state.currentField) {
            state.currentField.isActive = false;
            state.currentField.isEditInProgress = false;
        }

        callBacks.onChangeFormState(FormState.ADD_FIELD);
        callBacks.onUpdateCurrentRecord(enumModel);
        callBacks.onUpdateModel(state.enumModel);
        callBacks.onUpdateCurrentField(newField);
    };

    const handleRecordExpand = () => {
        setIsRecordExpanded(!isRecordExpanded);
    };

    const handleKeyUp = (event: any) => {
        if (event.key === 'Enter') {
            if (!event.target.value) {
                enumModel.name = genRecordName("Enum", []);
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
        callBacks.onUpdateModel(state.enumModel);
    };

    const handleOnBlur = (event: any) => {
        if (!event.target.value) {
            enumModel.name = genRecordName("Enum", []);
            callBacks.onUpdateModel(state.enumModel);
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
        const isNameAlreadyExists = state.currentRecord.fields.find(field => (field.name === event.target.value));
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
            handleFieldDelete(state.currentField);
        } else {
            state.currentField.isEditInProgress = false
            state.currentField.isActive = false;
            callBacks.onUpdateCurrentField(state.currentField);
        }
    };

    const handleRecordClick = () => {
        if (!(state.isEditorInvalid || state.currentField?.name === "" || state.currentField?.type === "")) {
            state.currentRecord.isActive = false;
            enumModel.isActive = true;
            setIsRecordEditInProgress(true);
            callBacks.onUpdateCurrentRecord(enumModel);
            callBacks.onUpdateModel(state.enumModel);
            callBacks.onUpdateRecordSelection(true);
            callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
        }
    };

    const fieldItems: ReactNode[] = [];
    enumModel.fields.forEach((field: SimpleField) => {
        if (!(field as SimpleField).isEditInProgress) {
            fieldItems.push(
                <FieldItem
                    field={field as SimpleField}
                    onDeleteClick={handleFieldDelete}
                    onEditCLick={handleFieldEdit}
                />
            )
        } else {
            fieldItems.push(
                <FieldEditor
                    field={field}
                    nameError={fieldNameError}
                    onChange={handleFieldEditorChange}
                    onDeleteClick={handleFieldDelete}
                    onFocusLost={handleSubItemFocusLost}
                    onEnterPress={null}
                />
            );
        }
    });

    const recordTypeNVisibility = `${enumModel.isTypeDefinition ? `enum` : ""}`;
    const openBraceTokens = `{ ${enumModel.isClosed ? "|" : ""}`;
    const recordEn = `}`;
    const typeDescName = `${enumModel.isTypeDefinition ? "" : `${enumModel.name}`}`;
    const typeDefName = enumModel.name ? enumModel.name : "";

    useEffect(() => {
        // Checks whether enum is clicked to edit, if so resetting field insertion
        if (state.isRecordSelected) {
            if (state.currentRecord !== enumModel) {
                // Setting all other objects enum editing false except the enum being edited;
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
                className={enumModel.isActive ? recordClasses.activeRecordEditorWrapper :
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
                        {enumModel.isTypeDefinition && isRecordEditInProgress && (
                            <div className={recordClasses.typeTextFieldWrapper}>
                                <FormTextInput
                                    dataTestId="enum-name"
                                    customProps={{
                                        isErrored: false,
                                        focused: true
                                    }}
                                    defaultValue={typeDefName}
                                    onKeyUp={handleKeyUp}
                                    onBlur={handleOnBlur}
                                    errorMessage={""}
                                    placeholder={"Enum name"}
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
                        <div className={enumModel.isTypeDefinition ? recordClasses.typeDefEditBtnWrapper : recordClasses.recordHeaderBtnWrapper}>
                            <div className={recordClasses.actionBtnWrapper}>
                                <EditButton onClick={handleRecordClick}/>
                            </div>
                            {!enumModel.isTypeDefinition && (
                                <div className={recordClasses.actionBtnWrapper}>
                                    <DeleteButton onClick={handleRecordDelete}/>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {isRecordExpanded && (
                    <div className={enumModel?.isActive ? recordClasses.activeRecordSubFieldWrapper : recordClasses.recordSubFieldWrapper}>
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
                </div>
            </div>
        </div>
    )
}
