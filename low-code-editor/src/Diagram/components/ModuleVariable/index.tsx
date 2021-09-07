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
import React, { useState } from "react"

import { CaptureBindingPattern, ModuleVarDecl, STNode } from "@ballerina/syntax-tree";

import ConstantIcon from "../../../assets/icons/ConstantIcon";
import DeleteButton from "../../../assets/icons/DeleteButton";
import EditButton from "../../../assets/icons/EditButton";
import VariableIcon from "../../../assets/icons/VariableIcon";
import { TopLevelPlus } from "../TopLevelPlus";

import "./style.scss";

export const MODULE_VAR_MARGIN_LEFT: number = 24.5;
export const MODULE_VAR_PLUS_OFFSET: number = 7.5;
export const MODULE_VAR_HEIGHT: number = 49;
export const MIN_MODULE_VAR_WIDTH: number = 275;

export interface ModuleVariableProps {
    model: STNode;
}

export function ModuleVariable(props: ModuleVariableProps) {
    const { model } = props;

    const [isEditable, setIsEditable] = useState(false);

    const moduleMemberModel: ModuleVarDecl = model as ModuleVarDecl;
    const varType = (moduleMemberModel.typedBindingPattern.bindingPattern as CaptureBindingPattern)?.typeData?.
        typeSymbol?.typeKind;
    const varName = (moduleMemberModel.typedBindingPattern.bindingPattern as CaptureBindingPattern)?.variableName.value;
    const varValue = moduleMemberModel.initializer.source.trim();

    const handleMouseEnter = () => {
        setIsEditable(true);
    };
    const handleMouseLeave = () => {
        setIsEditable(false);
    };

    return (
        <div>
            <div
                className={"moduleVariableContainer"}
                style={{
                    marginLeft: MODULE_VAR_MARGIN_LEFT,
                    width: MIN_MODULE_VAR_WIDTH,
                    height: MODULE_VAR_HEIGHT
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                data-test-id="module-var"
            >
                <div className={"moduleVariableWrapper"}>
                    <div className={"moduleVariableIcon"}>
                        <VariableIcon />
                    </div>
                    <p className={"moduleVariableTypeText"}>
                        {varType}
                    </p>
                    <p className={"moduleVariableNameText"}>
                        {`${varName} = ${varValue}`}
                    </p>
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
            </div>
            <TopLevelPlus
                margin={{ top: MODULE_VAR_PLUS_OFFSET, bottom : MODULE_VAR_PLUS_OFFSET, left: MODULE_VAR_MARGIN_LEFT }}
            />
        </div>
    );
}

