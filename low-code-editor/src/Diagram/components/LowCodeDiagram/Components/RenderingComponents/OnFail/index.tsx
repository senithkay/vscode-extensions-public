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

import { OnFailClause as BallerinaOnFailClause } from "@wso2-enterprise/syntax-tree";

import { getDraftComponent, getSTComponents } from "../../../../../utils";
import { Context as DiagramContext } from "../../../Context/diagram";
import { BlockViewState, DoViewState, OnErrorViewState } from "../../../ViewState";
import { DefaultConfig } from "../../../Visitors/default";
import { PlusButton } from "../../PlusButtons/Plus";

import "./style.scss";

export interface OnFailClauseProps {
    model: BallerinaOnFailClause;
}

const ERRORTITLEWIDTH = 33;
const TITLEWIDTH = 56;
const TITLEHEIGHT = 5;
const GLOBALERRORPATH = 127;
const GLOBALERRORPATH_TEXT_WIDTH = 147;

export function OnFailClause(props: OnFailClauseProps) {
    const { props: {isReadOnly}, state, actions: { insertComponentStart } } = useContext(DiagramContext);

    const { model } = props;

    const viewState: OnErrorViewState = model.viewState as OnErrorViewState;
    const blockViewState: BlockViewState = model.blockStatement.viewState as BlockViewState;
    const doViewState = model.viewState as DoViewState;
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
        <g className="on-error-wrapper">
            <g className="on-error-line">
                {lifeLine}
            </g>
            <g className="on-error-separator">
                <line
                    x1={viewState.bBox.cx - (viewState.bBox.w / 2) + DefaultConfig.dotGap}
                    y1={viewState.bBox.cy - (DefaultConfig.startingOnErrorY * 2)}
                    x2={viewState.bBox.cx - (viewState.bBox.w / 2) + DefaultConfig.dotGap}
                    y2={viewState.bBox.cy + viewState.lifeLine.h + viewState.bBox.offsetFromBottom + DefaultConfig.startingOnErrorY}
                />
            </g>
            <rect id="Rectangle" width={ERRORTITLEWIDTH} height="1" x={viewState.lifeLine.x - ERRORTITLEWIDTH / 2} y={viewState.lifeLine.y} fill="#5567d5" />
            <text
                id="ErrorHeader"
                x={viewState.header.cx - (GLOBALERRORPATH_TEXT_WIDTH / 2)}
                y={viewState.header.cy - viewState.bBox.offsetFromBottom - (DefaultConfig.startingOnErrorY)}
                className="main-title"
            >
                Global Error Path
            </text>
            <text
                id="ErrorSubHeader"
                x={viewState.header.cx - (TITLEWIDTH / 2)}
                y={viewState.header.cy - TITLEHEIGHT}
                className="sub-title"
            >
                ON FAIL
            </text>
            {!isReadOnly && pluses}
            {drafts}
            {children}
        </g>
    );
}
