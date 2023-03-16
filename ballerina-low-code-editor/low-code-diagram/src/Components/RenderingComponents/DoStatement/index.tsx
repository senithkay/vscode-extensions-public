/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useContext } from "react";

import { DoStatement, STNode } from "@wso2-enterprise/syntax-tree";
import { Context } from "../../../Context/diagram";

import { DefaultConfig } from "../../..";
import { getDraftComponent, getSTComponents } from "../../../Utils";
import { DoStatementViewState } from "../../../ViewState/do-statement";

import { DoStatementSVG, DO_STATEMENT_SHADOW_OFFSET, DO_STATEMENT_SVG_HEIGHT_WITH_SHADOW, DO_STATEMENT_SVG_WIDTH, DO_STATEMENT_SVG_WIDTH_WITH_SHADOW } from "./DoStatementSVG";
import "./style.scss";
import { OnFailClauseViewState } from "../../../ViewState/on-fail-clause";
import { PlusButton } from "../../PlusButtons/Plus";

interface DoStatementProps {
    model: STNode;
}

export function DoStatement(props: DoStatementProps) {
    const { model } = props;
    const diagramContext = useContext(Context);
    const viewState: DoStatementViewState = model.viewState as DoStatementViewState;
    const onFailVS: OnFailClauseViewState = viewState.onFailBodyVS as OnFailClauseViewState;
    const state = diagramContext?.state;
    const { insertComponentStart } = diagramContext.actions;
    const x: number = viewState.doHeadVS.cx;
    const y: number = viewState.doHeadVS.cy - (viewState.doHeadVS.h / 2) - (DO_STATEMENT_SHADOW_OFFSET / 2);
    const doBodyChildren = getSTComponents((model as DoStatement).blockStatement.statements);
    const onFailBodyChildren = getSTComponents((model as DoStatement).onFailClause.blockStatement.statements);

    const rectProps = {
        x: viewState.bBox.cx - (viewState.bBox.lw),
        y: viewState.bBox.cy + DO_STATEMENT_SVG_WIDTH / 2,
        width: viewState.bBox.w,
        height: viewState.bBox.h - DO_STATEMENT_SVG_WIDTH / 2,
        rx: DefaultConfig.forEach.radius
    };

    const doBodyLifeLineProps = {
        x1: viewState.doBodyLifeLine.cx,
        y1: viewState.doBodyLifeLine.cy,
        x2: viewState.doBodyLifeLine.cx,
        y2: (viewState.doBodyLifeLine.cy + viewState.doBodyLifeLine.h)
    };

    const onFailBodyLifeLineProps = {
        x1: onFailVS.onFailBodyLifeLine.cx,
        y1: onFailVS.onFailBodyLifeLine.cy,
        x2: onFailVS.onFailBodyLifeLine.cx,
        y2: (onFailVS.onFailBodyLifeLine.cy + onFailVS.onFailBodyLifeLine.h)
    };

    const seperatorLineProps = {
        x1: viewState.bBox.cx - viewState.bBox.lw,
        y1: onFailVS.bBox.cy + DO_STATEMENT_SVG_HEIGHT_WITH_SHADOW / 2,
        x2: viewState.bBox.cx + viewState.bBox.rw,
        y2: onFailVS.bBox.cy + DO_STATEMENT_SVG_HEIGHT_WITH_SHADOW / 2,
    };

    const plusButtons: React.ReactElement[] = [];

    viewState.doBodyVS.plusButtons.forEach((plusView) => {
        plusButtons.push(
            <PlusButton
                viewState={plusView}
                model={(model as DoStatement).blockStatement}
                initPlus={false}
            />
        );
    });

    viewState.onFailBodyVS.onFailBodyVS.plusButtons.forEach((plusView) => {
        plusButtons.push(
            <PlusButton
                viewState={plusView}
                model={(model as DoStatement).onFailClause.blockStatement}
                initPlus={false}
            />
        );
    });


    let drafts: React.ReactNode[] = [];
    if (viewState.doBodyVS.draft) {
        drafts = getDraftComponent(viewState.doBodyVS, state, insertComponentStart);
    }

    if (viewState.onFailBodyVS.onFailBodyVS.draft) {
        drafts = getDraftComponent(viewState.onFailBodyVS.onFailBodyVS, state, insertComponentStart);
    }

    return (
        <g className="main-do-statement-wrapper">
            <g className={'do-statement-block'}>
                <rect className="do-statement-rect" {...rectProps} />
                <DoStatementSVG
                    x={x - DO_STATEMENT_SVG_WIDTH_WITH_SHADOW / 2}
                    y={y}
                    text="FOR EACH"
                    componentSTNode={model}
                />
                <line className="life-line" {...doBodyLifeLineProps} />
                {doBodyChildren}
                <line className="life-line" {...onFailBodyLifeLineProps} />
                <line className="life-line" {...seperatorLineProps} strokeDasharray={4} />
                <DoStatementSVG
                    x={onFailVS.bBox.cx - DO_STATEMENT_SVG_WIDTH_WITH_SHADOW / 2}
                    y={onFailVS.bBox.cy}
                    text="FOR EACH"
                    componentSTNode={model}
                />
                {onFailBodyChildren}
                {drafts}
                {plusButtons}
            </g>
        </g>
    )
}
