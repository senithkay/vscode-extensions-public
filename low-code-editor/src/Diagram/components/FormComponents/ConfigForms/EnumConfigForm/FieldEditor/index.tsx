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
import { enumStyles } from "../style";
import { EnumModel, SimpleField } from "../types";

export interface FieldEditorProps {
    field: SimpleField;
    nameError?: string;
    onDeleteClick: (field: SimpleField) => void;
    onChange: (event: any) => void;
    onFocusLost: (field: SimpleField) => void;
    onEnterPress?: (field: SimpleField) => void;
}

export function FieldEditor(props: FieldEditorProps) {
    const { field, nameError, onDeleteClick, onChange, onFocusLost } = props;

    const enumClasses = enumStyles();

    const handleDelete = () => {
        onDeleteClick(field);
    };
    const handleKeyUp = (event: any) => {
        onChange(event);
    };

    const handleFocusLost = (event: any) => {
        onFocusLost(event);
    };

    return (
        <div className={enumClasses.itemWrapper}>
            <div className={enumClasses.editItemContentWrapper}>
                <div className={enumClasses.itemLabelWrapper}>
                    <div className={enumClasses.editNameWrapper}>
                        <FormTextInput
                            dataTestId="member-name"
                            customProps={{
                                isErrored: (nameError !== ""),
                                focused: true
                            }}
                            errorMessage={nameError}
                            defaultValue={field?.name}
                            onKeyUp={handleKeyUp}
                            onBlur={handleFocusLost}
                            placeholder={"Member name"}
                            size="small"
                        />
                        <Typography
                            variant='body2'
                            className={classnames(enumClasses.editSingleTokenWrapper)}
                        >
                            ,
                        </Typography>
                    </div>
                    <div className={enumClasses.editFieldDelBtn}>
                        <DeleteButton onClick={handleDelete} />
                    </div>
                </div>

            </div>
        </div>
    );
}
