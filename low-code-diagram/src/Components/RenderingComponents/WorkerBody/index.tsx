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

import { Context } from "../../../Context/diagram";
import { getDraftComponent, getSTComponents } from "../../../Utils";
import { BlockViewState } from "../../../ViewState";
import { PlusButton } from "../../PlusButtons/Plus";
import { Collapse } from "../Collapse";
import ControlFlowExecutionTime from "../ControlFlowExecutionTime";
import { ControlFlowLine } from "../ControlFlowLine";

export interface DiagramProps {
    model: FunctionBodyBlock | BlockStatement,
    viewState: BlockViewState;
    expandReadonly?: boolean;
}

export function WorkerBody(props: DiagramProps) {
    const { state, actions: { insertComponentStart } } = useContext(Context);

    const { expandReadonly, model, viewState } = props;
    const pluses: React.ReactNode[] = [];
    const workerArrows: React.ReactNode[] = [];
    let children: React.ReactNode[] = [];
    let drafts: React.ReactNode[] = [];
    const controlFlowLines: React.ReactNode[] = [];
    const controlFlowExecutionTime: React.ReactNode[] = [];
    const workerIndicatorLine: React.ReactNode[] = [];

    if (STKindChecker.isFunctionBodyBlock(model) && viewState.hasWorkerDecl) {
        children = children.concat(
            getSTComponents(model.namedWorkerDeclarator.workerInitStatements, viewState, model, expandReadonly));
        children = children.concat(
            getSTComponents(model.namedWorkerDeclarator.namedWorkerDeclarations, viewState, model, expandReadonly))
    }
    children = children.concat(getSTComponents(model.statements, viewState, model, expandReadonly))

    for (const controlFlowLine of viewState.controlFlow.lineStates) {
        controlFlowLines.push(<ControlFlowLine controlFlowViewState={controlFlowLine} />);
    }

    for (const plusView of viewState.plusButtons) {
        if (!expandReadonly) {
            pluses.push(<PlusButton viewState={plusView} model={model} initPlus={false} />)
        }
    }

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

    if (viewState.hasWorkerDecl) {
        workerIndicatorLine.push((
            <>
                <circle
                    cx={viewState.workerIndicatorLine.x}
                    cy={viewState.workerIndicatorLine.y}
                    r="6"
                    style={{ stroke: '#5567D5', strokeWidth: 1, fill: '#fff' }}
                />
                <circle
                    cx={viewState.workerIndicatorLine.x}
                    cy={viewState.workerIndicatorLine.y}
                    r="4"
                    style={{ stroke: '#5567D5', strokeWidth: 1, fill: '#5567D5' }}
                />
                <line
                    x1={viewState.workerIndicatorLine.x}
                    y1={viewState.workerIndicatorLine.y}
                    x2={viewState.workerIndicatorLine.x + viewState.workerIndicatorLine.w}
                    y2={viewState.workerIndicatorLine.y}
                    strokeDasharray={'5, 5'}
                    style={{ stroke: '#5567D5', strokeWidth: 1 }}
                />
            </>
        ))
    }

    for (const executionTime of viewState?.controlFlow.executionTimeStates) {
        if (executionTime.value) {
            controlFlowExecutionTime.push(<ControlFlowExecutionTime x={executionTime.x} y={executionTime.y} value={executionTime.value} h={executionTime.h} />);
        }
    }
    // if (viewState?.collapseView) {
    //     children.push(<Collapse blockViewState={viewState} />)
    // }
    if (viewState.collapsedViewStates.length > 0) {
        // TODO: handle collapse ranges rendering
    }

    if (viewState?.draft) {
        drafts = getDraftComponent(viewState, state, insertComponentStart);
    }

    return (
        <>
            {controlFlowLines}
            {pluses}
            {workerIndicatorLine}
            {workerArrows}
            {children}
            {drafts}
            {controlFlowExecutionTime}
        </>
    );
}
