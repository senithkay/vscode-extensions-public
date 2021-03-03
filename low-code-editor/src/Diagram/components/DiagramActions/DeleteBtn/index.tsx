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

import { STNode } from "@ballerina/syntax-tree";

import { Context as DiagramContext } from "../../../../Contexts/Diagram";
import { STModification } from "../../../../Definitions/lang-client-extended";
import { DefaultConfig } from "../../../visitors/default";
import { DeleteConfirmDialog } from "../../Portals/Overlay/Elements";

import { DeleteSVG } from "./DeleteSVG";
import "./style.scss";

export interface DeleteBtnProps {
    cx: number;
    cy: number;
    model: STNode;
    toolTipTitle?: string;
    isButtonDisabled?: boolean;
    onDraftDelete?: () => void;
    createModifications?: (model: STNode) => STModification[];
}

export function DeleteBtn(props: DeleteBtnProps) {
    const { state: { isReadOnly, onMutate: dispatchMutations } } = useContext(DiagramContext);

    const { cx, cy, model, onDraftDelete, createModifications, toolTipTitle, isButtonDisabled } = props;

    const [isConfirmDialogActive, setConfirmDialogActive] = useState(false);
    const [, setBtnActive] = useState(false);

    let modifications: STModification[] = [];

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
            setConfirmDialogActive(true);
        }
    };

    const closeConfirmDialog = () => {
        setConfirmDialogActive(false);
        setBtnActive(false);
    };

    const onDeleteConfirm = () => {
        // delete logic
        if (model) {
            const position = model.position;
            const modification: STModification = {
                type: "delete",
                ...position
            };
            if (createModifications) {
                const deleteModification: STModification[] = createModifications(model);
                if (deleteModification) {
                    modifications = deleteModification;
                }
            }
            modifications.push(modification);
            dispatchMutations(modifications);
            closeConfirmDialog();
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

                    {isConfirmDialogActive &&
                        <g>
                            <DeleteConfirmDialog
                                position={{
                                    x: cx + DefaultConfig.deleteConfirmOffset.x,
                                    y: cy + DefaultConfig.deleteConfirmOffset.y,
                                }}
                                onConfirm={onDeleteConfirm}
                                onCancel={closeConfirmDialog}
                            />
                        </g>
                    }
                </g>
            }
        </g>
    );
}
