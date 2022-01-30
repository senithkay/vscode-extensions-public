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
import React, { useContext, useRef, useState } from "react";

import { STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import DeleteButton from "../../../../assets/icons/DeleteButton";
import EditButton from "../../../../assets/icons/EditButton";
import { ComponentExpandButton } from "../Components/ComponentExpandButton";
import { Context } from "../Context/diagram";

import "./style.scss";

export interface HeaderActionsProps {
    model: STNode;
    isExpanded: boolean;
    deleteText: string;
    formType?: string;
    showOnRight?: boolean;
    onExpandClick: () => void;
    onConfirmDelete: () => void;
    onConfirmEdit?: () => void;
    unsupportedType?: boolean;
}

export function HeaderActions(props: HeaderActionsProps) {
    const {
        api: {
            code: { gotoSource },
        },
    } = useDiagramContext();
    const {
        model,
        isExpanded,
        deleteText,
        showOnRight,
        onExpandClick,
        formType,
        onConfirmDelete,
        onConfirmEdit,
        unsupportedType
    } = props;

    const {
        props: { isReadOnly },
        api: {
            edit: {
                renderEditForm
            }
        },
    } = useContext(Context);

    const deleteBtnRef = useRef(null);
    const [isDeleteViewVisible, setIsDeleteViewVisible] = useState(false);
    const handleDeleteBtnClick = () => onConfirmDelete();
    // const handleCancelDeleteBtn = () => setIsDeleteViewVisible(false);

    const [isEditViewVisible, setIsEditViewVisible] = useState(false);

    const handleEditBtnCancel = () => setIsEditViewVisible(false);
    const handleEditBtnClick = () => {
        renderEditForm(model, model?.position, { formType: (formType ? formType : model.kind), isLoading: false }, handleEditBtnCancel, handleEditBtnCancel);
        // setIsEditViewVisible(true);
    }
    const handleEnumEditBtnConfirm = () => {
        // setIsEditViewVisible(false);
        // onConfirmEdit();
    }

    const unsupportedEditConfirm = () => {
        const targetposition = model.position;
        setIsUnSupported(false);
        gotoSource({ startLine: targetposition.startLine, startColumn: targetposition.startColumn });
    }

    const unSupportedEditCancel = () => setIsUnSupported(false);

    React.useEffect(() => {
        setIsDeleteViewVisible(false);
    }, [model]);

    return (
        <div className={"header-amendment-options"}>
            {!isReadOnly && (
                <>
                    <div className={classNames("amendment-option", "show-on-hover")}>
                        <EditButton onClick={handleEditBtnClick} />
                    </div>
                    <div className={classNames("amendment-option", "show-on-hover")}>
                        <div ref={deleteBtnRef}>
                            <DeleteButton onClick={handleDeleteBtnClick} />
                        </div>
                    </div>
                </>
            )}
            <div className={classNames("amendment-option", "show-on-hover")}>
                <ComponentExpandButton
                    isExpanded={isExpanded}
                    onClick={onExpandClick}
                />
            </div>

            {/* {isDeleteViewVisible && (
                <DeleteConfirmDialog
                    onCancel={handleCancelDeleteBtn}
                    onConfirm={onConfirmDelete}
                    position={
                        deleteBtnRef.current
                            ? {
                                x: showOnRight ? deleteBtnRef.current.offsetLeft + 272: deleteBtnRef.current.offsetLeft - 272,
                                y: deleteBtnRef.current.offsetTop,
                            }
                            : { x: 0, y: 0 }
                    }
                    message={deleteText}
                    isFunctionMember={false}
                />
            )} */}
            {/* {!isReadOnly && isEditViewVisible && (
                <FormGenerator
                    model={model}
                    configOverlayFormStatus={{ formType: (formType ? formType : model.kind), isLoading: false }}
                    onCancel={handleEditBtnCancel}
                    onSave={handleEditBtnCancel}
                />
            )} */}
        </div>
    );
}
