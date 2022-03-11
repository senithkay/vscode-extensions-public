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

import { STNode } from "@wso2-enterprise/syntax-tree";
import cn from "classnames";

import { EndpointViewState, StatementViewState } from "../../../ViewState";
import { DefaultConfig } from "../../../Visitors/default";
import { ActionInvoLine } from "../ActionInvocation/ActionInvoLine";
import ControlFlowArrow from "../ControlFlowArrow";

import { ConnectorHeader } from "./ConnectorHeader";
import { CLIENT_RADIUS, CLIENT_SHADOW_OFFSET, CLIENT_SVG_HEIGHT, CLIENT_SVG_WIDTH_WITH_SHADOW } from "./ConnectorHeader/ConnectorClientSVG";
import { ConnectorProcess } from "./ConnectorProcess";
import { CONNECTOR_PROCESS_SVG_WIDTH } from "./ConnectorProcess/ConnectorProcessSVG";
import "./style.scss";

export interface ConnectorProps {
    model: STNode,
    connectorName: string,
    x: number,
    y: number,
    h: number
}

export function Connector(props: ConnectorProps) {
    const { connectorName, x, y, h, model } = props;
    const [selected, setSelected] = React.useState(false);
    const toggleSelection = () => {
        setSelected(!selected);
    };

    const classes = cn("connector", { selected });
    let component: any;

    const viewState: StatementViewState = model.viewState as StatementViewState;
    const epViewState: EndpointViewState = viewState.endpoint;
    if (epViewState.isExternal) {
        component = (
            <g>

                <g className={classes} onClick={toggleSelection}>
                    <line x1={x} y1={y} x2={x} y2={y + h} />
                    <text
                        x={x}
                        y={y - CLIENT_SVG_HEIGHT - DefaultConfig.textLine.height - (DefaultConfig.dotGap * 2)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className='endpont-name'
                    >
                        {connectorName}
                    </text>
                </g>
                <g>
                    <ConnectorHeader model={model} />
                </g>
            </g>
        );
    } else {
        const arrowClasses = cn("action-invocation");
        const leftline = "leftline";
        const actionLineStartX = viewState.bBox.cx + (CONNECTOR_PROCESS_SVG_WIDTH / 2) + DefaultConfig.actionArrowPadding;
        const actionLineEndX = x - (CLIENT_RADIUS) - DefaultConfig.actionArrowPadding;
        const actionRightLineY = viewState.bBox.cy + (CONNECTOR_PROCESS_SVG_WIDTH / 2);

        const connectorHeadX = x - (CLIENT_SVG_WIDTH_WITH_SHADOW / 2);
        const connectorHeadY = viewState.bBox.cy - (CLIENT_SHADOW_OFFSET / 2);
        const controlFlowArrow = viewState?.isReached ? <ControlFlowArrow isDotted={false} x={actionLineStartX} y={actionRightLineY} w={actionLineEndX - actionLineStartX} /> : null;
        component = (
            <g>
                <ConnectorProcess model={model} />
                <g className={classes} onClick={toggleSelection}>
                    <line x1={x} y1={viewState.bBox.cy + CLIENT_RADIUS} x2={x} y2={viewState.bBox.cy + h} />
                    <text
                        x={x}
                        y={viewState.bBox.cy - DefaultConfig.textLine.height - (DefaultConfig.dotGap * 2)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className='endpont-name'
                    >
                        {connectorName}
                    </text>
                </g>
                <g>
                    <ConnectorHeader model={model} />
                </g>
                <g className={arrowClasses}>
                    <ActionInvoLine
                        clientInvoX={actionLineStartX}
                        clientInvoY={actionRightLineY}
                        actionX={actionLineEndX}
                        actionY={actionRightLineY}
                        direction={"right"}
                        className={leftline}
                    />
                </g>
                <g>
                    {controlFlowArrow}
                </g>
            </g>
        );
    }
    return (
        !viewState.endpoint.collapsed && component
    );
}
