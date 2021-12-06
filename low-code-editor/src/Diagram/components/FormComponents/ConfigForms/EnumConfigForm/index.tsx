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
import React, { useContext } from 'react';

import { NodePosition, RecordTypeDesc, STKindChecker, TypeDefinition } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { FormState, Provider as EnumEditorProvider} from "../../../../../Contexts/EnumEditor"

import { Enumeration } from "./Enumeration";
import { EnumModel } from "./types";
import { getEnumModel } from "./utils";

export interface RecordEditorProps {
    name: string;
    existingModel?: EnumModel;
    model?: RecordTypeDesc | TypeDefinition;
    targetPosition?: NodePosition;
    isTypeDefinition?: boolean;
    onCancel: () => void;
    onSave: (typeDesc: string, recModel: EnumModel) => void;
}

export function EnumConfigForm(props: RecordEditorProps) {
    const { existingModel, name, onCancel, onSave, model, targetPosition, isTypeDefinition = true } = props;
    let enumModel: EnumModel;
    if (model && STKindChecker.isEnumDeclaration(model)) {
        enumModel = getEnumModel(model, model.identifier.value, true, "enum");
        enumModel.isActive = true;
    } else if (existingModel) {
        enumModel = existingModel;
    } else if (targetPosition) {
        // Constructs a new model
        enumModel = {
            name,
            isClosed: false,
            isOptional: false,
            isArray: false,
            fields: [],
            type: "enum",
            isInline: true,
            isActive: true
        }
    }
    enumModel.isTypeDefinition = (isTypeDefinition || STKindChecker.isTypeDefinition(model));

    return (
        <EnumEditorProvider
            state={{
                enumModel,
                currentForm: FormState.EDIT_RECORD_FORM,
                currentRecord: enumModel,
                sourceModel: model,
                isEditorInvalid: false,
                targetPosition,
                onSave,
                onCancel
            }}
        >
            {enumModel && (
                <Enumeration/>
            )}
        </EnumEditorProvider>
    );
}
