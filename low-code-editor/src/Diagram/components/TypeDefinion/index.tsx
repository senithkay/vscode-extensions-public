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
import React, { useState } from "react"

import { RecordFieldWithDefaultValue, RecordTypeDesc, STNode, TypeDefinition } from "@ballerina/syntax-tree";

import DeleteButton from "../../../assets/icons/DeleteButton";
import EditButton from "../../../assets/icons/EditButton";
import RecordIcon from "../../../assets/icons/RecordIcon";
import { TopLevelPlus } from "../TopLevelPlus";

import "./style.scss";

export const RECORD_MARGIN_LEFT: number = 24.5;
export const RECORD_PLUS_OFFSET: number = 7.5;

export interface TypeDefComponentProps {
    model: STNode;
}

export function TypeDefinitionComponent(props: TypeDefComponentProps) {
    const { model } = props;

    const [isEditable, setIsEditable] = useState(false);

    const recordModel: TypeDefinition = model as TypeDefinition;

    const varName = recordModel.typeName.value;

    const handleMouseEnter = () => {
        setIsEditable(true);
    };
    const handleMouseLeave = () => {
        setIsEditable(false);
    };

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
        <>
            <div className="record-comp" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}  >
                <div className="record-header" >
                    <div className="record-icon">
                        <RecordIcon />
                    </div>
                    <div className="record-type">
                        Record
                    </div>
                    <div className="record-name">
                        {varName}
                    </div>
                    {isEditable && (
                        <>
                            <div className="record-edit">
                                <EditButton />
                            </div>
                            <div className="record-delete">
                                <DeleteButton />
                            </div>
                        </>
                    )}
                </div>
                <div className="record-separator" />
                {isEditable && (
                    <>
                        <div className="record-fields" >
                            {record.map(recordfield => (
                                <div className="record-field" key={recordfield[1]}>
                                    <div className="record-field-type">
                                        {recordfield[0]}
                                    </div>
                                    <div className="record-field-name">
                                        {recordfield[1]};
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
            {/* ToDo: Sort out top level component
            <TopLevelPlus
                margin={{ top: RECORD_PLUS_OFFSET, bottom: RECORD_PLUS_OFFSET, left: RECORD_MARGIN_LEFT }}
            /> */}
        </>
    );
}
