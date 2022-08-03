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

import cn from "classnames";

import { FunctionViewState, ViewState } from "../../../ViewState";
import { WorkerHighlight } from "../../../Visitors";

import "./style.scss";

export const HIGHLIGHTED_PATH_WIDTH = 4;

export interface WorkerLineProps {
    viewState: ViewState
}

export function WorkerLine(props: WorkerLineProps) {
    const { viewState } = props;
    const functionViewState: FunctionViewState = viewState as FunctionViewState;
    const x = functionViewState.workerLine.x;
    const y = functionViewState.workerLine.y;
    const h = functionViewState.workerLine.h;
    const classes = cn("worker-line");
    const isPathSelected = viewState.isPathSelected;
    const highlightedPaths: WorkerHighlight[] = viewState.highlightedPaths;

    return (
        <g className={classes}>
            {getLines()}
        </g>
    );

    function getLines() {
        const lines: JSX.Element[] = [];
        let cy = y;

        if (highlightedPaths && highlightedPaths.length > 0) {
            for (let i = 0; i < highlightedPaths.length; i++) {
                const element = highlightedPaths[i];
                const isHighlight = i === 0 ? isPathSelected : highlightedPaths[i - 1].highlight;
                lines.push(<line x1={x} y1={cy} x2={x} y2={element.position} strokeWidth={isHighlight ? HIGHLIGHTED_PATH_WIDTH : 1} />)
                cy = element.position;
            }
        }
        lines.push(<line x1={x} y1={cy} x2={x} y2={y + h} strokeWidth={isPathSelected ? HIGHLIGHTED_PATH_WIDTH : 1} />)

        return lines;
    }
}
