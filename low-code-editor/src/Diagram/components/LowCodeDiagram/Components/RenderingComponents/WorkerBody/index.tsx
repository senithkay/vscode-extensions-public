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
import React, { useContext } from "react";

import { BlockStatement, FunctionBodyBlock, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../../Contexts/Diagram";
import { getDraftComponent, getSTComponents } from "../../../../../utils";
import { Context } from "../../../Context/diagram";
import { BlockViewState } from "../../../ViewState";
import { PlusButton } from "../../PlusButtons/Plus";
import { Collapse } from "../Collapse";
import ControlFlowExecutionTime from "../ControlFlowExecutionTime";
import { ControlFlowLine } from "../ControlFlowLine";
export interface DiagramProps {
    model: FunctionBodyBlock | BlockStatement,
    viewState: BlockViewState
}

export function WorkerBody(props: DiagramProps) {
    const { state, actions: { insertComponentStart }, props: { experimentalEnabled } } = useDiagramContext();

    const { model, viewState } = props;
    const pluses: React.ReactNode[] = [];
    const workerArrows: React.ReactNode[] = [];
    let children: React.ReactNode[] = [];
    let drafts: React.ReactNode[] = [];
    const controlFlowLines: React.ReactNode[] = [];
    const controlFlowExecutionTime: React.ReactNode[] = [];

    if (STKindChecker.isFunctionBodyBlock(model) && viewState.hasWorkerDecl && experimentalEnabled) {
        children = children.concat(getSTComponents(model.namedWorkerDeclarator.workerInitStatements));
        children = children.concat(getSTComponents(model.namedWorkerDeclarator.namedWorkerDeclarations))
    }
    children = children.concat(getSTComponents(model.statements))

    for (const controlFlowLine of viewState.controlFlow.lineStates) {
        controlFlowLines.push(<ControlFlowLine controlFlowViewState={controlFlowLine} />);
    }

    for (const plusView of viewState.plusButtons) {
        pluses.push(<PlusButton viewState={plusView} model={model} initPlus={false} />)
    }

    if (experimentalEnabled) {
        for (const workerArrow of viewState.workerArrows) {
            workerArrows.push(
                <line
                    style={{ stroke: '#5567D5', strokeWidth: 1 }}
                    markerEnd="url(#arrowhead)"
                    x1={workerArrow.x}
                    y1={workerArrow.y}
                    x2={workerArrow.x + workerArrow.w}
                    y2={workerArrow.y}
                />
            )
        }
    }

    for (const executionTime of viewState?.controlFlow.executionTimeStates) {
        if (executionTime.value) {
            controlFlowExecutionTime.push(<ControlFlowExecutionTime x={executionTime.x} y={executionTime.y} value={executionTime.value} h={executionTime.h} />);
        }
    }
    if (viewState?.collapseView) {
        children.push(<Collapse blockViewState={viewState} />)
    }

    if (viewState?.draft) {
        drafts = getDraftComponent(viewState, state, insertComponentStart);
    }

    return (
        <g>
            {controlFlowLines}
            {pluses}
            {workerArrows}
            {children}
            {drafts}
            {controlFlowExecutionTime}
        </g>
    );
}
