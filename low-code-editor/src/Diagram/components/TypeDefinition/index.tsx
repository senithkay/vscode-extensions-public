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

import { MethodDeclaration, ObjectField, ObjectTypeDesc, STKindChecker, TypeDefinition } from "@ballerina/syntax-tree";

import DeleteButton from "../../../assets/icons/DeleteButton";
import EditButton from "../../../assets/icons/EditButton";
import RecordIcon from "../../../assets/icons/RecordIcon";
import { ComponentExpandButton } from "../ComponentExpandButton";
import { RecordDefinitionComponent } from "../RecordDefinion";

import "./style.scss";

export const RECORD_MARGIN_LEFT: number = 24.5;
export const RECORD_PLUS_OFFSET: number = 7.5;

export interface TypeDefComponentProps {
    model: TypeDefinition;
}

export function TypeDefinitionComponent(props: TypeDefComponentProps) {
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
        component.push(
            <RecordDefinitionComponent model={model} />
        )
    } else {
        const typeModel: TypeDefinition = model as TypeDefinition;

        const varName = typeModel.typeName.value;
        const type = typeModel.typeDescriptor.source.split(/[\s, <]+/)[0];
        let typeFields;
        if (STKindChecker.isObjectTypeDesc(model.typeDescriptor)) {
            typeFields = [];
            const objectModel = typeModel.typeDescriptor as ObjectTypeDesc;
            for (const field of (typeModel.typeDescriptor as ObjectTypeDesc).members) {
                if (field.kind === "ObjectField") {
                    const fieldName = (field as ObjectField).fieldName.value;
                    const fieldType = (field as ObjectField).typeName.source.trim();
                    typeFields.push([fieldType, fieldName]);
                } else if (field.kind === "MethodDeclaration") {
                    const fieldName = (field as MethodDeclaration).methodName.value;
                    const fieldType = (field as MethodDeclaration).functionKeyword.value;
                    const fieldValue = (field as MethodDeclaration).methodSignature.source;
                    typeFields.push([fieldType, fieldName + fieldValue]);
                }
            }
        }
        component.push(
            <div className="type-comp" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="type-header" >
                    <div className="type-content">
                        <div className="type-icon">
                            <RecordIcon />
                        </div>
                        <div className="type-type">
                            {type}
                        </div>
                        <div className="type-name">
                            {varName}
                        </div>
                    </div>
                    {isEditable && (
                        <div className="type-amendment-options">
                            <div className="type-edit">
                                <EditButton />
                            </div>
                            <div className="type-delete">
                                <DeleteButton />
                            </div>
                            {typeFields && (
                                <div className="type-expand">
                                    <ComponentExpandButton isExpanded={isExpanded} onClick={onExpandClick} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="type-separator" />
                {isExpanded && typeFields && (
                    <>
                        <div className="type-fields" >
                            {typeFields.map(recordfield => (
                                <div className="type-field" key={recordfield[1]}>
                                    <div className="type-field-type">
                                        {recordfield[0]}
                                    </div>
                                    <div className="type-field-name">
                                        {recordfield[1]};
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        )
    }
    return (
        <>
            {component}
        </>
    );
}
