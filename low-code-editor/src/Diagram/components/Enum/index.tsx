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
// tslint:disable: no-unused-expression
import React, { useContext, useState } from "react"

import { EnumDeclaration, EnumMember, STKindChecker } from "@ballerina/syntax-tree";
import { Button } from "@material-ui/core";

import DeleteButton from "../../../assets/icons/DeleteButton";
import EditButton from "../../../assets/icons/EditButton";
import RecordIcon from "../../../assets/icons/RecordIcon";
import { Context as DiagramContext } from "../../../Contexts/Diagram";
import { removeStatement } from "../../utils/modification-util";
import { ComponentExpandButton } from "../ComponentExpandButton";
import { OverlayBackground } from "../OverlayBackground";
import { DiagramOverlayContainer } from "../Portals/Overlay";
import { UnsupportedConfirmButtons } from "../UnsupportedConfirmButtons";

import "./style.scss";

export interface EnumDeclarationComponentProps {
    model: EnumDeclaration;
}

export function EnumDeclarationComponent(props: EnumDeclarationComponentProps) {
    const { model } = props;
    const {
        props: {
            stSymbolInfo
        },
        api: {
            code: {
                modifyDiagram
            }
        }
    } = useContext(DiagramContext);
    const [isExpanded, setIsExpanded] = useState(false);
    const [editingEnabled, setEditingEnabled] = useState(false);

    const onExpandClick = () => {
        setIsExpanded(!isExpanded);
    }

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
        // Move to code
    }

    const members: JSX.Element[] = model.enumMemberList
        .filter(member => !STKindChecker.isCommaToken(member))
        .map((member: EnumMember, i: number) => {
            return (
                <div key={`${model.identifier.value}-member-${i}`} className="enum-field" >
                    <div className="enum-field-type">
                        {member.identifier.value}
                    </div>
                    {
                        member.constExprNode && (
                            <div className="enum-field-name">
                                = {member.constExprNode.source}
                            </div>
                        )
                    }
                </div>
            )
        })

    return (
        <div>
            <div className="enum-comp">
                <div className="enum-header" >
                    <div className="enum-content">
                        <div className="enum-icon">
                            <RecordIcon />
                        </div>
                        <div className="enum-type">
                            Enum
                        </div>
                        <div className="enum-name">
                            {model.identifier.value}
                        </div>
                    </div>
                    <div className="enum-amendment-options">
                        <div className="enum-edit">
                            <EditButton onClick={handleEditBtnClick} />
                        </div>
                        <div className="enum-delete">
                            <DeleteButton onClick={handleDeleteBtnClick} />
                        </div>
                        <div className="enum-expand">
                            <ComponentExpandButton isExpanded={isExpanded} onClick={onExpandClick} />
                        </div>
                    </div>
                </div>
                <div className="enum-separator" />
                {isExpanded && (
                    <>
                        <div className="enum-fields" >
                            {members}
                        </div>
                    </>
                )}
            </div>
            {editingEnabled && <UnsupportedConfirmButtons onConfirm={handleEditBtnConfirm} onCancel={handleEditBtnCancel} />}
        </div>
    );
}
