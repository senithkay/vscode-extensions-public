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
import classNames from "classnames";

import DeleteButton from "../../../../assets/icons/DeleteButton";
import EditButton from "../../../../assets/icons/EditButton";
import VariableIcon from "../../../../assets/icons/VariableIcon";

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
    let isConfigurable = false;

    if (STKindChecker.isModuleVarDecl(model)) {
        const moduleMemberModel: ModuleVarDecl = model as ModuleVarDecl;
        varType = (moduleMemberModel.typedBindingPattern.bindingPattern as CaptureBindingPattern)?.typeData?.
            typeSymbol?.typeKind;
        varName = (moduleMemberModel.typedBindingPattern.bindingPattern as CaptureBindingPattern)?.variableName.value;
        varValue = model.source.trim();
        isConfigurable = model && model.qualifiers.length > 0
            && model.qualifiers.filter(qualifier => STKindChecker.isConfigurableKeyword(qualifier)).length > 0;
    } else if (STKindChecker.isObjectField(model)) {
        varType = model.typeData?.typeSymbol?.typeKind;
        varName = model.fieldName.value;
        varValue = model.source.trim();
    }

    const typeMaxWidth = varType.length >= 10;
    const nameMaxWidth = varName.length >= 20;

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
                <div className="module-variable-header" >
                    <div className={"module-variable-wrapper"}>
                        <div className={"module-variable-icon"}>
                            {(isConfigurable) ? <ConfigurableIcon /> : <ModuleVariableIcon />}
                        </div>
                        <div className={"module-variable-type-text"}>
                            <Tooltip
                                arrow={true}
                                placement="top-start"
                                title={model.source.slice(1, -1)}
                                inverted={false}
                                interactive={true}
                            >
                                <tspan x="0" y="0">{typeMaxWidth ? varType.slice(0, 10) + "..." : varType}</tspan>
                            </Tooltip>
                        </div>
                        <div className={'module-variable-name-text'}>
                            <tspan x="0" y="0">{nameMaxWidth ? varName.slice(0, 20) + "..." : varName}</tspan>
                        </div>
                    </div>
                    <div className={'module-variable-actions'}>
                        <div className={classNames("edit-btn-wrapper", "show-on-hover")}>
                            <EditButton onClick={handleEditBtnClick} />
                        </div>
                        <div className={classNames("delete-btn-wrapper", "show-on-hover")}>
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
