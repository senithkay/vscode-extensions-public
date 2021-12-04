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
import React from 'react';

import { NodePosition, RecordTypeDesc, STKindChecker, TypeDefinition } from "@wso2-enterprise/syntax-tree";

import { FormState, Provider as RecordEditorProvider} from "../../../../../Contexts/RecordEditor"

import { CodePanel } from "./CodePanel";
import { recordStyles } from "./style";
import { RecordModel } from "./types";
import { getRecordModel } from "./utils";

export interface RecordEditorProps {
    name: string;
    existingModel?: RecordModel;
    model?: RecordTypeDesc | TypeDefinition;
    targetPosition?: NodePosition;
    isTypeDefinition?: boolean;
    onCancel: () => void;
    onSave: (typeDesc: string, recModel: RecordModel) => void;
}

export function RecordEditor(props: RecordEditorProps) {
    const { existingModel, name, onCancel, onSave, model, targetPosition, isTypeDefinition = true } = props;

    const recordClasses = recordStyles();

    let recordModel: RecordModel;
    if (model && STKindChecker.isRecordTypeDesc(model)) {
        recordModel = getRecordModel(model, name, true, "record");
        recordModel.isActive = true;
    } else if (model && STKindChecker.isTypeDefinition(model)) {
        if (STKindChecker.isRecordTypeDesc(model.typeDescriptor)) {
            recordModel = getRecordModel(model.typeDescriptor, model.typeName.value, true, "record");
            recordModel.isActive = true;
            recordModel.isPublic = (model?.visibilityQualifier?.value === "public");
        }
    } else if (existingModel) {
        recordModel = existingModel;
    } else if (targetPosition) {
        // Constructs a new model
        recordModel = {
            name,
            isClosed: false,
            isOptional: false,
            isArray: false,
            fields: [],
            type: "record",
            isInline: true,
            isActive: true
        }
    }
    recordModel.isTypeDefinition = (isTypeDefinition || STKindChecker.isTypeDefinition(model));

    return (
        <RecordEditorProvider
            state={{
                recordModel,
                currentForm: FormState.EDIT_RECORD_FORM,
                currentRecord: recordModel,
                sourceModel: model,
                isEditorInvalid: false,
                targetPosition,
                onSave,
                onCancel
            }}
        >
            {recordModel && (
                <div className={recordClasses.recordEditorContainer}>
                    <CodePanel />
                </div>
            )}
        </RecordEditorProvider>
    );
}
