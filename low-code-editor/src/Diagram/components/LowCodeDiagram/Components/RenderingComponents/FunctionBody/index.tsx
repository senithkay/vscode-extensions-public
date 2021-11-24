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
import React, { useContext, useRef, useState } from "react";

import {
  FunctionBodyBlock,
  FunctionDefinition,
  STKindChecker
} from "@ballerina/syntax-tree";
import cn from "classnames";
import { v4 as uuid } from "uuid";

import { Context } from "../../../../../../Contexts/Diagram";
import { useSelectedStatus } from "../../../../../hooks";
import { useStyles } from "../../../../../styles";
import { BlockViewState, FunctionViewState } from "../../../ViewState";
import ControlFlowArrow from "../ControlFlowArrow";
import { End } from "../End";
import { StartButton } from "../Start";
import { WorkerBody } from "../WorkerBody";
import { WorkerLine } from "../WorkerLine";

import "./style.scss";

export const FUNCTION_PLUS_MARGIN_TOP = 7.5;
export const FUNCTION_PLUS_MARGIN_BOTTOM = 7.5;
export const FUNCTION_PLUS_MARGIN_LEFT = 10;

export interface FunctionProps {
  model: FunctionDefinition;
  onClose: () => void;
  x: number;
  y: number;
}

export function FunctionBody(props: FunctionProps) {
  const classes = useStyles();
  const { state } = useContext(Context);
  const [overlayId] = useState(`function-overlay-${uuid()}`);
  const {
    props: { isWaitingOnWorkspace, isReadOnly, isCodeEditorActive },
  } = useContext(Context);

  const { model, onClose, ...xyProps } = props;

  const viewState: FunctionViewState = model.viewState;
  const isInitPlusAvailable: boolean = viewState.initPlus !== undefined;
  const isExpressionFuncBody: boolean = STKindChecker.isExpressionFunctionBody(
    model.functionBody
  );

  const containerRef = useRef(null);
  const isSelected = useSelectedStatus(model, containerRef);
  const [diagramExpanded, setDiagramExpanded] = useState(isSelected);

  React.useEffect(() => {
    setDiagramExpanded(isSelected);
  }, [isSelected]);

  const onExpandClick = () => {
    setDiagramExpanded(!diagramExpanded);
  };

  let component: JSX.Element;

  if (isExpressionFuncBody) {
    component = (
      <g>
        <StartButton model={model} />
        <WorkerLine viewState={viewState} />
        <End
          model={model.functionBody}
          viewState={viewState.end}
          isExpressionFunction={true}
        />
      </g>
    );
  } else {
    const block: FunctionBodyBlock = model.functionBody as FunctionBodyBlock;
    const isStatementsAvailable: boolean = block.statements.length > 0;
    const bodyViewState: BlockViewState = block.viewState;

    component = (
      <g>
        <>
          {!isReadOnly &&
            isInitPlusAvailable &&
            !isCodeEditorActive &&
            !isWaitingOnWorkspace &&
            !viewState.initPlus.isTriggerDropdown && (
              <WorkerLine viewState={viewState} />
            )}
        </>

        {!isInitPlusAvailable && <WorkerLine viewState={viewState} />}
        {isInitPlusAvailable && <StartButton model={model} />}
        {!isInitPlusAvailable && <StartButton model={model} />}
        {!isInitPlusAvailable && (
          <WorkerBody model={block} viewState={block.viewState} />
        )}
        {!isInitPlusAvailable &&
          isStatementsAvailable &&
          (!bodyViewState?.isEndComponentInMain ||
            bodyViewState?.collapseView) && <End viewState={viewState.end} />}
      </g>
    );
  }

  const arrowClasses = cn("action-invocation");
  const blockHeight = model.viewState.bBox.h;
  const blockWidth = model.viewState.bBox.w;
  const functionBody = (
    <svg {...xyProps} className="expand-expression">
      {/* <rect width="100%" height="100%" fill="red"/> */}
      {/* <FunctionProvider overlayId={overlayId}> */}

      {/* <Canvas h={model.viewState.bBox.h} w={model.viewState.bBox.w}> */}
      <g className={arrowClasses}>
        <ControlFlowArrow isDotted={false} x={model.viewState.bBox.cx + 30} y={model.viewState.bBox.cy} w={60} />
        <ControlFlowArrow isDotted={true} x={model.viewState.bBox.cx + 30} y={model.viewState.bBox.cy + 10} w={60} />
      </g>
      <svg x={model.viewState.bBox.cx + 20} y={model.viewState.bBox.cy - 80}>
        <rect y="50" x="80" width={blockWidth - 50} height={blockHeight} rx="30" strokeDasharray={'0.3em'} strokeWidth={1} fill={'rgba(240,241,251,0.5)'} stroke={'#5567D5'} />
        {component}
      </svg>
      {/* </Canvas> */}
      {/* </PanAndZoom> */}
      {/* </FunctionProvider> */}
    </svg>
  );

  // const functionModal = (
  //   <div className="holder-wrapper-large">
  //         <button className="close-button" onClick={onClose}>
  //             <CloseIcon />
  //         </button>
  //       <div className="element-options">
  //           {functionBody}
  //       </div>
  //   </div>
  // );

  return functionBody
}
