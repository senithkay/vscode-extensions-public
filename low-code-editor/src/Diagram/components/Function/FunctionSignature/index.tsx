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
// tslint:disable: jsx-no-multiline-js
import React, { useRef, useState } from "react";

import {
  FunctionDefinition,
  IdentifierToken,
  ObjectMethodDefinition,
  RequiredParam,
  ResourceAccessorDefinition,
  STKindChecker,
} from "@ballerina/syntax-tree";
import classNames from "classnames";

import DeleteButton from "../../../../assets/icons/DeleteButton";
import EditButton from "../../../../assets/icons/EditButton";
import FunctionIcon from "../../../../assets/icons/FunctionIcon";
import { useDiagramContext } from "../../../../Contexts/Diagram";
import { STModification } from "../../../../Definitions";
import { removeStatement } from "../../../utils/modification-util";
import { FunctionViewState } from "../../../view-state";
import { ComponentExpandButton } from "../../ComponentExpandButton";
import { FormGenerator } from "../../FormGenerator";
import { DeleteConfirmDialog } from "../../Portals/Overlay/Elements/DeleteConfirmDialog";
import "../style.scss";

interface FunctionSignatureProps {
  model:
    | FunctionDefinition
    | ResourceAccessorDefinition
    | ObjectMethodDefinition;
  onExpandClick: () => void;
  isExpanded: boolean;
}

export function FunctionSignature(props: FunctionSignatureProps) {
  const { model, onExpandClick, isExpanded } = props;
  const viewState: FunctionViewState = model.viewState as FunctionViewState;
  const component: JSX.Element[] = [];

  const {
    props: { stSymbolInfo, selectedPosition },
    api: {
      code: { modifyDiagram },
    },
  } = useDiagramContext();

  const actionRef = useRef(null);

  const [isEditable, setIsEditable] = useState(false);
  const handleMouseEnter = () => {
    setIsEditable(true);
  };
  const handleMouseLeave = () => {
    setIsEditable(false);
  };

  // FIXME: need to refactor form generator away from this component!
  const [showForm, setShowForm] = useState(false);
  const showFormGenerator = () => setShowForm(true);
  const hideFormGenerator = () => setShowForm(false);

  const onHideFormGenerator = (modifications: STModification[]) => {
    modifyDiagram(modifications);
    setShowForm(false);
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const onShowDelete = () => setShowDeleteDialog(true);
  const onHideDelete = () => setShowDeleteDialog(false);

  const onDeleteClick = () => {
    const modification = removeStatement(model.position);
    modifyDiagram([modification]);
    onHideDelete();
  };

  const rectProps = {
    x: viewState.bBox.cx,
    y: viewState.bBox.cy,
    width: viewState.bBox.w,
    height: viewState.bBox.h,
  };

  if (STKindChecker.isResourceAccessorDefinition(model)) {
    const functionSignature = model.functionSignature;

    let pathConstruct = "";

    model.relativeResourcePath.forEach((resourceMember) => {
      pathConstruct += resourceMember.source
        ? resourceMember.source
        : resourceMember.value;
    });

    const queryParamComponents: JSX.Element[] = [];
    const otherParamComponents: JSX.Element[] = [];

    functionSignature.parameters
      .filter((param) => !STKindChecker.isCommaToken(param))
      .filter(
        (param) =>
          STKindChecker.isRequiredParam(param) &&
          (STKindChecker.isStringTypeDesc(param.typeName) ||
            STKindChecker.isIntTypeDesc(param.typeName) ||
            STKindChecker.isBooleanTypeDesc(param.typeName) ||
            STKindChecker.isFloatTypeDesc(param.typeName) ||
            STKindChecker.isDecimalTypeDesc(param.typeName))
      )
      .forEach((param: RequiredParam, i) => {
        queryParamComponents.push(
          <>
            {i !== 0 ? "&" : ""}
            {param.paramName.value}
            <sub>{(param.typeName as any)?.name?.value}</sub>
          </>
        );
      });

    functionSignature.parameters
      .filter((param) => !STKindChecker.isCommaToken(param))
      .filter(
        (param) =>
          STKindChecker.isRequiredParam(param) &&
          !(
            STKindChecker.isStringTypeDesc(param.typeName) ||
            STKindChecker.isIntTypeDesc(param.typeName) ||
            STKindChecker.isBooleanTypeDesc(param.typeName) ||
            STKindChecker.isFloatTypeDesc(param.typeName) ||
            STKindChecker.isDecimalTypeDesc(param.typeName)
          )
      )
      .forEach((param: RequiredParam, i) => {
        otherParamComponents.push(
          <span className={"param"}>{param.source}</span>
        );
      });

    component.push(
      <div
        className={classNames(
          "function-signature",
          STKindChecker.isResourceAccessorDefinition(model)
            ? model.functionName.value
            : ""
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={actionRef}
      >
        <div
          className={classNames(
            "resource-badge",
            STKindChecker.isResourceAccessorDefinition(model)
              ? model.functionName.value
              : ""
          )}
        >
          <p className={"text"}>{model.functionName.value.toUpperCase()}</p>
        </div>
        <div className="param-wrapper">
          <div className={"param-container"}>
            <p className={"path-text"}>
              {pathConstruct === "." ? "/" : pathConstruct}
              {queryParamComponents.length > 0 ? "?" : ""}
              {queryParamComponents}
            </p>
          </div>
          <div className={"param-container"}>
            <p className={"path-text"}>{otherParamComponents}</p>
          </div>
        </div>
        {isEditable && (
          <div className="function-hover-options">
            <div className="function-icon">
              <EditButton onClick={showFormGenerator} />
            </div>
            <div className="function-icon">
              <DeleteButton onClick={onShowDelete} />
            </div>
            <div className="function-icon">
              <ComponentExpandButton
                isExpanded={isExpanded}
                onClick={onExpandClick}
              />
            </div>
          </div>
        )}
      </div>
    );
  } else {
    const functionSignature = model.functionSignature;
    const functionName: IdentifierToken = model.functionName as IdentifierToken;

    const params: JSX.Element[] = [];
    functionSignature.parameters
      .filter((param) => !STKindChecker.isCommaToken(param))
      .forEach((param: RequiredParam, i) => {
        params.push(<span className={"param"}>{param.source}</span>);
      });

    component.push(
      <div
        className={classNames(
          "function-signature",
          STKindChecker.isResourceAccessorDefinition(model)
            ? model.functionName.value
            : ""
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={actionRef}
      >
        <div className={"function-icon"}>
          <FunctionIcon />
        </div>

        <div className="param-wrapper">
          <div className={"param-container"}>
            <p className={"path-text"}>{functionName.value}</p>
          </div>
          <div className={"param-container"}>
            <p className={"path-text"}>{params}</p>
          </div>
        </div>
        {isEditable && (
          <div className="function-hover-options">
            <div className="function-icon">
              <EditButton onClick={showFormGenerator} />
            </div>
            <div className="function-icon">
              <DeleteButton onClick={onShowDelete} />
            </div>
            <div className="function-icon">
              <ComponentExpandButton
                isExpanded={isExpanded}
                onClick={onExpandClick}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={actionRef}>
      {component}
      {showForm && (
        <FormGenerator
          model={model}
          targetPosition={model.position}
          configOverlayFormStatus={{
            formType: model.kind,
            isLoading: false,
            formArgs: { stSymbolInfo },
          }}
          onCancel={hideFormGenerator}
          onSave={onHideFormGenerator}
        />
      )}
      {showDeleteDialog && (
        <g>
          <DeleteConfirmDialog
            position={{
              x: actionRef.current
                ? actionRef.current.offsetLeft +
                  actionRef.current.offsetWidth -
                  400
                : 0,
              y: actionRef.current ? actionRef.current.offsetTop - 60 : 0,
            }}
            onConfirm={onDeleteClick}
            onCancel={onHideDelete}
            message="Are you sure you want to delete function?"
            removeText="Delete"
          />
        </g>
      )}
    </div>
  );
}
