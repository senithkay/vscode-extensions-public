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
import React, { ReactNode, useRef, useState } from "react";

import { Typography } from "@material-ui/core";
import classnames from "classnames";

import { AddIcon } from "../../../../../assets/icons";
import { FieldEditor } from "../FieldEditor";
import { FieldItem } from "../FieldItem";
import { recordStyles } from "../style";
import { RecordModel, SimpleField } from "../types";

export interface CodePanelProps {
    recordModel: RecordModel;
}

export function RecordField(props: CodePanelProps) {
    const { recordModel } = props;

    const recordClasses = recordStyles();

    // const recordModelRef = useRef(recordModel);
    const [isFieldAddInProgress, setIsFieldAddInProgress] = useState(false);

    const handleCancel = () => {
        setIsFieldAddInProgress(false);
    };

    const handleAddField = () => {
        setIsFieldAddInProgress(true);
    };

    const fieldItems: ReactNode[] = [];
    recordModel.fields.forEach((field: SimpleField | RecordModel) => {
        if (field.type !== "record") {
            fieldItems.push(<FieldItem field={field as SimpleField} onDeleteClick={null} onEditCLick={null} />)
        } else {
            fieldItems.push(<RecordField recordModel={field as RecordModel} />)
        }
    });

    return (
        <div>
            <div className={recordClasses.recordEditorWrapper}>
                <Typography
                    variant='body2'
                    className={classnames(recordClasses.recordCode)}
                >
                    {`record {`}
                </Typography>
                {/*<p className={classes.startCode}> record {"{"} </p>*/}
                {fieldItems}
                {!isFieldAddInProgress && (
                    <div className={recordClasses.addFieldBtnWrap} onClick={handleAddField}>
                        <AddIcon/>
                        <p>Add Field</p>
                    </div>
                )}

                {isFieldAddInProgress && (
                    <FieldEditor
                        addedFields={recordModel.fields}
                        onSaveFiled={handleAddField}
                        onCancel={handleCancel}
                    />
                )}
                <Typography
                    variant='body2'
                    className={classnames(recordClasses.recordCode)}
                >
                    {`} ${recordModel.name};`}
                </Typography>
            </div>
        </div>
    )
}
