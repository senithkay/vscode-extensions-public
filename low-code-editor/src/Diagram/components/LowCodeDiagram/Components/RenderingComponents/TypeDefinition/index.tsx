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
import React, { ReactElement, useContext, useState } from "react"

import { Tooltip } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { MethodDeclaration, ObjectField, ObjectTypeDesc, STKindChecker, TypeDefinition } from "@wso2-enterprise/syntax-tree";

import DeleteButton from "../../../../../../assets/icons/DeleteButton";
import EditButton from "../../../../../../assets/icons/EditButton";
import RecordIcon from "../../../../../../assets/icons/RecordIcon";
import { useDiagramContext } from "../../../../../../Contexts/Diagram";
import { removeStatement } from "../../../../../utils/modification-util";
import { UnsupportedConfirmButtons } from "../../../../FormComponents/DialogBoxes/UnsupportedConfirmButtons";
import { ComponentExpandButton } from "../../ComponentExpandButton";
import { RecordDefinitionComponent } from "../RecordDefinion";

import "./style.scss";

export interface TypeDefComponentProps {
    model: TypeDefinition;
}

export function TypeDefinitionComponent(props: TypeDefComponentProps) {
    const { model } = props;
    const {
        api: {
            code: { modifyDiagram, gotoSource },
        },
    } = useDiagramContext();

    const [isEditable, setIsEditable] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [editingEnabled, setEditingEnabled] = useState(false);

    const handleMouseEnter = () => {
        setIsEditable(true);
    };
    const handleMouseLeave = () => {
        setIsEditable(false);
    };
    const onExpandClick = () => {
        setIsExpanded(!isExpanded);
    };

    const handleDeleteBtnClick = () => {
        modifyDiagram([
            removeStatement(model.position)
        ]);
    }

    const handleEditBtnClick = () => {
        setEditingEnabled(true);
    }

    const handleEditBtnCancel = () => {
        setEditingEnabled(false);
    }

    const handleEditBtnConfirm = () => {
        const targetposition = model.position;
        setEditingEnabled(false);
        gotoSource({ startLine: targetposition.startLine, startColumn: targetposition.startColumn });
    }

    const component: JSX.Element[] = [];

    if (STKindChecker.isRecordTypeDesc(model.typeDescriptor)) {
        component.push(
            <RecordDefinitionComponent model={model} />
        )
    } else {
        const typeModel: TypeDefinition = model as TypeDefinition;

        const varName = typeModel.typeName.value;
        const type = typeModel.typeDescriptor.source.split(/[\s, <]+/)[0];
        const typeMaxWidth = type.length >= 10;
        const nameMaxWidth = varName.length >= 20;
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
            <div>
                <div className="type-comp" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <div className="type-header" >
                        <div className="type-content">
                            <div className="type-icon">
                                <RecordIcon />
                            </div>
                            <div className="type-type">
                                <Tooltip
                                    arrow={true}
                                    placement="top-start"
                                    title={model.source.slice(1, -1)}
                                    inverted={false}
                                    interactive={true}
                                >
                                    <tspan x="0" y="0">{typeMaxWidth ? type.slice(0, 10) + "..." : type}</tspan>
                                </Tooltip>
                            </div>
                            <div className="type-name">
                                <tspan x="0" y="0">{nameMaxWidth ? varName.slice(0, 20) + "..." : varName}</tspan>
                            </div>
                        </div>
                        {isEditable && (
                            <div className="type-amendment-options">
                                <div className="type-edit">
                                    <EditButton onClick={handleEditBtnClick} />
                                </div>
                                <div className="type-delete">
                                    <DeleteButton onClick={handleDeleteBtnClick} />
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
                                {typeFields.map(typefield => (
                                    <div className="type-field" key={typefield[1]}>
                                        <div className="type-field-type">
                                            {typefield[0]}
                                        </div>
                                        <div className="type-field-name">
                                            {typefield[1]};
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                {editingEnabled && <UnsupportedConfirmButtons onConfirm={handleEditBtnConfirm} onCancel={handleEditBtnCancel} />}
            </div>
        )
    }
    return (
        <>
            {component}
        </>
    );
}
