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
import React, { useState } from "react"

import { EnumDeclaration, EnumMember, STKindChecker, STNode } from "@ballerina/syntax-tree";

import DeleteButton from "../../../assets/icons/DeleteButton";
import EditButton from "../../../assets/icons/EditButton";
import RecordIcon from "../../../assets/icons/RecordIcon";
import { ComponentExpandButton } from "../ComponentExpandButton";

import "./style.scss";

export const RECORD_MARGIN_LEFT: number = 24.5;
export const RECORD_PLUS_OFFSET: number = 7.5;

export interface TypeDefComponentProps {
    model: EnumDeclaration;
}

export function EnumDeclaration(props: TypeDefComponentProps) {
    const { model } = props;
    const [isExpanded, setIsExpanded] = useState(false);

    const onExpandClick = () => {
        setIsExpanded(!isExpanded);
    }

    const members: JSX.Element[] = [];

    model.enumMemberList
        .filter(member => !STKindChecker.isCommaToken(member))
        .forEach((member: EnumMember) => {
            members.push(
                <div className="enum-field" >
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
                        <EditButton />
                    </div>
                    <div className="enum-delete">
                        <DeleteButton />
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
    );
}
