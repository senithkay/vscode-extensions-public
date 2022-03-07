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

import { FunctionBodyBlock } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Context/diagram";
import { getDraftComponent, getSTComponents } from "../../../Utils";
import { BlockViewState } from "../../../ViewState";
import { PlusButton } from "../../PlusButtons/Plus";
import { Collapse } from "../Collapse";
import ControlFlowExecutionTime from "../ControlFlowExecutionTime";
import { ControlFlowLine } from "../ControlFlowLine";

export interface DiagramProps {
    model: FunctionBodyBlock,
    viewState: BlockViewState
}

export function WorkerBody(props: DiagramProps) {
    const { state, actions: { insertComponentStart } } = useContext(Context);

    const { model, viewState } = props;
    const pluses: React.ReactNode[] = [];
    const children = getSTComponents(model.statements);
    let drafts: React.ReactNode[] = [];
    const controlFlowLines: React.ReactNode[] = [];
    const controlFlowExecutionTime: React.ReactNode[] = [];

    for (const controlFlowLine of viewState.controlFlow.lineStates) {
        controlFlowLines.push(<ControlFlowLine controlFlowViewState={controlFlowLine} />);
    }

    for (const plusView of viewState.plusButtons) {
        pluses.push(<PlusButton viewState={plusView} model={model} initPlus={false} />)
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
            {children}
            {drafts}
            {controlFlowExecutionTime}
        </g>
    );
}
