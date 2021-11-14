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
import React  from "react";

import { RecordTypeDesc } from "@ballerina/syntax-tree";
import { Typography } from "@material-ui/core";
import classnames from "classnames";

import DeleteButton from "../../../../../assets/icons/DeleteButton";
import { useDiagramContext } from "../../../../../Contexts/Diagram";
import { FormState, useRecordEditorContext } from "../../../../../Contexts/RecordEditor";
import { SelectDropdownWithButton } from "../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { variableTypes } from "../../ProcessConfigForms/ProcessForm/AddVariableConfig";
import { recordStyles } from "../style";
import { RecordModel, SimpleField } from "../types";

export interface FieldEditorProps {
    field: SimpleField;
    onDeleteClick: (field: SimpleField) => void;
    onChange: (event: any) => void;
    onFocusLost: (field: SimpleField) => void;
    onEnterPress: (field: SimpleField) => void;
}

export function FieldEditor(props: FieldEditorProps) {
    const { field, onDeleteClick, onChange, onEnterPress, onFocusLost } = props;

    const recordClasses = recordStyles();

    const { props: { stSymbolInfo } } = useDiagramContext();
    const { state, callBacks } = useRecordEditorContext();

    const typeProperty = `${field.isArray ? "[]" : ""}${field.isFieldTypeOptional ? "?" : ""}`;
    const allVariableTypes: string[] = variableTypes.slice();
    allVariableTypes.push("record");
    stSymbolInfo.recordTypeDescriptions.forEach((value: RecordTypeDesc) => {
        allVariableTypes.push(value?.typeData?.typeSymbol?.name);
    })

    const handleDelete = () => {
        onDeleteClick(field);
    };
    const handleKeyUp = (event: any) => {
        onChange(event)
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
        } else {
            state.currentField.type = selectedType;
        }
        callBacks.onUpdateCurrentField(state.currentField);
    };
    const handleFocusLost = (event: any) => {
        onFocusLost(event);
    };

    return (
        <div className={recordClasses.itemWrapper}>
            <div className={recordClasses.editItemContentWrapper}>
                <div className={recordClasses.itemLabelWrapper}>
                    <div className={recordClasses.editTypeWrapper}>
                        <SelectDropdownWithButton
                            dataTestId="field-type"
                            defaultValue={field.type}
                            customProps={
                                {
                                    values: allVariableTypes,
                                    disableCreateNew: true
                                }
                            }
                            onChange={handleTypeSelect}
                        />
                    </div>
                    {typeProperty && (
                        <Typography
                            variant='body2'
                            className={classnames(recordClasses.editOptionalNArray)}
                        >
                            {typeProperty}
                        </Typography>
                    )}
                    <div className={recordClasses.editNameWrapper}>
                        <FormTextInput
                            dataTestId="record-name"
                            customProps={{
                                isErrored: false,
                                focused: true
                            }}
                            defaultValue={field.name}
                            onKeyUp={handleKeyUp}
                            onBlur={handleFocusLost}
                            errorMessage={""}
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
