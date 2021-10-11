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
import React, {ReactNode, useRef, useState} from 'react';

import { AddIcon } from "../../../../../assets/icons";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { FieldEditor } from "../FieldEditor";
import { FieldItem } from "../FieldItem";
import { recordStyles } from "../style";
import { RecordModel, SimpleField } from "../types";

export interface RecordProps {
    recordModel: RecordModel;
    onSave: () => void;
    onCancel: () => void;
}

export function Record(props: RecordProps) {
    const { recordModel, onSave, onCancel } = props;
    const recordClasses = recordStyles();

    const [isFieldAddInProgress, setIsFieldAddInProgress] = useState(false);
    const recordModelRef = useRef(recordModel);

    const handleCancel = () => {
        setIsFieldAddInProgress(false);
    };

    const handleAddField = () => {
        setIsFieldAddInProgress(true);
    };
    const handleSaveField = (field: SimpleField) => {
        recordModelRef.current.fields.push(field);
    };

    const fieldItems: ReactNode[] = [];
    recordModelRef.current.fields.forEach((field: SimpleField) => {
        fieldItems.push(<FieldItem field={field} onDeleteClick={null} onEditCLick={null} />)
    })

    return (
        <div className={recordClasses.recordEditorWrapper}>
            {fieldItems}
            {!isFieldAddInProgress && (
                <div>
                    <button
                        onClick={handleAddField}
                        className={recordClasses.addFieldBtn}
                    >
                        <div className={recordClasses.addFieldBtnWrap}>
                            <AddIcon />
                            <p>Add Field</p>
                        </div>
                    </button>
                </div>
            )}

            {isFieldAddInProgress && (
                <FieldEditor
                    addedFields={recordModelRef.current.fields}
                    onSaveFiled={handleSaveField}
                    onCancel={handleCancel}
                />
            )}

            <div className={recordClasses.buttonWrapper}>
                <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                <PrimaryButton
                    dataTestId={"record-from-json-save-btn"}
                    text={"Save"}
                    // disabled={isMutationInProgress || !isFormValid}
                    fullWidth={false}
                    onClick={null}
                />
            </div>
        </div>
    );
}
