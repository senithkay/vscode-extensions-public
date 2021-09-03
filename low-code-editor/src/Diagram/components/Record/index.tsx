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
import React from "react"

import { RecordTypeDesc, RecordFieldWithDefaultValue, STNode, TypeDefinition } from "@ballerina/syntax-tree";

import { ModuleMemberViewState } from "../../view-state/module-member";

import DeleteButton from "../../../assets/icons/DeleteButton";
import EditButton from "../../../assets/icons/EditButton";

import "./style.scss";


export interface RecordProps {
    model: STNode;
}

export function Record(props: RecordProps) {
    const { model } = props;

    const recordModel: TypeDefinition = model as TypeDefinition;
    const viewState: ModuleMemberViewState = recordModel.viewState;

    const varName = recordModel.typeName.value;
    const type = (recordModel.typeDescriptor as RecordTypeDesc).recordKeyword.value;

    const record = [];
    for (const field of (recordModel.typeDescriptor as RecordTypeDesc).fields) {
        if (field.kind === "RecordField") {
            const fieldName = field.fieldName.value;
            const fieldType = field.typeName.source?.trim();
            record.push([fieldType, fieldName]);
        } else if (field.kind === "RecordFieldWithDefaultValue") {
            const fieldName = field.fieldName.value;
            const fieldType = field.typeName.source?.trim();
            const fieldValue = (field as RecordFieldWithDefaultValue).expression.source
            record.push([fieldType, fieldName + " = " + fieldValue]);
        }
    }

    return (
        <div className="record-comp" >
            <div className="record-header" >
                <div className="record-icon" />
                <div className="record-type">
                    Record
                </div>
                <div className="record-name">
                    {varName}
                </div>
                <div className="record-edit">
                    <EditButton />
                </div>
                <div className="record-delete">
                    <DeleteButton />
                </div>
            </div>
            <div className="record-separator" />
            <div className="record-fields" >
                {record.map(recordfield => (
                    <div className="record-field">
                        <div className="record-field-type">
                            {recordfield[0]}
                        </div>
                        <div className="record-field-name">
                            {recordfield[1]};
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
