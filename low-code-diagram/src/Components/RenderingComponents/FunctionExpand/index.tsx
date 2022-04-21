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
  STKindChecker,
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Context/diagram";
import { useOverlayRef, useSelectedStatus } from "../../../hooks";
import { BlockViewState, FunctionViewState } from "../../../ViewState";
import { End } from "../End";
import { StartButton } from "../Start";
import { WorkerBody } from "../WorkerBody";
import { WorkerLine } from "../WorkerLine";

import "./style.scss";
import ControlFlowArrow from "../ControlFlowArrow";
import cn from "classnames";

export const FUNCTION_PLUS_MARGIN_TOP = 7.5;
export const FUNCTION_PLUS_MARGIN_BOTTOM = 7.5;
export const FUNCTION_PLUS_MARGIN_LEFT = 10;

export interface FunctionProps {
  model: FunctionDefinition;
  hideHeader?: boolean;
  x?: number;
  y?: number;
}

export function FunctionExpand(props: FunctionProps) {
  const diagramContext = useContext(Context);
  const { isReadOnly } = diagramContext.props;

  const { model, hideHeader, ...xyProps } = props;

  const viewState: FunctionViewState = model.viewState;
  const isInitPlusAvailable: boolean = viewState.initPlus !== undefined;
  const isExpressionFuncBody: boolean = STKindChecker.isExpressionFunctionBody(
    model.functionBody
  );

  const containerRef = useRef(null);
  const [diagramExpanded, setDiagramExpanded] = useSelectedStatus(
    model,
    containerRef
  );
  const [overlayNode, overlayRef] = useOverlayRef();

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
    const isStatementsAvailable: boolean =
      block.statements.length > 0 || !!block.namedWorkerDeclarator;
    const bodyViewState: BlockViewState = block.viewState;

    component = (
      <g>
        <>
          {!isReadOnly &&
            isInitPlusAvailable &&
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
  const svgWidth = model ? model.functionName.value.length * 5 : 0;

  return (
    <svg y={xyProps.y - 150 / 2} x={svgWidth} className="expand-expression">
      <g className={arrowClasses}>
        <ControlFlowArrow
          isDotted={false}
          x={model.viewState.bBox.cx + 150 / 2 + 15}
          y={model.viewState.bBox.cy}
          w={60}
        />
        <ControlFlowArrow
          isDotted={true}
          x={model.viewState.bBox.cx + 150 / 2 + 15}
          y={model.viewState.bBox.cy + 10}
          w={30}
          h={blockHeight}
          isTurnArrow={true}
        />
      </g>
      <svg
        x={model.viewState.bBox.cx + 150 / 2 + 15}
        y={model.viewState.bBox.cy - 80}
      >
        <rect
          y="50"
          x="80"
          width={blockWidth}
          height={blockHeight - 60}
          rx="30"
          strokeDasharray={"0.3em"}
          strokeWidth={1}
          fill={"rgba(240,241,251,0.5)"}
          stroke={"#5567D5"}
        />
        {component}
      </svg>
    </svg>
  );
}
