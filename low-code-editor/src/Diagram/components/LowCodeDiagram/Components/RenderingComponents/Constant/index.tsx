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
import React, { useContext, useState } from "react"

import { Tooltip } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ConstDeclaration, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import ConstantIcon from "../../../../../../assets/icons/ConstantIcon";
import DeleteButton from "../../../../../../assets/icons/DeleteButton";
import EditButton from "../../../../../../assets/icons/EditButton";
import { useDiagramContext } from "../../../../../../Contexts/Diagram";
import { removeStatement } from "../../../../../utils/modification-util";
import { UnsupportedConfirmButtons } from "../../../../FormComponents/DialogBoxes/UnsupportedConfirmButtons";
import { FormGenerator } from "../../../../FormComponents/FormGenerator";

import "./style.scss";

export const MODULE_VAR_MARGIN_LEFT: number = 24.5;
export const MODULE_VAR_PLUS_OFFSET: number = 7.5;
export const MODULE_VAR_HEIGHT: number = 49;
export const MIN_MODULE_VAR_WIDTH: number = 275;

export interface ConstantProps {
    model: STNode;
}

export function Constant(props: ConstantProps) {
    const { model } = props;
    const diagramContext = useDiagramContext();
    const modifyDiagram = diagramContext?.api?.code?.modifyDiagram;
    const gotoSource = diagramContext?.api?.code?.gotoSource;

    const [deleteBtnEnabled, setDeleteBtnEnabled] = useState(false);
    const [editBtnEnabled, setEditBtnEnabled] = useState(false);

    const constModel: ConstDeclaration = model as ConstDeclaration;
    const varType = "const";
    const varName = constModel.variableName.value;
    const varValue = constModel.initializer.source.trim();

    const typeMaxWidth = varType.length >= 10;
    const nameMaxWidth = varName.length >= 20;

    const handleDeleteBtnClick = () => {
        modifyDiagram([
            removeStatement(model.position)
        ]);
    }

    const handleEditBtnClick = () => {
        setEditBtnEnabled(true);
    }

    const handleEditBtnCancel = () => {
        setEditBtnEnabled(false);
    }

    const handleEditBtnConfirm = () => {
        const targetposition = model.position;
        setDeleteBtnEnabled(false);
        gotoSource({ startLine: targetposition.startLine, startColumn: targetposition.startColumn });
    }

    return (
        <div>
            <div
                className={"const-container"}
                data-test-id="const"
            >
                <div className={"const-wrapper"}>
                    <div className={"const-icon"}>
                        <ConstantIcon />
                    </div>
                    <div className={"const-type-text"}>
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
                    <div className={"const-name-text"}>
                        <tspan x="0" y="0">{nameMaxWidth ? varName.slice(0, 20) + "..." : varName}</tspan>
                    </div>
                </div>
                <div className="amendment-options">
                    <div className={classNames("edit-btn-wrapper", "show-on-hover")}>
                        <EditButton onClick={handleEditBtnClick} />
                    </div>
                    <div className={classNames("delete-btn-wrapper", "show-on-hover")}>
                        <DeleteButton onClick={handleDeleteBtnClick} />
                    </div>
                </div>
            </div>
            {
                deleteBtnEnabled && (
                    <UnsupportedConfirmButtons onConfirm={handleEditBtnConfirm} onCancel={handleEditBtnCancel} />
                )
            }
            {
                editBtnEnabled && (
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

