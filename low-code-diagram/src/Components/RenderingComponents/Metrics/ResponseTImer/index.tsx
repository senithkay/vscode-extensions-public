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

import { TRIGGER_RECT_SVG_HEIGHT } from "../../ActionInvocation/TriggerSVG";
import "../style.scss"

import { CounterLeftSVG } from "./CounterLeftSVG";

export interface ResponseTimerProps {
    x: number,
    y: number,
    responseTime: string
}

export function ResponseTimerC(props: ResponseTimerProps) {
    const { x, y, responseTime } = props;
    const responseTimeValue = Number(responseTime);
    const value = responseTimeValue > 1000 ? responseTimeValue / 1000 : responseTimeValue;
    const unit = responseTimeValue > 1000 ? " s" : " ms";

    return (
        <g>
            <CounterLeftSVG x={x} y={y - TRIGGER_RECT_SVG_HEIGHT / 2.5} text={value.toString() + unit}/>
        </g>
    );
}

export const ResponseTimer = ResponseTimerC;

export function PerformanceLabelC(props: ResponseTimerProps) {
    const { x, y, responseTime } = props;
    return (
        <g>
            <CounterLeftSVG x={x} y={y - TRIGGER_RECT_SVG_HEIGHT / 2.5} text={responseTime}/>
        </g>
    );
}

export const PerformanceLabel = PerformanceLabelC;
