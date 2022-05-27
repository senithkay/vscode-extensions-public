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
import React, { useContext, useEffect, useState } from "react";

import { STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
  FunctionDefinition,
  IdentifierToken,
  STNode,
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Context/diagram";
import {
  initializeViewState,
  recalculateSizingAndPositioning,
  sizingAndPositioning,
} from "../../../Utils";
import { StatementViewState } from "../../../ViewState";
import { FunctionExpand } from "../../RenderingComponents/FunctionExpand";

import { HideFunctionSVG } from "./HideFunctionSVG";
import { ShowFunctionSVG } from "./ShowFunctionSVG";
import "./style.scss";

export interface ShowFunctionBtnProps {
  x: number;
  y: number;
  model: STNode;
  functionName: IdentifierToken;
  toolTipTitle?: string;
  isButtonDisabled?: boolean;
  createModifications?: (model: STNode) => STModification[];
}

export function ShowFunctionBtn(props: ShowFunctionBtnProps) {
  const {
    state: { isDiagramFunctionExpanded },
    props: { isReadOnly, syntaxTree },
    api: {
      code: { getFunctionDef },
    },
    actions: { diagramRedraw },
  } = useContext(Context);

  const {
    model,
    createModifications,
    toolTipTitle,
    isButtonDisabled,
    functionName,
    ...xyProps
  } = props;

  const [isConfirmDialogActive, setConfirmDialogActive] = useState(false);
  const [isBtnActive, setBtnActive] = useState(true);
  const [functionBlock, setFunctionBlock] = useState(undefined);
  const nodeViewState: StatementViewState = model.viewState;

  useEffect(() => {
    setFunctionBlock(undefined);
    setConfirmDialogActive(false);
  }, [syntaxTree]);


  useEffect(() => {
    if (isDiagramFunctionExpanded) {
      fetchDefinition();
    } else {
      nodeViewState.functionNodeExpanded = false;
      diagramRedraw(recalculateSizingAndPositioning(syntaxTree));
      setConfirmDialogActive(false);
    }
  }, [isDiagramFunctionExpanded]);

  const fetchDefinition = async () => {
    if (isConfirmDialogActive) {
      nodeViewState.functionNodeExpanded = false;
      diagramRedraw(recalculateSizingAndPositioning(syntaxTree));
      setConfirmDialogActive(false);
    } else {
      try {
        if (!nodeViewState.functionNode) {
          const range: any = {
            start: {
              line: functionName.position?.startLine,
              character: functionName.position?.startColumn,
            },
            end: {
              line: functionName.position?.endLine,
              character: functionName.position?.endColumn,
            },
          };
          const funDef = await getFunctionDef(range, model.viewState.functionNodeFilePath);
          const sizedBlock = initializeViewState(funDef.syntaxTree);
          sizedBlock.viewState.functionNodeFilePath = funDef.defFilePath;
          sizedBlock.viewState.functionNodeSource = sizedBlock.source;
          nodeViewState.functionNode = sizedBlock as FunctionDefinition;
        }
        if (nodeViewState.functionNode.viewState.functionNodeSource !== model.viewState.functionNodeSource) {
          nodeViewState.functionNodeExpanded = true;
          setConfirmDialogActive(true);
          diagramRedraw(syntaxTree);
          setFunctionBlock(nodeViewState.functionNode);
        } else {
          setBtnActive(false);
        }
      } catch (e) {
        // console.error(e);
      }
    }
  }

  const onBtnClick = async () => {
    fetchDefinition();
  };

  return (
    <g>
      {!isReadOnly && (
        <g>
          <g
            className={isBtnActive ? "expand-icon-show" : "expand-icon-show-disable"}
            data-testid="func-expand-btn"
            onClick={onBtnClick}
          >
            {!isConfirmDialogActive ? (
              <ShowFunctionSVG {...xyProps} />
            ) : (
              <HideFunctionSVG {...xyProps} />
            )}
          </g>

          {isConfirmDialogActive && functionBlock && (
            <FunctionExpand
              model={functionBlock}
              hideHeader={true}
              {...xyProps}
            />
          )}
        </g>
      )}
    </g>
  );
}
