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

import { RecordTypeDesc, STKindChecker, TypeDefinition } from "@ballerina/syntax-tree";

import { FormState, Provider as RecordEditorProvider } from "../../../../Contexts/RecordEditor";

import { Record } from "./Record";
import { RecordModel } from "./types";
import { getRecordModel } from "./utils";

export interface RecordEditorProps {
    name: string;
    isNewModel: boolean;
    model?: TypeDefinition;
    onCancel?: () => void;
    onSave?: () => void;
}

export function RecordEditor(props: RecordEditorProps) {
    const { isNewModel, name, onCancel, onSave, model } = props;

    let recordModel: RecordModel;
    if (model && STKindChecker.isTypeDefinition(model)) {
        const typeName = model.typeName.value;
        const typeDesc = model.typeDescriptor as RecordTypeDesc;
        recordModel = getRecordModel(typeDesc, typeName, true, "record")
    } else if (isNewModel) {
        recordModel = {
            name,
            isClosed: false,
            isOptional: false,
            isArray: false,
            fields: [],
            type: "record",
            isInline: true,
        }
    }

    return (
        <RecordEditorProvider
            state={{
                recordModel,
                currentForm: FormState.EDIT_RECORD_FORM,
                currentRecord: recordModel
            }}
        >
            {recordModel && (
                <Record
                    recordModel={recordModel}
                    onSave={null}
                    onCancel={null}
                />
            )}
        </RecordEditorProvider>
    );
}
