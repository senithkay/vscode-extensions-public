/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useRef } from "react";

import {
    FunctionBodyBlock,
    FunctionDefinition,
    STKindChecker,
} from "@wso2-enterprise/syntax-tree";
import cn from "classnames";

import { Context } from "../../../Context/diagram";
import { useOverlayRef, useSelectedStatus } from "../../../hooks";
import { BlockViewState, FunctionViewState } from "../../../ViewState";
import { DefaultConfig } from "../../../Visitors";
import { End } from "../End";
import { PROCESS_SVG_HEIGHT } from "../Processor/ProcessSVG";
import { StartButton } from "../Start";
import { WorkerBody } from "../WorkerBody";
import { WorkerLine } from "../WorkerLine";

import "./style.scss";

export const FUNCTION_PLUS_MARGIN_TOP = 7.5;
export const FUNCTION_PLUS_MARGIN_BOTTOM = 7.5;
export const FUNCTION_PLUS_MARGIN_LEFT = 10;
export const FUNCTION_DOTTED_MARGIN = 25;

export interface FunctionProps {
    model: FunctionDefinition;
    hideHeader?: boolean;
    x?: number;
    y?: number;
}

export function FunctionExpand(props: FunctionProps) {
    const diagramContext = useContext(Context);
    const { isReadOnly } = diagramContext.props;

    const { model, hideHeader, ...xyProps } = props;

    const viewState: FunctionViewState = model.viewState;
    const isInitPlusAvailable: boolean = viewState.initPlus !== undefined;
    const isExpressionFuncBody: boolean = STKindChecker.isExpressionFunctionBody(
        model.functionBody
    );

    const containerRef = useRef(null);
    const [diagramExpanded, setDiagramExpanded] = useSelectedStatus(
        model,
        containerRef
    );
    const [overlayNode, overlayRef] = useOverlayRef();

    const onExpandClick = () => {
        setDiagramExpanded(!diagramExpanded);
    };

    let component: JSX.Element;

    if (isExpressionFuncBody) {
        component = (
            <g>
                <StartButton model={model} />
                <WorkerLine viewState={viewState} />
                <End
                    model={model.functionBody}
                    viewState={viewState.end}
                    isExpressionFunction={true}
                    expandReadonly={true}
                />
            </g>
        );
    } else {
        const block: FunctionBodyBlock = model.functionBody as FunctionBodyBlock;
        block.viewState.functionNodeFilePath = viewState.functionNodeFilePath;
        block.viewState.functionNodeSource = viewState.functionNodeSource;
        const isStatementsAvailable: boolean =
            block.statements.length > 0 || !!block.namedWorkerDeclarator;
        const bodyViewState: BlockViewState = block.viewState;

        component = (
            <g>
                <>
                    {!isReadOnly &&
                        isInitPlusAvailable &&
                        !viewState.initPlus.isTriggerDropdown && (
                            <WorkerLine viewState={viewState} />
                        )}
                </>

                {!isInitPlusAvailable && <WorkerLine viewState={viewState} />}
                {!isInitPlusAvailable && (
                    <WorkerBody model={block} viewState={block.viewState} expandReadonly={true} />
                )}
                {!isInitPlusAvailable &&
                    isStatementsAvailable &&
                    (!bodyViewState?.isEndComponentInMain ||
                        bodyViewState?.collapseView) && <End viewState={viewState.end} expandReadonly={true} />}
            </g>
        );
    }

    const arrowClasses = cn("action-invocation");
    const blockHeight = model.viewState.bBox.h;
    const blockWidth = model.viewState.bBox.w - FUNCTION_DOTTED_MARGIN;

    const expandViewX = 150;
    const arrowSpaceX = 70;
    const arrowSpaceY = 10;
    const arrowWidth = 220;

    return (
        <svg
            x={0}
            y={xyProps.y - (PROCESS_SVG_HEIGHT + DefaultConfig.dotGap)}
            className="expand-expression"
        >
            <rect
                y={PROCESS_SVG_HEIGHT + PROCESS_SVG_HEIGHT / 2}
                x="40"
                width={blockWidth}
                height={blockHeight - (PROCESS_SVG_HEIGHT * 2 + DefaultConfig.dotGap * 2 + DefaultConfig.dotGap / 2)}
                rx="30"
                strokeDasharray={"0.3em"}
                strokeWidth={1}
                fill={"none"}
                stroke={"#5567D5"}
            />
            {component}
        </svg>
    );
}
