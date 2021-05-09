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
// tslint:disable: jsx-no-multiline-js
import React, { useContext } from "react";

import { OnFailClause as BallerinaOnFailClause } from "@ballerina/syntax-tree";
import cn from "classnames";

import { Context as DiagramContext } from "../../../Contexts/Diagram";
import { getDraftComponent, getSTComponents } from "../../utils";
import { BlockViewState, FunctionViewState, OnErrorViewState } from "../../view-state";
import { DefaultConfig } from "../../visitors/default";
import { End } from "../End";
import { PlusButton } from "../Plus";
import { WorkerLine } from "../WorkerLine";

import "./style.scss";

export interface OnFailClauseProps {
    model: BallerinaOnFailClause;
}

const ERRORTITLEWIDTH = 33;
const TITLEWIDTH = 56;
const TITLEHEIGHT = 5;
const GLOBALERRORPATH = 127;

export function OnFailClause(props: OnFailClauseProps) {
    const { state, insertComponentStart } = useContext(DiagramContext);

    const { model } = props;
    const classes = cn("on-error-line");
    const onFailSeparator = cn("on-error-separator");
    const onFailClauseSVGClass = cn("on-fail-container");
    const viewState: OnErrorViewState = model.viewState as OnErrorViewState;
    const blockViewState: BlockViewState = model.blockStatement.viewState as BlockViewState;
    const children = getSTComponents(model.blockStatement.statements);
    const pluses: React.ReactNode[] = [];
    let drafts: React.ReactNode[] = [];

    // TODO: Figureout how to provide plus UI in to on error diagram.
    for (const plusView of blockViewState.plusButtons) {
        pluses.push(<PlusButton viewState={plusView} model={model.blockStatement} initPlus={false} />)
    }

    if (blockViewState?.draft) {
        drafts = getDraftComponent(blockViewState, state, insertComponentStart);
    }

    let lifeLine: React.ReactNode = null;
    if (viewState) {
        lifeLine = <line x1={viewState.lifeLine.x} y1={viewState.lifeLine.y} x2={viewState.lifeLine.x} y2={viewState.lifeLine.y + viewState.lifeLine.h} />
    }

    return (
        // <svg x={viewState.bBox.cx} y={viewState.bBox.cy} width={viewState.bBox.w} height={viewState.bBox.h} className={onFailClauseSVGClass}>
            <g x={viewState.bBox.cx} y={viewState.bBox.cy}>
                <g className={classes}>
                    {lifeLine}
                </g>
                <g className={onFailSeparator}>
                    <line x1={viewState.bBox.cx - (viewState.bBox.w / 2)} y1={viewState.bBox.cy} x2={viewState.bBox.cx - (viewState.bBox.w / 2)} y2={viewState.bBox.cy + viewState.lifeLine.h + viewState.bBox.offsetFromBottom + (DefaultConfig.startingOnErrorY * 2)} />
                </g>
                <rect id="Rectangle" width={ERRORTITLEWIDTH} height="1" x={viewState.lifeLine.x - ERRORTITLEWIDTH / 2} y={viewState.lifeLine.y} fill="#5567d5" />
                <text x={viewState.header.cx - (GLOBALERRORPATH / 2)} y={viewState.header.cy - viewState.bBox.offsetFromBottom - (DefaultConfig.startingOnErrorY)} fill="#32324d" font-size="16" font-family="GilmerBold, Gilmer Bold" letter-spacing="0.05em">Global Error Path</text>
                <text x={viewState.header.cx - (TITLEWIDTH / 2)} y={viewState.header.cy - TITLEHEIGHT} fill="#32324d" font-size="12" font-family="GilmerBold, Gilmer Bold" letter-spacing="0.05em">ON FAIL</text>
                {/* <text x={viewState.header.cx} y={viewState.header.cy} fill="#32324d" font-size="16" font-family="GilmerBold, Gilmer Bold" letter-spacing="0.05em">Global Error Path</text>
                <text x={viewState.header.cx} y={viewState.header.cy} fill="#32324d" font-size="12" font-family="GilmerBold, Gilmer Bold" letter-spacing="0.05em">ON FAIL</text>
               */}
                {...pluses}
                {...drafts}
                {...children}
            </g>
        // </svg>
    );
}
