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
import * as React from "react";

import { LocalVarDecl, STNode } from "@ballerina/syntax-tree";
import cn from "classnames";

import { SimpleBBox, StatementViewState } from "../../view-state";
import { DefaultConfig } from "../../visitors/default";
import { Metrics } from "../Metrics";
import { Performance } from "../Performace";

import { ActionInvoLine } from "./ActionInvoLine";
import { ConnectorClient } from "./ConnectorClient";
import { CLIENT_RADIUS, CLIENT_SHADOW_OFFSET, CLIENT_SVG_WIDTH_WITH_SHADOW } from "./ConnectorClient/ConnectorClientSVG";
import "./style.scss";
import { TriggerSVG, TRIGGER_SVG_HEIGHT, TRIGGER_SVG_WIDTH } from "./TriggerSVG";
export interface ConnectorLineProps {
    model: STNode
}

export function ActionInvocation(props: ConnectorLineProps) {
    const { model } = props;
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

    const actionLineStartX = x + CLIENT_RADIUS + DefaultConfig.actionArrowPadding;
    const actionLineEndX = lifeLineCX;
    const actionLineWidth = actionLineEndX - actionLineStartX;
    const actionRightLineY = y + CLIENT_RADIUS - DefaultConfig.actionArrowGap;
    const actionLeftLineY = y + CLIENT_RADIUS + DefaultConfig.actionArrowGap;
    const triggerSVGX = lifeLineCX;
    const triggerSVGY = viewState.bBox.cy;

    const truncatedActionName = (
        viewState.action.actionName.length > 8 && viewState.action.actionName ? viewState.action.actionName.slice(0, 7) + "..." : viewState.action.actionName
    );

    useEffect(() => {
        dispatchDiagramRedraw(syntaxTree);
    }, [isPerformanceViewOpen]);

    return (
        <g>
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
                    x={triggerViewState.cx + (TRIGGER_SVG_WIDTH / 2)}
                    y={viewState.bBox.cy + (TRIGGER_SVG_HEIGHT / 2) + DefaultConfig.textLine.height}
                    width={DefaultConfig.textLine.padding + DefaultConfig.textLine.width + DefaultConfig.textLine.padding}
                    className={'method-text'}
                >
                    {isPerformanceViewOpen ?  truncatedActionName : viewState.action.actionName}
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
            <ConnectorClient model={model} />
        </g>
    );
}

const mapStateToProps = ({ obsViewState, diagramState }: PortalState) => {
    const isPerformanceViewOpen = obsViewState.analysisInfo.isPerformanceViewOpen;
    const syntaxTree = diagramState.syntaxTree;
    return {
        isPerformanceViewOpen, syntaxTree
    }
};

const mapDispatchToProps = {
    dispatchDiagramRedraw: diagramRedrawST,
};

export const ActionInvocation = connect(mapStateToProps, mapDispatchToProps)(ActionInvocationC);
