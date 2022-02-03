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
import React, { useContext, useState } from "react"

import { RecordFieldWithDefaultValue, RecordTypeDesc, STKindChecker, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import DeleteButton from "../../../../../../assets/icons/DeleteButton";
import EditButton from "../../../../../../assets/icons/EditButton";
import RecordIcon from "../../../../../../assets/icons/RecordIcon";
import { Context } from "../../../Context/diagram";
import { HeaderActions } from "../../../HeaderActions";

import "./style.scss";


export const RECORD_MARGIN_LEFT: number = 24.5;
export const RECORD_PLUS_OFFSET: number = 7.5;

export interface RecordDefComponentProps {
    model: TypeDefinition;
}

export function RecordDefinitionComponent(props: RecordDefComponentProps) {
    const { model } = props;

    const diagramContext = useContext(Context);
    const { isReadOnly } = diagramContext.props;
    const deleteComponent = diagramContext?.api?.edit?.deleteComponent;
    const renderEditForm = diagramContext?.api?.edit?.renderEditForm;

    const [isExpanded, setIsExpanded] = useState(false);

    const onExpandClick = () => {
        setIsExpanded(!isExpanded);
    };
    const handleDeleteConfirm = () => {
        deleteComponent(model);
    };
    const handleEditClick = () => {
        renderEditForm(model, model.position, {
            formType: STKindChecker.isRecordTypeDesc(model.typeDescriptor) ? "RecordEditor" : model.kind, isLoading: false
        }
        )
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
            <div className="record-comp" data-record-name={varName}>
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
                    {!isReadOnly && (
                        <div className="amendment-options">
                            <div className={classNames("edit-btn-wrapper", "show-on-hover")}>
                                <EditButton onClick={handleEditClick} />
                            </div>
                            <div className={classNames("delete-btn-wrapper", "show-on-hover")}>
                                <DeleteButton onClick={handleDeleteConfirm} />
                            </div>
                        </div>
                    )
                    }
                </div>
                <div className="record-separator" />
            </div>
        )
    } else {
        // ToDo : sort out how to display general typedefinitions
        component.push(
            <div className="record-comp">
                <div className="record-header" >
                    <div className="record-content">
                        <div className="record-icon">
                            <RecordIcon />
                        </div>
                        <div className="record-name">
                            {model.source.trim()}
                        </div>
                    </div>
                    <HeaderActions
                        model={model}
                        deleteText="Delete this Type Definition?"
                        isExpanded={isExpanded}
                        showOnRight={true}
                        onExpandClick={onExpandClick}
                        onConfirmDelete={handleDeleteConfirm}
                    />
                </div>
            </div>
        )
    }

    return (
        <>
            <div id={"edit-div"} />
            {component}
        </>
    );
}
