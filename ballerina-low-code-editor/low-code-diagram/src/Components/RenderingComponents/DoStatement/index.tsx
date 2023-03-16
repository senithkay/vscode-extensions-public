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

import React from "react";

import { DoStatement, STNode } from "@wso2-enterprise/syntax-tree";

import { DefaultConfig } from "../../..";
import { getSTComponents } from "../../../Utils";
import { DoStatementViewState } from "../../../ViewState/do-statement";

import { DoStatementSVG, DO_STATEMENT_SHADOW_OFFSET, DO_STATEMENT_SVG_WIDTH, DO_STATEMENT_SVG_WIDTH_WITH_SHADOW } from "./DoStatementSVG";
import "./style.scss";

interface DoStatementProps {
    model: STNode;
}

export function DoStatement(props: DoStatementProps) {
    const { model } = props;
    const viewState: DoStatementViewState = model.viewState as DoStatementViewState;
    const x: number = viewState.headDo.cx;
    const y: number = viewState.headDo.cy - (viewState.headDo.h / 2) - (DO_STATEMENT_SHADOW_OFFSET / 2);
    const doBodyChildren = getSTComponents((model as DoStatement).blockStatement.statements);
    const onFailBodyChildren = getSTComponents((model as DoStatement).onFailClause.blockStatement.statements);

    const rectProps = {
        x: viewState.bBox.cx - (viewState.bBox.lw),
        y: viewState.bBox.cy + DO_STATEMENT_SVG_WIDTH / 2,
        width: viewState.bBox.w,
        height: viewState.bBox.h - DO_STATEMENT_SVG_WIDTH / 2,
        rx: DefaultConfig.forEach.radius
    };
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
                {doBodyChildren}
                {onFailBodyChildren}
            </g>
        </g>
    )
}
