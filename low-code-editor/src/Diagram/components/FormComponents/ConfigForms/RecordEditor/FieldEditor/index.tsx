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
import React, { useState } from "react";
import { useIntl } from "react-intl";

import { Typography } from "@material-ui/core";
import classnames from "classnames";

import DeleteButton from "../../../../../../assets/icons/DeleteButton";
import { FormState, useRecordEditorContext } from "../../../../../../Contexts/RecordEditor";
import { FormTextInput } from "../../../FormFieldComponents/TextField/FormTextInput";
import { VariableTypeInput, VariableTypeInputProps } from "../../Components/VariableTypeInput";
import { recordStyles } from "../style";
import { RecordModel, SimpleField } from "../types";

export interface FieldEditorProps {
    field: SimpleField;
    nameError?: string;
    onDeleteClick: (field: SimpleField) => void;
    onChange: (event: any) => void;
    onFocusLost: (field: SimpleField) => void;
    onEnterPress?: (field: SimpleField) => void;
}

export function FieldEditor(props: FieldEditorProps) {
    const { field, nameError, onDeleteClick, onChange, onEnterPress, onFocusLost } = props;

    const recordClasses = recordStyles();
    const intl = useIntl();
    const typeLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.type.label",
        defaultMessage: "Type"
    });

    const { state, callBacks } = useRecordEditorContext();

    const [typeEditorFocussed, setTypeEditorFocussed] = useState<boolean>(false);
    const [typeEditorVisible, setTypeEditorVisible] = useState<boolean>(false);

    const typeProperty = `${field.isArray ? "[]" : ""}${field.isFieldTypeOptional ? "?" : ""}`;

    const handleDelete = () => {
        onDeleteClick(field);
    };
    const handleKeyUp = (event: any) => {
        setTypeEditorFocussed(false);
        onChange(event);
    };
    const handleTypeSelect = (selectedType: string) => {
        if (selectedType === "record") {
            if (state.currentRecord?.isActive) {
                state.currentRecord.isActive = false;
            }

            // Remove the draft field and add new record model
            const index = state.currentRecord.fields.indexOf(field);
            if (index !== -1) {
                state.currentRecord.fields.splice(index, 1);
            }
            const newRecordModel: RecordModel = {
                name: state.currentField.name,
                isArray: false,
                isOptional: false,
                isActive: true,
                type: selectedType,
                isTypeDefinition: false,
                isInline: true,
                fields: []
            };
            state.currentRecord.fields.push(newRecordModel);
            state.currentRecord = newRecordModel;
            callBacks.onChangeFormState(FormState.EDIT_RECORD_FORM);
            callBacks.onUpdateCurrentRecord(state.currentRecord);
            callBacks.updateEditorValidity(false);
            callBacks.onUpdateCurrentField(undefined);
        } else {
            state.currentField.type = selectedType;
        }
        callBacks.onUpdateCurrentField(state.currentField);
    };
    const handleFocusLost = (event: any) => {
        onFocusLost(event);
    };
    const validateTypeName = (fName: string, isInvalidFromField: boolean) => {
        state.currentField.isTypeInvalid = isInvalidFromField;
        callBacks.onUpdateCurrentField(state.currentField);
        callBacks.updateEditorValidity(isInvalidFromField || state.currentField.isNameInvalid ||
            state.currentField.isValueInvalid);
    };
    const handleTypeClick = () => {
        setTypeEditorVisible(true);
        setTypeEditorFocussed(true);
    };

    const varTypeProps: VariableTypeInputProps = {
        displayName: typeLabel,
        value: `${state.currentField.type}`,
        hideLabel: true,
        focus: typeEditorFocussed,
        onValueChange: handleTypeSelect,
        validateExpression: validateTypeName,
        position: state.sourceModel ? {
            ...state.sourceModel.position,
            endLine: state.sourceModel.position?.startLine,
            endColumn: state.sourceModel.position?.startColumn,
        } : state.targetPosition,
        overrideTemplate: {
            defaultCodeSnippet: `type tempRecordName record {  varType; };`,
            targetColumn: 30
        },
        ignoredCompletions: ['tempRecordName'],
        additionalCompletions: ['record'],
    };

    return (
        <div className={recordClasses.itemWrapper}>
            <div className={recordClasses.editItemContentWrapper}>
                <div className={recordClasses.itemLabelWrapper}>
                    <div className={recordClasses.editTypeWrapper}>
                        {typeEditorVisible ? (
                            <VariableTypeInput {...varTypeProps} key={`${state.currentField.name}-typeSelector`}/>
                        ) : (
                            <FormTextInput
                                dataTestId="field-type"
                                customProps={{
                                    isErrored: false,
                                    focused: false
                                }}
                                defaultValue={field.type}
                                onClick={handleTypeClick}
                                placeholder={"Type"}
                            />
                        )}
                    </div>
                    <div className={recordClasses.editNameWrapper}>
                        <FormTextInput
                            dataTestId="field-name"
                            customProps={{
                                isErrored: (nameError !== ""),
                                focused: false
                            }}
                            errorMessage={nameError}
                            defaultValue={field.name}
                            onKeyUp={handleKeyUp}
                            onBlur={handleFocusLost}
                            placeholder={"Field name"}
                            size="small"
                        />
                    </div>
                    {field.isFieldOptional && (
                        <Typography
                            variant='body2'
                            className={classnames(recordClasses.editSingleTokenWrapper)}
                        >
                            ?
                        </Typography>
                    )}
                    {/*{field.value && (*/}
                    {/*    <div className={recordClasses.recordEditorContainer}>*/}
                    {/*        <Typography*/}
                    {/*            variant='body2'*/}
                    {/*            className={classnames(recordClasses.equalTokenWrapper)}*/}
                    {/*        >*/}
                    {/*            =*/}
                    {/*        </Typography>*/}
                    {/*        <Typography*/}
                    {/*            variant='body2'*/}
                    {/*            className={classnames(recordClasses.defaultValWrapper)}*/}
                    {/*        >*/}
                    {/*            {field.value}*/}
                    {/*        </Typography>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                    <Typography
                        variant='body2'
                        className={classnames(recordClasses.editSingleTokenWrapper)}
                    >
                        ;
                    </Typography>
                    <div className={recordClasses.editFieldDelBtn}>
                        <DeleteButton onClick={handleDelete}/>
                    </div>
                </div>

            </div>
        </div>
    );
}
