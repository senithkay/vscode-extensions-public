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
// tslint:disable: jsx
import React from 'react'
import { useLocation } from "react-router-dom";

import { BOTTOM_CURVE_SVG_HEIGHT, BOTTOM_CURVE_SVG_WIDTH } from '../IfElse/Else/BottomCurve';

export interface ControlFlowElseEndProp {
    x: number;
    y: number;
    h: number;
    w: number;
}

export default function ControlFlowElseEnd(props: ControlFlowElseEndProp) {
    const { h, w, x, y } = props;

    const location = useLocation();
    const enableControlFlow = new URLSearchParams(location.search).get("enableControlFlow") === "true";
    if (!enableControlFlow) {
        return null;
    }

    return (
        <g className="control-flow-line">
            <line
                x1={x}
                y1={y}
                x2={x + w - BOTTOM_CURVE_SVG_WIDTH}
                y2={y}
                className="line"
            />
            <svg
                x={x + w - BOTTOM_CURVE_SVG_WIDTH}
                y={y - BOTTOM_CURVE_SVG_HEIGHT}
                width={BOTTOM_CURVE_SVG_WIDTH}
                height={BOTTOM_CURVE_SVG_HEIGHT}
            >
                <path className="line" d="M6,0c0,3.3-2.7,6-6,6c0,0,0,0,0,0" />
            </svg>
            <line
                x1={x + w}
                y1={y - BOTTOM_CURVE_SVG_HEIGHT - h}
                x2={x + w}
                y2={y - BOTTOM_CURVE_SVG_HEIGHT}
                className="line"
            />
        </g>
    );
}
