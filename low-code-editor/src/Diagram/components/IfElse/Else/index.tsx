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
// tslint:disable: jsx-no-multiline-js
import React, { ReactNode, useContext } from "react";

import { BlockStatement, STNode } from "@ballerina/syntax-tree";
import cn from "classnames";

import { Context as DiagramContext } from "../../../../Contexts/Diagram";
import { getDraftComponent, getSTComponents } from "../../../utils";
import { ElseViewState } from "../../../view-state";
import { DefaultConfig } from "../../../visitors/default";
import { Collapse } from "../../Collapse";
import { PlusButton } from "../../Plus";

import { BottomCurveSVG, BOTTOM_CURVE_SVG_HEIGHT, BOTTOM_CURVE_SVG_WIDTH } from "./BottomCurve";
import "./style.scss";
import { TopCurveSVG, TOP_CURVE_SVG_HEIGHT, TOP_CURVE_SVG_WIDTH } from "./TopCurve";

export interface ElseProps {
    model?: STNode;
    defaultViewState?: ElseViewState;
}

export function Else(props: ElseProps) {
    const { state, insertComponentStart } = useContext(DiagramContext);
    const { model, defaultViewState } = props;

    let viewState: ElseViewState;
    let elseBlock: BlockStatement;
    let children: ReactNode[];
    if (model) {
        elseBlock = model as BlockStatement;
        viewState = model.viewState;
        children = getSTComponents(elseBlock.statements);
    } else if (defaultViewState) {
        viewState = defaultViewState;
    }

    const pluses: React.ReactNode[] = [];
    const yOffsetForCurve = DefaultConfig.elseCurveYOffset;
    let drafts: React.ReactNode[] = [];
    const components: React.ReactNode[] = [];

    if (viewState.draft) {
        drafts = getDraftComponent(viewState, state, insertComponentStart);
    }

    const classes = cn("else-line");

    const topHorizontalLine: ReactNode = (
        <line
            x1={viewState.elseTopHorizontalLine.x - yOffsetForCurve}
            y1={viewState.elseTopHorizontalLine.y}
            x2={viewState.elseTopHorizontalLine.x + viewState.elseTopHorizontalLine.length  - TOP_CURVE_SVG_WIDTH}
            y2={viewState.elseTopHorizontalLine.y}
        />
    );

    const topCurve: ReactNode = (
        <TopCurveSVG
            x={viewState.elseTopHorizontalLine.x + viewState.elseTopHorizontalLine.length - TOP_CURVE_SVG_WIDTH}
            y={viewState.elseTopHorizontalLine.y - yOffsetForCurve}
        />
    );

    const verticalLine: ReactNode = (
        <line
            x1={viewState.elseBody.x - yOffsetForCurve}
            y1={viewState.elseBody.y + TOP_CURVE_SVG_HEIGHT - yOffsetForCurve}
            x2={viewState.elseBody.x}
            y2={viewState.elseBody.y + viewState.elseBody.length - BOTTOM_CURVE_SVG_HEIGHT}
        />
    );

    const bottomCurve: ReactNode = (
        <BottomCurveSVG
            x={viewState.elseBody.x - BOTTOM_CURVE_SVG_WIDTH + yOffsetForCurve}
            y={viewState.elseBody.y + viewState.elseBody.length - BOTTOM_CURVE_SVG_HEIGHT}
        />
    );

    const bottomLine: ReactNode = (
        <line
            x1={viewState.elseBottomHorizontalLine.x}
            y1={viewState.elseBottomHorizontalLine.y - yOffsetForCurve}
            x2={viewState.elseBottomHorizontalLine.x + viewState.elseBottomHorizontalLine.length -
            BOTTOM_CURVE_SVG_WIDTH + yOffsetForCurve}
            y2={viewState.elseBottomHorizontalLine.y - yOffsetForCurve}
        />
    );

    if (elseBlock) {
        for (const plusView of viewState.plusButtons) {
            pluses.push(<PlusButton viewState={plusView} model={elseBlock} initPlus={false} />)
        }
    }

    if (viewState.collapseView) {
        children.push(<Collapse blockViewState={viewState}/>)
    }

    components.push(topHorizontalLine);
    components.push(topCurve);
    components.push(verticalLine);

    if (!viewState.isEndComponentAvailable) {
        components.push(bottomCurve);
        components.push(bottomLine);
    }

    return (
        <g className={classes}>
            {...components}
            {...children}
            {...pluses}
            {...drafts}
        </g>
    )
}
