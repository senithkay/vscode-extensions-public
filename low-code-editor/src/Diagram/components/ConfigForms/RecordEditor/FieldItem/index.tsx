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

import DeleteButton from "../../../../../assets/icons/DeleteButton";
import EditButton from "../../../../../assets/icons/EditButton";
import { recordStyles } from "../style";
import { SimpleField } from "../types";

export interface FieldItemProps {
    field: SimpleField;
    onEditCLick: (field: SimpleField) => void;
    onDeleteClick: (field: SimpleField) => void;
}

export function FieldItem(props: FieldItemProps) {
    const { field, onDeleteClick, onEditCLick } = props;

    const recordClasses = recordStyles();

    const [isFieldActionsVisible, setIsFieldActionsVisible] = useState(false);

    const segmentLabel = `${field.type}${field.isArray ? "[]" : ""}${field.isFieldTypeOptional ? "?" :
        ""} ${field.name}${field.isFieldOptional ? "?" : ""}${field.value ? ` = ${field.value}` : ""};`;

    const handleDelete = () => {
        onDeleteClick(field);
    };

    const handleEdit = () => {
        onEditCLick(field);
    };

    const handleMouseEnter = () => {
        setIsFieldActionsVisible(true);
    };

    const handleMouseLeave = () => {
        setIsFieldActionsVisible(false);
    };

    return (
        <div className={recordClasses.itemWrapper} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div className={field.isActive ? recordClasses.activeItemContentWrapper : recordClasses.itemContentWrapper}>
                <div className={recordClasses.itemLabel}>
                    {segmentLabel}
                </div>
                {isFieldActionsVisible && (
                    <div className={recordClasses.btnWrapper}>
                        <div className={recordClasses.actionBtnWrapper} onClick={handleEdit}>
                            <EditButton />
                        </div>
                        <div className={recordClasses.actionBtnWrapper} onClick={handleDelete}>
                            <DeleteButton />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
