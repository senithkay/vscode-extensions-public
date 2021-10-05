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
import React  from 'react';

import {RecordTypeDesc, STKindChecker, STNode, TypeDefinition} from "@ballerina/syntax-tree";

import { DraftInsertPosition } from "../../../view-state/draft";

import { Record } from "./Record";
import { RecordFromJson } from "./RecordFromJson";
import { getRecordModel } from "./utils";

export interface RecordEditorProps {
    model?: TypeDefinition;
    targetPosition?: DraftInsertPosition;
    onCancel?: () => void;
}

export function RecordEditor(props: RecordEditorProps) {
    const { model, targetPosition, onCancel } = props;

    const recordModel = (STKindChecker.isRecordTypeDesc(model.typeDescriptor) && (targetPosition === undefined)) ?
        getRecordModel(model.typeDescriptor as RecordTypeDesc, model.typeName.value, false) : null;

    return (
        <div>
            {targetPosition && (
                <div>
                    <RecordFromJson onCancel={onCancel} targetPosition={targetPosition} />
                </div>
            )}
            {model && (
                <div>
                    <Record recordModel={recordModel} onCancel={onCancel} onSave={null} />
                </div>
            )}
        </div>
    );
}
