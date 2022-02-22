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
import React from "react";

import {
  FunctionDefinition,
  ObjectMethodDefinition,
  RequiredParam,
  STKindChecker,
} from "@wso2-enterprise/syntax-tree";

import FunctionIcon from "../../../../../../assets/icons/FunctionIcon";
import { useDiagramContext } from "../../../../../../Contexts/Diagram";
import { removeStatement } from "../../../../../utils/modification-util";
import { HeaderActions } from "../../../HeaderActions";

import "./style.scss";

interface FunctionHeaderProps {
  model: FunctionDefinition | ObjectMethodDefinition;
  onExpandClick: () => void;
  isExpanded: boolean;
}

export function FunctionHeader(props: FunctionHeaderProps) {
  const { model, onExpandClick, isExpanded } = props;

  const {
    api: {
      code: { modifyDiagram },
    },
  } = useDiagramContext();

  const onDeleteClick = () => {
    const modification = removeStatement(model.position);
    modifyDiagram([modification]);
  };

  return (
    <div className="function-signature">
      <div className={"function-icon"}>
        <FunctionIcon />
      </div>

      <div className="param-wrapper">
        <div className={"param-container"}>
          <p className={"path-text"}>{model?.functionName?.value}</p>
        </div>
        <div className={"param-container"}>
          <p className={"path-text"}>
            {model?.functionSignature?.parameters
              .filter((param) => !STKindChecker.isCommaToken(param))
              .map((param: RequiredParam, i) => (
                <span key={i} className={"param"}>
                  {param.source}
                </span>
              ))}
          </p>
        </div>
      </div>
      <HeaderActions
        model={model}
        deleteText="Are you sure you want to delete this function?"
        isExpanded={isExpanded}
        onExpandClick={onExpandClick}
        onConfirmDelete={onDeleteClick}
      />
    </div>
  );
}
