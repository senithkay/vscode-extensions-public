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
import React, { useRef, useState } from "react";

import { STNode } from "@ballerina/syntax-tree";
import classNames from "classnames";

import DeleteButton from "../../../assets/icons/DeleteButton";
import EditButton from "../../../assets/icons/EditButton";
import { ComponentExpandButton } from "../ComponentExpandButton";
import { FormGenerator } from "../FormGenerator";
import { DeleteConfirmDialog } from "../Portals/Overlay/Elements";

import "./style.scss";

export interface HeaderActionsProps {
  model: STNode;
  isExpanded: boolean;
  deleteText: string;
  onExpandClick: () => void;
  onConfirmDelete: () => void;
}

export function HeaderActions(props: HeaderActionsProps) {
  const {
    model,
    isExpanded,
    deleteText,
    onExpandClick,
    onConfirmDelete,
  } = props;
  const deleteBtnRef = useRef(null);

  const [isDeleteViewVisible, setIsDeleteViewVisible] = useState(false);
  const handleDeleteBtnClick = () => setIsDeleteViewVisible(true);
  const handleCancelDeleteBtn = () => setIsDeleteViewVisible(false);

  const [isEditViewVisible, setIsEditViewVisible] = useState(false);
  const handleEditBtnClick = () => setIsEditViewVisible(true);
  const handleEditBtnCancel = () => setIsEditViewVisible(false);

  return (
    <div className={"header-amendment-options"}>
      <div className={classNames("amendment-option", "show-on-hover")}>
        <EditButton onClick={handleEditBtnClick} />
      </div>
      <div className={classNames("amendment-option", "show-on-hover")}>
        <div ref={deleteBtnRef}>
          <DeleteButton onClick={handleDeleteBtnClick} />
        </div>
      </div>
      <div className={"amendment-option"}>
        <ComponentExpandButton
          isExpanded={isExpanded}
          onClick={onExpandClick}
        />
      </div>

      {isDeleteViewVisible && (
        <DeleteConfirmDialog
          onCancel={handleCancelDeleteBtn}
          onConfirm={onConfirmDelete}
          position={
            deleteBtnRef.current
              ? {
                  x: deleteBtnRef.current.offsetLeft - 272,
                  y: deleteBtnRef.current.offsetTop,
                }
              : { x: 0, y: 0 }
          }
          message={deleteText}
          isFunctionMember={false}
        />
      )}

      {isEditViewVisible && (
        <FormGenerator
          model={model}
          configOverlayFormStatus={{ formType: model.kind, isLoading: false }}
          onCancel={handleEditBtnCancel}
          onSave={handleEditBtnCancel}
        />
      )}
    </div>
  );
}
