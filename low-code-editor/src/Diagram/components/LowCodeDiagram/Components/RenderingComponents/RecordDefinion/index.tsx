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
// tslint:disable: jsx-wrap-multiline
import React, { useState } from "react"

import { RecordFieldWithDefaultValue, RecordTypeDesc, STKindChecker, TypeDefinition } from "@ballerina/syntax-tree";

import DeleteButton from "../../../../../../assets/icons/DeleteButton";
import EditButton from "../../../../../../assets/icons/EditButton";
import RecordIcon from "../../../../../../assets/icons/RecordIcon";
import { ComponentExpandButton } from "../../ComponentExpandButton";

import "./style.scss";


export const RECORD_MARGIN_LEFT: number = 24.5;
export const RECORD_PLUS_OFFSET: number = 7.5;

export interface RecordDefComponentProps {
    model: TypeDefinition;
}

export function RecordDefinitionComponent(props: RecordDefComponentProps) {
    const { model } = props;

    const [isEditable, setIsEditable] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleMouseEnter = () => {
        setIsEditable(true);
    };
    const handleMouseLeave = () => {
        setIsEditable(false);
    };
    const onExpandClick = () => {
        setIsExpanded(!isExpanded);
    };

    const component: JSX.Element[] = [];

    if (STKindChecker.isRecordTypeDesc(model.typeDescriptor)) {

        const recordModel: TypeDefinition = model as TypeDefinition;

        const varName = recordModel.typeName.value;

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

        component.push(
            <div className="record-comp" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="record-header" >
                    <div className="record-content">
                        <div className="record-icon">
                            <RecordIcon />
                        </div>
                        <div className="record-type">
                            Record
                        </div>
                        <div className="record-name">
                            {varName}
                        </div>
                    </div>
                    {isEditable && (
                        <div className="record-amendment-options">
                            <div className="record-edit">
                                <EditButton />
                            </div>
                            <div className="record-delete">
                                <DeleteButton />
                            </div>
                            <div className="record-expand">
                                <ComponentExpandButton isExpanded={isExpanded} onClick={onExpandClick} />
                            </div>
                        </div>
                    )}
                </div>
                <div className="record-separator" />
                {isExpanded && (
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
        )
    } else {
        // ToDo : sort out how to display general typedefinitions
        component.push(
            <div className="record-comp" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="record-header" >
                    <div className="record-content">
                        <div className="record-icon">
                            <RecordIcon />
                        </div>
                        <div className="record-name">
                            {model.source.trim()}
                        </div>
                    </div>
                    {isEditable && (
                        <div className="record-amendment-options">
                            <div className="record-edit">
                                <EditButton />
                            </div>
                            <div className="record-delete">
                                <DeleteButton />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ToDo : need to fix plus here
    component.push(
        // TODO: Commented until all top level pluses sorted out
        // <TopLevelPlus
        //     margin={{top: RECORD_PLUS_OFFSET, bottom: RECORD_PLUS_OFFSET, left: RECORD_MARGIN_LEFT}}
        //     targetPosition={{line: model.position.endLine + 1, column: model.position.endColumn}}
        // />
    )

    return (
        <>
            {component}
        </>
    );
}
