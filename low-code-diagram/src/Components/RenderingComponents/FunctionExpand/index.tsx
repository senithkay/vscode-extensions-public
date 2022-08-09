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
import cn from "classnames";

import { Context } from "../../../Context/diagram";
import { useOverlayRef, useSelectedStatus } from "../../../hooks";
import { BlockViewState, FunctionViewState } from "../../../ViewState";
import ControlFlowArrow from "../ControlFlowArrow";
import { End } from "../End";
import { StartButton } from "../Start";
import { WorkerBody } from "../WorkerBody";
import { WorkerLine } from "../WorkerLine";

import "./style.scss";
import { PROCESS_SVG_HEIGHT } from "../Processor/ProcessSVG";
import { DefaultConfig } from "../../../Visitors";

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
    block.viewState.functionNodeFilePath = viewState.functionNodeFilePath;
    block.viewState.functionNodeSource = viewState.functionNodeSource;
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
        {/* {isInitPlusAvailable && <StartButton model={model} />}
        {!isInitPlusAvailable && <StartButton model={model} />} */}
        {!isInitPlusAvailable && (
          <WorkerBody model={block} viewState={block.viewState} expandReadonly={true} />
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
  const blockWidth = model.viewState.bBox.w + model.functionBody.viewState.bBox.rw + 25;

  const expandViewX = 150;
  const arrowSpaceX = 70;
  const arrowSpaceY = 10;
  const arrowWidth = 220;

  return (
    <svg
      x={0}
      y={xyProps.y - (PROCESS_SVG_HEIGHT + DefaultConfig.dotGap)}
      // y={xyProps.y + (PROCESS_SVG_HEIGHT / 4) * 3 - DefaultConfig.dotGap}
      // y={xyProps.y - expandViewX / 2}
      // x={expandViewX}
      className="expand-expression"
    >
      {/* <g className={arrowClasses}>
        <ControlFlowArrow
          isDotted={false}
          x={model.viewState.bBox.cx + arrowSpaceX}
          y={model.viewState.bBox.cy}
          w={arrowWidth}
        />
        <ControlFlowArrow
          isDotted={true}
          x={model.viewState.bBox.cx + arrowSpaceX}
          y={model.viewState.bBox.cy + arrowSpaceY}
          w={arrowWidth / 2}
          h={blockHeight}
          isTurnArrow={true}
        />
      </g>
      <svg
        x={model.viewState.bBox.cx + expandViewX / 2 + arrowSpaceX}
        y={model.viewState.bBox.cy - (arrowSpaceX + arrowSpaceY)}
      > */}
      <rect
        y={PROCESS_SVG_HEIGHT + PROCESS_SVG_HEIGHT/2}
        x="40"
        width={blockWidth}
        height={blockHeight - (PROCESS_SVG_HEIGHT * 2 + DefaultConfig.dotGap * 2 + DefaultConfig.dotGap / 2)}
        // height={blockHeight - DefaultConfig.dotGap * 2}
        rx="30"
        strokeDasharray={"0.3em"}
        strokeWidth={1}
        fill={"none"}
        stroke={"#5567D5"}
      />
        {component}
      {/* </svg> */}
    </svg>
  );
}
