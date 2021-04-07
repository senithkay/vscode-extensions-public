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
import React, { useContext } from "react";

import { OnFailClause as BallerinaOnFailClause } from "@ballerina/syntax-tree";
import cn from "classnames";

import { Context as DiagramContext } from "../../../Contexts/Diagram";
import { getSTComponents } from "../../utils";
import { FunctionViewState, OnErrorViewState } from "../../view-state";
import { DefaultConfig } from "../../visitors/default";
import { End } from "../End";
import { WorkerLine } from "../WorkerLine";
import "../workerLine/style.scss";

export interface OnFailClauseProps {
    model: BallerinaOnFailClause;
}

export function OnFailClause(props: OnFailClauseProps) {
    // const { state, insertComponentStart } = useContext(DiagramContext);

    const { model } = props;
    const classes = cn("worker-line");
    const viewState: OnErrorViewState = model.viewState as OnErrorViewState;
    const endViewState: FunctionViewState = model.viewState;
    const children = getSTComponents(model.blockStatement.statements);

    let lifeLine: React.ReactNode = null;
    if (viewState) {
        lifeLine = <line x1={viewState.lifeLine.x} y1={viewState.lifeLine.y} x2={viewState.lifeLine.x} y2={viewState.lifeLine.y + viewState.lifeLine.h} />
    }

    const ERRORTITLEWIDTH = 33;
    const TITLEWIDTH = 56;

    return (
        <g>
            <g className={classes}>
                {lifeLine}
            </g>
            <rect id="Rectangle" width={ERRORTITLEWIDTH} height="1" x={viewState.lifeLine.x - ERRORTITLEWIDTH / 2} y={viewState.lifeLine.y} fill="#5567d5" />
            <text x={viewState.lifeLine.x - (TITLEWIDTH / 2)} y={viewState.lifeLine.y - DefaultConfig.dotGap} fill="#32324d" font-size="10" font-family="GilmerBold, Gilmer Bold" letter-spacing="0.05em">ON ERROR</text>
            {...children}
        </g>
    );
}
