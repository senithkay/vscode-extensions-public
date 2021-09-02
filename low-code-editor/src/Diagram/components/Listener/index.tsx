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
import React from 'react'

import { ListenerDeclaration, STNode } from "@ballerina/syntax-tree";
import { ModuleMemberViewState, ViewState } from "../../view-state";
import "./style.scss";

export interface ListenerProps {
    model: STNode;
}

export function ListenerC(props: ListenerProps) {
    const { model } = props;

    const listenerModel: ListenerDeclaration = model as ListenerDeclaration;

    const viewState: ModuleMemberViewState = listenerModel.viewState;
    const listenerName = listenerModel.variableName.value;
    let listenerPort = "";
    listenerModel.initializer.parenthesizedArgList.arguments.forEach((argument) => {
        listenerPort += argument.source.trim();
    });
    const type = listenerModel.typeDescriptor.identifier.value;

    return (
        <div className="listener-comp" >
            <div className="listener-icon" />
            <div className="listener-type">
                HTTP
            </div>
            <div className="listener-name">
                {listenerName}
            </div>
        </div>
    );
}

export const Listener = ListenerC;
