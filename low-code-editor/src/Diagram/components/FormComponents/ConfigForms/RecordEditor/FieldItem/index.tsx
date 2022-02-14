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

import { Typography } from "@material-ui/core";
import classnames from "classnames";

import DeleteButton from "../../../../../../assets/icons/DeleteButton";
import EditButton from "../../../../../../assets/icons/EditButton";
import { useRecordEditorContext } from "../../../../../../Contexts/RecordEditor";
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

    const { state } = useRecordEditorContext();

    const handleDelete = () => {
        onDeleteClick(field);
    };

    const handleEdit = () => {
        onEditCLick(field);
    };

    return (
        <div className={recordClasses.itemWrapper} onClick={handleEdit}>
            <div className={recordClasses.itemContentWrapper}>
                <div className={recordClasses.itemLabelWrapper}>
                    <Typography
                        variant='body2'
                        className={classnames(recordClasses.typeWrapper)}
                    >
                        {field.type}
                    </Typography>
                    <Typography
                        variant='body2'
                        className={classnames(recordClasses.nameWrapper)}
                    >
                        {field.name}
                    </Typography>
                    {field.isFieldOptional && (
                        <Typography
                            variant='body2'
                            className={classnames(recordClasses.singleTokenWrapper)}
                        >
                            ?
                        </Typography>
                    )}
                    {field.value && (
                        <div className={recordClasses.recordEditorContainer}>
                            <Typography
                                variant='body2'
                                className={classnames(recordClasses.equalTokenWrapper)}
                            >
                                =
                            </Typography>
                            <Typography
                                variant='body2'
                                className={classnames(recordClasses.defaultValWrapper)}
                            >
                                {field.value}
                            </Typography>
                        </div>
                    )}
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
                            <EditButton onClick={handleEdit}/>
                        </div>
                        <div data-testid={`delete-${field.name}`} className={recordClasses.actionBtnWrapper}>
                            <DeleteButton onClick={handleDelete}/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
