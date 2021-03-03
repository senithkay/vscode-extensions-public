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

import { ArrowHead } from "../../ArrowHead";
import "../style.scss";

export interface DoubleArrowHeadLineProps {
    startX: number,
    endX: number,
    startY: number,
    endY: number,
    direction: "vertical" | "horizontal",
    className: string
}

export function DoubleArrowHeadLineC(props: DoubleArrowHeadLineProps) {
    const { startX, endX, startY, endY, direction, className } = props;

    return (
        <g>
            <ArrowHead x={startX} y={startY} direction={direction === "vertical" ? "up" : "left"} />
            <line x1={startX} y1={startY} x2={endX} y2={endY} className={className}/>
            <ArrowHead x={endX} y={endY} direction={direction === "vertical" ? "down" : "right"} />
        </g>
    );
}

export const DoubleArrowHeadLine = DoubleArrowHeadLineC;
