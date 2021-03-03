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

import { STNode } from "@ballerina/syntax-tree";
import cn from "classnames";

import { StatementViewState } from "../../view-state";
import { DefaultConfig } from "../../visitors/default";

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

    const viewState: StatementViewState = model.viewState as StatementViewState;

    const classes = cn("connector", { selected });
    const component = (
        <g className={classes} onClick={toggleSelection}>
            <line x1={x} y1={y} x2={x} y2={y + h} />
            <text
                x={x}
                y={y - DefaultConfig.textLine.height - (DefaultConfig.dotGap * 2)}
                textAnchor="middle"
                dominantBaseline="central"
                className='endpont-name'
            >
                {connectorName}
            </text>
        </g>
    );
    return (
        !viewState.endpoint.collapsed && component
    );
}
