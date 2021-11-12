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
import { useRecordEditorContext } from "../../../../../Contexts/RecordEditor";
import { SelectDropdownWithButton } from "../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { variableTypes } from "../../ProcessConfigForms/ProcessForm/AddVariableConfig";
import { recordStyles } from "../style";
import { SimpleField } from "../types";

export interface FieldEditorProps {
    field: SimpleField;
    onDeleteClick: () => void;
    onFocusLost: (field: SimpleField) => void;
    onEnterPress: (field: SimpleField) => void;
}

export function FieldEditor(props: FieldEditorProps) {
    const { field, onDeleteClick, onEnterPress, onFocusLost } = props;

    const recordClasses = recordStyles();

    const { props: { stSymbolInfo } } = useDiagramContext();
    const { state } = useRecordEditorContext();

    const typeProperty = `${field.isArray ? "[]" : ""}${field.isFieldTypeOptional ? "?" : ""}`;
    const selectedType = field.type ? field.type : "int";
    const allVariableTypes: string[] = variableTypes.slice();
    allVariableTypes.push("record");
    stSymbolInfo.recordTypeDescriptions.forEach((value: RecordTypeDesc) => {
        allVariableTypes.push(value?.typeData?.typeSymbol?.name);
    })

    const handleDelete = () => {
        onDeleteClick();
    };
    const handleTypeSelect = () => {
    //    TODO: implement
    };

    return (
        <div className={recordClasses.itemWrapper}>
            <div className={field.isActive ? recordClasses.activeItemContentWrapper : recordClasses.editItemContentWrapper}>
                <div className={recordClasses.itemLabelWrapper}>
                    <div className={recordClasses.editTypeWrapper}>
                        <SelectDropdownWithButton
                            dataTestId="field-type"
                            defaultValue={selectedType}
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
                                isErrored: false
                            }}
                            defaultValue={field.name}
                            // onKeyUp={handleKeyUp}
                            // onBlur={handleOnBlur}
                            errorMessage={""}
                            placeholder={"Enter name"}
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
                        className={classnames(recordClasses.singleTokenWrapper)}
                    >
                        ;
                    </Typography>
                </div>
                {!state.isEditorInvalid && (
                    <div className={recordClasses.btnWrapper}>
                        <div className={recordClasses.actionBtnWrapper}>
                            <DeleteButton  onClick={handleDelete}/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
