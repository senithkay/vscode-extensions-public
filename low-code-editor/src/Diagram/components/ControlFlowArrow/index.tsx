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
// tslint:disable: jsx-no-multiline-js align  jsx-wrap-multiline
import React, { ReactNode } from "react";

import { ElseViewState } from "../../view-state";
import { ControlFlowData } from "../../view-state/block";
import { DefaultConfig } from "../../visitors/default";
import { BOTTOM_CURVE_SVG_HEIGHT, BOTTOM_CURVE_SVG_WIDTH } from "../IfElse/Else/BottomCurve";
import { TOP_CURVE_SVG_HEIGHT, TOP_CURVE_SVG_WIDTH } from "../IfElse/Else/TopCurve";

import "./style.scss";

export interface ControlFlowProps {
    controlFlowViewState?: ControlFlowData;
    startIf?: boolean;
    endIf?: boolean;
    parentViewState?: ElseViewState;
}


export function ControlFlowArrow(props: ControlFlowProps) {
    const { controlFlowViewState, endIf, startIf, parentViewState } = props;
    const yOffsetForCurve = DefaultConfig.elseCurveYOffset;
    const { h, x, y } = controlFlowViewState;
    const children: React.ReactNode[] = [];
    if (startIf) {
        const topHorizontalLine: ReactNode = (
            <line
                x1={parentViewState.elseTopHorizontalLine.x - yOffsetForCurve}
                y1={parentViewState.elseTopHorizontalLine.y}
                x2={parentViewState.elseTopHorizontalLine.x + parentViewState.elseTopHorizontalLine.length - TOP_CURVE_SVG_WIDTH}
                y2={parentViewState.elseTopHorizontalLine.y}
                className="line"
            />
        );
        const vy = parentViewState.elseBody.y + TOP_CURVE_SVG_HEIGHT - yOffsetForCurve;

        const verticalLine: ReactNode = (
            <line
                x1={x}
                y1={vy}
                x2={x}
                y2={y}
                className="line"
            />
        );

        const topCurve = (
            <svg
                x={parentViewState.elseTopHorizontalLine.x + parentViewState.elseTopHorizontalLine.length - TOP_CURVE_SVG_WIDTH - yOffsetForCurve}
                y={parentViewState.elseTopHorizontalLine.y - yOffsetForCurve}
                width={TOP_CURVE_SVG_WIDTH}
                height={TOP_CURVE_SVG_HEIGHT}
            >
                <path className="line" d="M0,0.5c3.3,0,6,2.7,6,6c0,0,0,0,0,0" />
            </svg>
        );

        children.push(verticalLine);
        children.push(topHorizontalLine);
        children.push(topCurve);
    }

    if (endIf && !parentViewState.isEndComponentAvailable) {
        const bottomHorizontalLine: ReactNode = (
            <line
                x1={parentViewState.elseBottomHorizontalLine.x - yOffsetForCurve}
                y1={parentViewState.elseBottomHorizontalLine.y}
                x2={parentViewState.elseBottomHorizontalLine.x + parentViewState.elseBottomHorizontalLine.length - TOP_CURVE_SVG_WIDTH - yOffsetForCurve}
                y2={parentViewState.elseBottomHorizontalLine.y}
                className="line"
            />
        );
        const vy = parentViewState.elseBottomHorizontalLine.y - BOTTOM_CURVE_SVG_HEIGHT - yOffsetForCurve;
        const verticalLine: ReactNode = (
            <line
                x1={x}
                y1={vy}
                x2={x}
                y2={y}
                className="line"
            />
        );
        const bottomCurve = (
            <svg
                x={parentViewState.elseBody.x - BOTTOM_CURVE_SVG_WIDTH + yOffsetForCurve}
                y={parentViewState.elseBody.y + parentViewState.elseBody.length - BOTTOM_CURVE_SVG_HEIGHT}
                width={TOP_CURVE_SVG_WIDTH}
                height={TOP_CURVE_SVG_HEIGHT}
            >
                <path className="line" d="M6,0c0,3.3-2.7,6-6,6c0,0,0,0,0,0" />
            </svg>
        );

        children.push(verticalLine);
        children.push(bottomHorizontalLine);
        children.push(bottomCurve);
    }
    return (
        <g className="control-flow-arrow">
            {children}
            <line
                x1={x}
                y1={y}
                x2={x}
                y2={y + h}
                className="line"
            />
        </g>

    );
}
