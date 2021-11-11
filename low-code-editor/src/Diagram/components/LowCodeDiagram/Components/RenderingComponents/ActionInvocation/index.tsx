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

import { LocalVarDecl, STNode } from "@ballerina/syntax-tree";
import cn from "classnames";

import { Context } from "../../../../../../Contexts/Diagram";
import { SimpleBBox, StatementViewState } from "../../../../../view-state";
import { DefaultConfig } from "../../../../../visitors/default";
import { ConnectorProcessSVG, CONNECTOR_PROCESS_SVG_WIDTH, CONNECTOR_PROCESS_SVG_WIDTH_WITH_SHADOW } from "../Connector/ConnectorProcess/ConnectorProcessSVG";
import ControlFlowArrow from "../ControlFlowArrow";
import { Metrics } from "../Metrics";
import { Performance } from "../Performace";
import { DataProcessor } from "../Processor";
import { PROCESS_SVG_HEIGHT, PROCESS_SVG_WIDTH } from "../Processor/ProcessSVG";

import { ActionInvoLine } from "./ActionInvoLine";
import { ActionProcessor } from "./ActionProcess";
import "./style.scss";
import { TriggerSVG, TRIGGER_SVG_HEIGHT, TRIGGER_SVG_WIDTH } from "./TriggerSVG";
export interface ConnectorLineProps {
    model: STNode
}

export function ActionInvocation(props: ConnectorLineProps) {
    const { model } = props;
    const { props: { isPerformanceViewOpen } } = useContext(Context);
    const classes = cn("action-invocation");
    const leftline = "leftline";
    const dashedLine = "dashedLine";

    // This is where the logic placed to find action invocation in the function body.
    const clientInvoVarDef: LocalVarDecl = model as LocalVarDecl;

    const viewState: StatementViewState = clientInvoVarDef.viewState;
    const triggerViewState: SimpleBBox = viewState.action.trigger;

    const lifeLineCX = triggerViewState.cx - (TRIGGER_SVG_WIDTH / 2);

    const x = viewState.bBox.cx;
    const y = viewState.bBox.cy;

    const actionLineStartX = x + (PROCESS_SVG_WIDTH / 2) + DefaultConfig.actionArrowPadding;
    const actionLineEndX = lifeLineCX;
    const actionLineWidth = actionLineEndX - actionLineStartX;
    const actionRightLineY = y + (PROCESS_SVG_HEIGHT / 2) - DefaultConfig.actionArrowGap / 2;
    const actionLeftLineY = y + (PROCESS_SVG_HEIGHT / 2) + DefaultConfig.actionArrowGap / 2;
    const triggerSVGX = lifeLineCX;
    const triggerSVGY = viewState.bBox.cy;

    const truncatedActionName = (
        viewState.action.actionName.length > 8 && viewState.action.actionName ? viewState.action.actionName.slice(0, 7) + "..." : viewState.action.actionName
    );

    const controlFlowArrowC = (
        <g>
            <ControlFlowArrow isDotted={false} x={actionLineStartX} y={actionRightLineY} w={actionLineWidth} />
            <ControlFlowArrow isDotted={true} x={actionLineStartX} y={actionLeftLineY} w={actionLineWidth} />
        </g>
    );
    const controlFlowArrow = viewState?.isReached ? controlFlowArrowC : null;

    return (
        <g>
            <ActionProcessor model={model} />
            <g className={classes}>
                <ActionInvoLine
                    clientInvoX={actionLineStartX}
                    clientInvoY={actionRightLineY}
                    actionX={actionLineEndX}
                    actionY={actionRightLineY}
                    direction={"right"}
                    className={leftline}
                />
                <TriggerSVG
                    x={triggerSVGX}
                    y={triggerSVGY}
                />
                <text
                    x={x + CONNECTOR_PROCESS_SVG_WIDTH_WITH_SHADOW / 2 + (DefaultConfig.dotGap / 2)}
                    y={viewState.bBox.cy + DefaultConfig.textLine.height + DefaultConfig.dotGap}
                    width={DefaultConfig.textLine.padding + DefaultConfig.textLine.width + DefaultConfig.textLine.padding}
                    className={'method-text'}
                >
                    {isPerformanceViewOpen ? truncatedActionName : viewState.action.actionName}
                </text>
                <ActionInvoLine
                    actionX={actionLineStartX}
                    actionY={actionLeftLineY}
                    clientInvoX={actionLineEndX}
                    clientInvoY={actionLeftLineY}
                    direction={"left"}
                    className={dashedLine}
                />
                <Metrics
                    syntaxTree={model}
                    lineStartX={actionLineStartX}
                    lineStartY={actionLeftLineY}
                    actionLineWidth={actionLineWidth}
                    triggerSVGX={triggerSVGX}
                    triggerSVGY={triggerSVGY}
                />
                <Performance
                    syntaxTree={model}
                    triggerSVGX={triggerSVGX}
                    triggerSVGY={triggerSVGY}
                />
            </g>
            {controlFlowArrow}
        </g>
    );
}
