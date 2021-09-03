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
import React, { useState } from 'react'

import { ListenerDeclaration, STNode } from "@ballerina/syntax-tree";

import DeleteButton from "../../../assets/icons/DeleteButton";
import EditButton from "../../../assets/icons/EditButton";
import { ModuleMemberPlus } from "../ModuleMemberPlus";

import "./style.scss";

export const LISTENER_MARGIN_LEFT: number = 24.5;
export const LISTENER_PLUS_OFFSET: number = 7.5;

export interface ListenerProps {
    model: STNode;
}

export function ListenerC(props: ListenerProps) {
    const { model } = props;

    const [isEditable, setIsEditable] = useState(false);

    const listenerModel: ListenerDeclaration = model as ListenerDeclaration;
    const listenerName = listenerModel.variableName.value;
    let listenerPort = "";
    listenerModel.initializer.parenthesizedArgList.arguments.forEach((argument) => {
        listenerPort += argument.source.trim();
    });
    const type = listenerModel.typeDescriptor.identifier.value;

    const handleMouseEnter = () => {
        setIsEditable(true);
    };
    const handleMouseLeave = () => {
        setIsEditable(false);
    };

    return (
        <>
            <div className="listener-comp" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} >
                <div className="listener-icon" />
                <div className="listener-type">
                    HTTP
                </div>
                <div className="listener-name">
                    {listenerName}
                </div>
                { isEditable && (
                    <>
                        <div className={"editBtnWrapper"}>
                            <EditButton/>
                        </div>
                        <div className={"deleteBtnWrapper"}>
                            <DeleteButton/>
                        </div>
                    </>
                )}
            </div>
            <ModuleMemberPlus
                margin={{ top: LISTENER_PLUS_OFFSET, bottom: LISTENER_PLUS_OFFSET, left: LISTENER_MARGIN_LEFT }}
            />
        </>
    );
}

export const Listener = ListenerC;
