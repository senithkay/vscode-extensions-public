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

import {CaptureBindingPattern, ModuleVarDecl, ServiceDeclaration, STNode} from "@ballerina/syntax-tree";

import { getSTComponents } from "../../utils";
import { BlockViewState } from "../../view-state";
import {ModuleMemberViewState} from "../../view-state/module-member";
import { ServiceViewState } from "../../view-state/service";
import { PlusButton } from "../Plus";

import {ModuleVariableSVG} from "./ModuleVariableSVG";
import "./style.scss";

export interface ModuleVariableProps {
    model: STNode;
}

export function ModuleVariable(props: ModuleVariableProps) {
    const { model } = props;

    const moduleMemberModel: ModuleVarDecl = model as ModuleVarDecl;
    const viewState: ModuleMemberViewState = moduleMemberModel.viewState;

    const varType = (moduleMemberModel.typedBindingPattern.bindingPattern as CaptureBindingPattern)?.typeData?.
        typeSymbol?.typeKind;
    const varName = (moduleMemberModel.typedBindingPattern.bindingPattern as CaptureBindingPattern)?.variableName.value;
    const varValue = moduleMemberModel.initializer.source.trim();

    return (
        <g className="module-var">
            <ModuleVariableSVG
                x={viewState.bBox.x}
                y={viewState.bBox.y}
                h={viewState.bBox.h}
                w={viewState.bBox.w}
                type={varType}
                name={varName}
                value={varValue}
            />
        </g>
    );
}

