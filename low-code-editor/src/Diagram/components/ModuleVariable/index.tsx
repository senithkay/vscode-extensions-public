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
import React, { useRef, useState } from "react"

import { CaptureBindingPattern, ModuleVarDecl, STKindChecker, STNode } from "@ballerina/syntax-tree";

import DeleteButton from "../../../assets/icons/DeleteButton";
import EditButton from "../../../assets/icons/EditButton";
import VariableIcon from "../../../assets/icons/VariableIcon";
import { useDiagramContext } from "../../../Contexts/Diagram";
import { removeStatement } from "../../utils/modification-util";
import { FormGenerator } from "../FormGenerator";
import { DeleteConfirmDialog } from "../Portals/Overlay/Elements";

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
    const { api: { code: { modifyDiagram } } } = useDiagramContext();

    const [editFormVisible, setEditFormVisible] = useState(false);
    const [deleteFormVisible, setDeleteFormVisible] = useState(false);

    const deleteBtnRef = useRef(null);

    let varType = '';
    let varName = '';
    let varValue = '';

    if (STKindChecker.isModuleVarDecl(model)) {
        const moduleMemberModel: ModuleVarDecl = model as ModuleVarDecl;
        varType = (moduleMemberModel.typedBindingPattern.bindingPattern as CaptureBindingPattern)?.typeData?.
            typeSymbol?.typeKind;
        varName = (moduleMemberModel.typedBindingPattern.bindingPattern as CaptureBindingPattern)?.variableName.value;
        varValue = model.source.trim();
    } else if (STKindChecker.isObjectField(model)) {
        varType = model.typeData?.typeSymbol?.typeKind;
        varName = model.fieldName.value;
        varValue = model.source.trim();
    }

    const handleOnDeleteCancel = () => {
        setDeleteFormVisible(false);
    }

    const handleOnDeleteClick = () => {
        setDeleteFormVisible(true);
    }

    const hadnleOnDeleteConfirm = () => {
        modifyDiagram([removeStatement(model.position)]);
    }

    const handleEditBtnClick = () => {
        setEditFormVisible(true);
    }

    const handleEditBtnCancel = () => {
        setEditFormVisible(false)
    }

    return (
        <div>
            <div
                className={"module-variable-container"}
                data-test-id="module-var"
            >
                <div className={'module-variable-display-section'}>
                    <div className={"module-variable-icon"}>
                        <VariableIcon />
                    </div>
                    <p className={'variable-text'}>
                        {varValue}
                    </p>
                </div>
                <div className={'show-on-hover'}>
                    <div className={'module-variable-actions'}>
                        <div className={"edit-btn-wrapper"}>
                            <EditButton onClick={handleEditBtnClick} />
                        </div>
                        <div className={"delete-btn-wrapper"}>
                            <div ref={deleteBtnRef}>
                                <DeleteButton onClick={handleOnDeleteClick} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {
                deleteFormVisible && (
                    <DeleteConfirmDialog
                        onCancel={handleOnDeleteCancel}
                        onConfirm={hadnleOnDeleteConfirm}
                        position={
                            deleteBtnRef.current
                                ? {
                                    x: deleteBtnRef.current.offsetLeft,
                                    y: deleteBtnRef.current.offsetTop,
                                }
                                : { x: 0, y: 0 }
                        }
                        message={'Delete Variable?'}
                        isFunctionMember={false}
                    />
                )
            }
            {
                editFormVisible && (
                    <FormGenerator
                        model={model}
                        configOverlayFormStatus={{ formType: model.kind, isLoading: false }}
                        onCancel={handleEditBtnCancel}
                        onSave={handleEditBtnCancel}
                    />
                )
            }
        </div>
    );
}

