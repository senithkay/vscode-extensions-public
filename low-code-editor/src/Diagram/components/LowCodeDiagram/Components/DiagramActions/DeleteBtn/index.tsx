/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useContext, useState } from "react";

import { STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Context/diagram";
import { DefaultConfig } from "../../../Visitors/default";

import { DeleteSVG } from "./DeleteSVG";
import "./style.scss";
export interface DeleteBtnProps {
    cx: number;
    cy: number;
    model: STNode;
    toolTipTitle?: string;
    isReferencedInCode?: boolean;
    isButtonDisabled?: boolean;
    showOnRight?: boolean;
    onDraftDelete?: () => void;
    createModifications?: (model: STNode) => STModification[];
}

export function DeleteBtn(props: DeleteBtnProps) {
    const diagramContext = useContext(Context);
    const { isReadOnly } = diagramContext.props;
    const deleteComponent = diagramContext?.api?.edit?.deleteComponent;
    const renderDialogBox = diagramContext?.api?.edit?.renderDialogBox;

    const { cx, cy, model, onDraftDelete, toolTipTitle, isButtonDisabled, isReferencedInCode, showOnRight } = props;

    const [isConfirmDialogActive, setConfirmDialogActive] = useState(false);
    const [, setBtnActive] = useState(false);

    const onMouseEnter = () => {
        setBtnActive(true);
    };

    const onMouseLeave = () => {
        // if confirm dialog is active keep btn active,
        // else hide on mouse leave
        setBtnActive(isConfirmDialogActive);
    };

    const onBtnClick = () => {
        if (!isButtonDisabled) {
            if (isReferencedInCode && renderDialogBox) {
                renderDialogBox("Delete", onDeleteConfirm, closeConfirmDialog, {
                    x: cx + (showOnRight ? (-(DefaultConfig.deleteConfirmOffset.x)) / 2 : DefaultConfig.deleteConfirmOffset.x),
                    y: cy + (showOnRight ? 0 : DefaultConfig.deleteConfirmOffset.y),
                });
                setConfirmDialogActive(true);
            } else {
                onDeleteConfirm();
            }
        }
    };

    const closeConfirmDialog = () => {
        setConfirmDialogActive(false);
        setBtnActive(false);
    };

    const onDeleteConfirm = () => {
        // delete logic
        if (model && deleteComponent) {
            deleteComponent(model, closeConfirmDialog)
        } else if (onDraftDelete) {
            onDraftDelete();
        }
    };

    return (
        <g>
            {!isReadOnly &&
                <g>
                    <g
                        className="delete-icon-show"
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        data-testid="deleteBtn"
                        onClick={onBtnClick}
                    >
                        <DeleteSVG x={cx} y={cy} toolTipTitle={toolTipTitle} />
                    </g>
                </g>
            }
        </g>
    );
}
