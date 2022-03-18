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
import React, { useContext, useRef, useState } from "react";

import {
    FunctionBodyBlock,
    FunctionDefinition,
    STKindChecker,
} from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";
import { v4 as uuid } from "uuid";

import { Canvas } from "../../../Canvas";
import { Context } from "../../../Context/diagram";
import { Provider as FunctionProvider } from "../../../Context/Function";
import { useOverlayRef, useSelectedStatus } from "../../../hooks";
import { BlockViewState, FunctionViewState } from "../../../ViewState";
import { End } from "../End";
import { StartButton } from "../Start";
import { WorkerBody } from "../WorkerBody";
import { WorkerLine } from "../WorkerLine";

import { FunctionHeader } from "./FunctionHeader";
import PanAndZoom from "./PanAndZoom";
import { PerformanceBar } from "./perBar/PerformanceBar";
import { ResourceHeader } from "./ResourceHeader";
import "./style.scss";

export const FUNCTION_PLUS_MARGIN_TOP = 7.5;
export const FUNCTION_PLUS_MARGIN_BOTTOM = 7.5;
export const FUNCTION_PLUS_MARGIN_LEFT = 10;

export interface FunctionProps {
    model: FunctionDefinition;
    hideHeader?: boolean;
}

export function Function(props: FunctionProps) {
    const [overlayId] = useState(`function-overlay-${uuid()}`);
    const diagramContext = useContext(Context);
    const { isReadOnly } = diagramContext.props;
    const run = diagramContext?.api?.project?.run;

    const { model, hideHeader } = props;

    const viewState: FunctionViewState = model.viewState;
    const isInitPlusAvailable: boolean = viewState.initPlus !== undefined;
    const isExpressionFuncBody: boolean = STKindChecker.isExpressionFunctionBody(
        model.functionBody
    );

    const containerRef = useRef(null);
    const [diagramExpanded, setDiagramExpanded] = useSelectedStatus(model, containerRef);
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
                />
            </g>
        );
    } else {
        const block: FunctionBodyBlock = model.functionBody as FunctionBodyBlock;
        const isStatementsAvailable: boolean = block.statements.length > 0 || !!block.namedWorkerDeclarator;
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
                {isInitPlusAvailable && <StartButton model={model} />}
                {!isInitPlusAvailable && <StartButton model={model} />}
                {!isInitPlusAvailable && (
                    <WorkerBody model={block} viewState={block.viewState} />
                )}
                {!isInitPlusAvailable &&
                    isStatementsAvailable &&
                    (!bodyViewState?.isEndComponentInMain ||
                        bodyViewState?.collapseView) && <End viewState={viewState.end} />}
            </g>
        );
    }

    const functionBody = (
        <div className={"lowcode-diagram"}>
            <PerformanceBar model={model} />
            <FunctionProvider overlayId={overlayId} overlayNode={overlayNode} functionNode={model}>
                <PanAndZoom>
                    <div ref={overlayRef} id={overlayId} className={"function-overlay-container"} />
                    <Canvas h={model.viewState.bBox.h} w={model.viewState.bBox.w}>
                        {component}
                    </Canvas>
                </PanAndZoom>
            </FunctionProvider>
        </div>
    );

    const onClickRun = async () => {
        if (run) {
            run([]);
        }
    }

    function renderButtons() {
        if (model.isRunnable) {
            return (
                <div className={"action-container"}>
                    <button className={"action-button"} onClick={onClickRun}>Run</button>
                </div>
            );
        }
    }

    return (
        <div
            ref={containerRef}
            className={classNames(
                {
                    "function-box":
                        STKindChecker.isResourceAccessorDefinition(model) ||
                        STKindChecker.isObjectMethodDefinition(model),
                    "module-level-function": STKindChecker.isFunctionDefinition(model),
                    expanded: diagramExpanded,
                },
                STKindChecker.isResourceAccessorDefinition(model)
                    ? model.functionName.value
                    : ""
            )}
            data-function-name={model?.functionName?.value}
        >
            {!hideHeader && (STKindChecker.isResourceAccessorDefinition(model) ? (
                <ResourceHeader
                    isExpanded={diagramExpanded}
                    model={model}
                    onExpandClick={onExpandClick}
                />
            ) : (
                <div >
                    {!isReadOnly && renderButtons()}
                    <FunctionHeader
                        isExpanded={diagramExpanded}
                        model={model}
                        onExpandClick={onExpandClick}
                    />
                </div>
            ))}
            {(diagramExpanded || hideHeader) && functionBody}
        </div>
    );
}
