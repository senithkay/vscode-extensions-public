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
import React, {ReactNode, useContext, useEffect, useState} from "react";

import { Typography } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";
import classnames from "classnames";

import { AddIcon } from "../../../../../assets/icons";
import { Context, FormState } from "../../../../../Contexts/RecordEditor";
import { ButtonWithIcon } from "../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { FieldItem } from "../FieldItem";
import { recordStyles } from "../style";
import { RecordModel, SimpleField } from "../types";

export interface CodePanelProps {
    recordModel: RecordModel;
}

export function RecordField(props: CodePanelProps) {
    const { recordModel } = props;

    const recordClasses = recordStyles();

    const { state, callBacks } = useContext(Context);

    const [isFieldAddInProgress, setIsFieldAddInProgress] = useState(false);

    const handleFieldDelete = (field: SimpleField) => {
        const index = recordModel.fields.indexOf(field);
        if (index !== -1) {
            recordModel.fields.splice(index, 1);
            callBacks.onUpdateModel(state.recordModel);
        }
    };

    const handleAddField = () => {
        callBacks.onChangeFormState(FormState.ADD_FIELD);
        callBacks.onUpdateCurrentField(undefined);
        callBacks.onUpdateCurrentRecord(recordModel);
        setIsFieldAddInProgress(true);
    };

    const fieldItems: ReactNode[] = [];
    recordModel.fields.forEach((field: SimpleField | RecordModel) => {
        if (field.type !== "record") {
            fieldItems.push(
                <FieldItem
                    field={field as SimpleField}
                    onDeleteClick={handleFieldDelete}
                    onEditCLick={null}
                />
            )
        } else {
            fieldItems.push(<RecordField recordModel={field as RecordModel} />)
        }
    });

    if (isFieldAddInProgress) {
        // Adding draft field
        fieldItems.push(
            <div className={recordClasses.itemWrapper}>
                <div className={recordClasses.itemLabel}>
                    <ButtonWithIcon
                        onClick={null}
                        icon={<CloseRounded fontSize="small" />}
                        className={recordClasses.iconBtn}
                    />
                </div>
            </div>
        )
    }

    const recordBegin = `record { ${recordModel.isClosed ? "|" : ""}`;

    const recordEnd = `${recordModel.isClosed ? "| " : ""}} ${recordModel.isArray ? "[] " : " "}${
        recordModel.name}${recordModel.isOptional ? " ?" : ""};`;

    useEffect(() => {
        // Checks whether add from is completed and reset field addition
        if ((state.currentForm !== FormState.ADD_FIELD) || (state.currentRecord.name !== recordModel.name)) {
            setIsFieldAddInProgress(false);
        }
    }, [state.currentForm, state.currentRecord?.name]);

    return (
        <div>
            <div className={recordClasses.recordEditorWrapper}>
                <Typography
                    variant='body2'
                    className={classnames(recordClasses.recordCode)}
                >
                    {recordBegin}
                </Typography>
                {fieldItems}
                {!isFieldAddInProgress && (
                    <div className={recordClasses.addFieldBtnWrap} onClick={handleAddField}>
                        <AddIcon/>
                        <p>Add Field</p>
                    </div>
                )}
                <Typography
                    variant='body2'
                    className={classnames(recordClasses.recordCode)}
                >
                    {recordEnd}
                </Typography>
            </div>
        </div>
    )
}
