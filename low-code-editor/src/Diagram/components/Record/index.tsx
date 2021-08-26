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

import { RecordTypeDesc, STNode, TypeDefinition } from "@ballerina/syntax-tree";

import { ModuleMemberViewState } from "../../view-state/module-member";

import { RecordSVG } from "./RecordSVG";
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

    return (
        <g className="record">
            <RecordSVG
                x={viewState.bBox.x}
                y={viewState.bBox.y}
                h={viewState.bBox.h}
                w={viewState.bBox.w}
                type={type}
                name={varName}
            />
        </g>
    );
}
