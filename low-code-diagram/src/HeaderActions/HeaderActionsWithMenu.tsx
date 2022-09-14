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

import {
  DeleteButton,
  EditButton,
  LabelDeleteIcon,
  LabelEditIcon,
  LabelRunIcon,
  LabelTryIcon,
  ShowMenuIcon,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { ComponentExpandButton } from "../Components/ComponentExpandButton";
import { Context } from "../Context/diagram";

import "./style.scss";

export interface HeaderActionsProps {
  model: STNode;
  isExpanded: boolean;
  formType?: string;
  onExpandClick: () => void;
  onConfirmDelete: () => void;
  onClickTryIt?: () => void;
  onClickRun?: () => void;
  unsupportedType?: boolean;
  isResource?: boolean;
}

export function HeaderActionsWithMenu(props: HeaderActionsProps) {
  const {
    model,
    isExpanded,
    onExpandClick,
    formType,
    onConfirmDelete,
    onClickTryIt,
    onClickRun,
    unsupportedType,
    isResource,
  } = props;

  const diagramContext = useContext(Context);
  const { isReadOnly } = diagramContext.props;
  const gotoSource = diagramContext?.api?.code?.gotoSource;
  const renderEditForm = diagramContext?.api?.edit?.renderEditForm;
  const renderDialogBox = diagramContext?.api?.edit?.renderDialogBox;

  const [isDeleteViewVisible, setIsDeleteViewVisible] = useState(false);
  const handleDeleteBtnClick = (e: any) => {
    e.stopPropagation();
    onConfirmDelete();
  };

  const [isEditViewVisible, setIsEditViewVisible] = useState(false);
  const [isUnSupported, setIsUnSupported] = useState(false);

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const catMenu = useRef(null);

  const closeOpenMenus = (e: any) => {
    if (
      catMenu.current &&
      isMenuVisible &&
      !catMenu.current.contains(e.target)
    ) {
      setIsMenuVisible(false);
    }
  };

  document.addEventListener("mousedown", closeOpenMenus);

  const handleEditBtnClick = (e: any) => {
    e.stopPropagation();
    if (unsupportedType) {
      if (renderDialogBox) {
        renderDialogBox(
          "Unsupported",
          unsupportedEditConfirm,
          unSupportedEditCancel
        );
      }
    } else {
      if (renderEditForm) {
        renderEditForm(
          model,
          model?.position,
          { formType: formType ? formType : model.kind, isLoading: false },
          handleEditBtnCancel,
          handleEditBtnCancel
        );
      }
    }
  };

  const handleEditBtnCancel = () => setIsEditViewVisible(false);

  const unsupportedEditConfirm = () => {
    if (model && gotoSource) {
      const targetposition = model.position;
      setIsUnSupported(false);
      gotoSource({
        startLine: targetposition.startLine,
        startColumn: targetposition.startColumn,
      });
    }
  };

  const unSupportedEditCancel = () => setIsUnSupported(false);

  React.useEffect(() => {
    setIsDeleteViewVisible(false);
  }, [model]);

  const showMenuClick = (e: any) => {
    setIsMenuVisible(!isMenuVisible);
    e.stopPropagation();
  };

  const handleOnClickRun = (e: any) => {
    e.stopPropagation();
    onClickRun();
  };

  const handleOnClickTryIt = (e: any) => {
    e.stopPropagation();
    onClickTryIt();
  };

  const optionMenu = (
    <div ref={catMenu} className={"rectangle-menu"}>
      <>
        <div
          onClick={handleOnClickRun}
          className={classNames("menu-option", "line-vertical", "left")}
        >
          <div className="icon">
            <LabelRunIcon />
          </div>
          <div className="other">Run</div>
        </div>
        <div
          onClick={handleOnClickTryIt}
          className={classNames("menu-option", "line-vertical", "middle")}
        >
          <div className="icon">
            <LabelTryIcon />
          </div>
          <div className="other">Try It</div>
        </div>
        <div
          onClick={handleEditBtnClick}
          className={classNames("menu-option", "line-vertical", "middle")}
        >
          <div className={classNames("icon", "icon-adjust")}>
            <LabelEditIcon />
          </div>
          <div className="other">Edit</div>
        </div>
        <div
          onClick={handleDeleteBtnClick}
          className={classNames("menu-option", "right")}
        >
          <div className={classNames("icon", "icon-adjust")}>
            <LabelDeleteIcon />
          </div>
          <div className="delete">Delete</div>
        </div>
      </>
    </div>
  );

  const resourceOptionMenu = (
    <div ref={catMenu} className={"rectangle-menu-resource"}>
      <>
        <div
          onClick={handleEditBtnClick}
          className={classNames("menu-option", "line-vertical", "left")}
        >
          <div className={classNames("icon", "icon-adjust")}>
            <LabelEditIcon />
          </div>
          <div className="other">Edit</div>
        </div>
        <div
          onClick={handleDeleteBtnClick}
          className={classNames("menu-option", "right")}
        >
          <div className={classNames("icon", "icon-adjust")}>
            <LabelDeleteIcon />
          </div>
          <div className="delete">Delete</div>
        </div>
      </>
    </div>
  );

  return (
    <>
      {isMenuVisible && (!isResource ? optionMenu : resourceOptionMenu)}
      <div ref={catMenu} className={"header-amendment-options"}>
        {!isReadOnly && (
          <>
            <div className={classNames("amendment-option", "margin-top-5")}>
              <ShowMenuIcon onClick={showMenuClick} />
            </div>
          </>
        )}
        <div className={classNames("amendment-option")}>
          <ComponentExpandButton
            isExpanded={isExpanded}
            onClick={onExpandClick}
          />
        </div>
      </div>
    </>
  );
}
