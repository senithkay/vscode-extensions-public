/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from 'react'

import { ArrowHead } from '../ArrowHead'

import { ExecutionTimeSVG, EXECUTION_LABEL_SVG_HEIGHT } from './ExecutionTimeSVG';
import "./style.scss"
export const EXECUTION_TIME_IF_X_OFFSET = 170;
export const EXECUTION_TIME_DEFAULT_X_OFFSET = 20;
interface ControlFlowExecutionTimeProps {
    x: number,
    y: number,
    h: number,
    value: number;
}
export default function ControlFlowExecutionTime(props: ControlFlowExecutionTimeProps) {
    const { x, y, h, value } = props;
    return (
        <g className="control-flow-execution">
            <ArrowHead x={x} y={y} direction="up" />
            <ArrowHead x={x} y={y + h} direction="down" />
            <line className="line" x1={x} y1={y} x2={x} y2={y + h - 1} />
            <ExecutionTimeSVG x={x} y={y + (h / 2) - (EXECUTION_LABEL_SVG_HEIGHT / 2)} text={value} />
        </g>
    );
}
