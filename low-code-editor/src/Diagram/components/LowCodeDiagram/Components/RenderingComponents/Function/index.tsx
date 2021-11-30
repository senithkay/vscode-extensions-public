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

import { Tooltip } from "@material-ui/core";
import {
    FunctionBodyBlock,
    FunctionDefinition,
    STKindChecker,
} from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";
import { v4 as uuid } from "uuid";

import { Context, useDiagramContext } from "../../../../../../Contexts/Diagram";
import { Provider as FunctionProvider } from "../../../../../../Contexts/Function";
import { addAdvancedLabels, ANALYZE_TYPE } from "../../../../../../DiagramGenerator/performanceUtil";
import { useOverlayRef, useSelectedStatus } from "../../../../../hooks";
import { useStyles } from "../../../../../styles";
import { Canvas } from "../../../Canvas";
import { BlockViewState, FunctionViewState } from "../../../ViewState";
import { End } from "../End";
import { StartButton } from "../Start";
import { WorkerBody } from "../WorkerBody";
import { WorkerLine } from "../WorkerLine";

import { FunctionHeader } from "./FunctionHeader";
import PanAndZoom from "./PanAndZoom";
import { ResourceHeader } from "./ResourceHeader";
import "./style.scss";

export const FUNCTION_PLUS_MARGIN_TOP = 7.5;
export const FUNCTION_PLUS_MARGIN_BOTTOM = 7.5;
export const FUNCTION_PLUS_MARGIN_LEFT = 10;

export interface FunctionProps {
    model: FunctionDefinition;
}

export function Function(props: FunctionProps) {
    const classes = useStyles();
    const { state } = useContext(Context);
    const [overlayId] = useState(`function-overlay-${uuid()}`);
    const {
        props: { isWaitingOnWorkspace, isReadOnly, isCodeEditorActive },
    } = useContext(Context);

    const { model } = props;

    const viewState: FunctionViewState = model.viewState;
    const isInitPlusAvailable: boolean = viewState.initPlus !== undefined;
    const isExpressionFuncBody: boolean = STKindChecker.isExpressionFunctionBody(
        model.functionBody
    );

    const containerRef = useRef(null);
    const isSelected = useSelectedStatus(model, containerRef);
    const [diagramExpanded, setDiagramExpanded] = useState(isSelected);
    const [overlayNode, overlayRef] = useOverlayRef();

    React.useEffect(() => {
        setDiagramExpanded(isSelected);
    }, [isSelected]);

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
        const isStatementsAvailable: boolean = block.statements.length > 0;
        const bodyViewState: BlockViewState = block.viewState;

        component = (
            <g>
                <>
                    {!isReadOnly &&
                        isInitPlusAvailable &&
                        !isCodeEditorActive &&
                        !isWaitingOnWorkspace &&
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

    const {
        actions: { diagramCleanDraw },
        api: {
            project: {
                run
            }
        }
    } = useDiagramContext();

    let concurrency: string;
    let latency: string;
    let tps: string;
    let isPerfDataAvailable = false;
    let isAdvancedPerfDataAvailable = false;

    if ((model as any).performance) {
        const perfData = (model as any).performance;
        const analyzeType: ANALYZE_TYPE = perfData.analyzeType;
        const concurrencies = perfData.concurrency;
        const latencies = perfData.latency;
        const tpss = perfData.tps;

        if (analyzeType === ANALYZE_TYPE.REALTIME) {
            isPerfDataAvailable = true;
            const minLatency = latencies.min ? `${latencies.min > 1000 ? latencies.min / 1000 :
                latencies.min} ${latencies.min > 1000 ? " s" : " ms"}` : '0';
            const maxLatency = latencies.max ? `${latencies.max > 1000 ? latencies.max / 1000 :
                latencies.max} ${latencies.max > 1000 ? " s" : " ms"}` : '0';

            isAdvancedPerfDataAvailable = concurrencies.max !== 1;

            concurrency = isAdvancedPerfDataAvailable ? `${concurrencies.min} - ${concurrencies.max}` : concurrencies;
            latency = isAdvancedPerfDataAvailable ? `${minLatency} - ${maxLatency}` : maxLatency;
            tps = isAdvancedPerfDataAvailable ? `${tpss.min} - ${tpss.max} req/s` : `${tpss.max} req/s`;

        } else if (analyzeType === ANALYZE_TYPE.ADVANCED) {
            isPerfDataAvailable = true;
            isAdvancedPerfDataAvailable = true;
            concurrency = concurrencies;
            latency = `${latencies > 1000 ? latencies / 1000 : latencies} ${latencies > 1000 ? " s" : " ms"}`;
            tps = `${tpss} req/s`;
        }

    }

    const onClickPerformance = async () => {
        if (!isAdvancedPerfDataAvailable) {
            return;
        }

        let fullPath = "";
        for (const path of model.relativeResourcePath) {
            fullPath += (path as any).value;
        }

        await addAdvancedLabels(`${model.functionName.value.toUpperCase()} /${fullPath}`,
            model.position, diagramCleanDraw)
    };

    function performanceBar() {
        if (isPerfDataAvailable) {
            return (
                <div className={"performance-bar"}>
                    <div className={"rectangle"}>&nbsp;</div>
                    <p>
                        {
                            isAdvancedPerfDataAvailable ?
                                `Forecasted performance for concurrency ${concurrency} | Latency: ${latency} | Tps: ${tps}` :
                                `Forecasted performance for a single user: Latency: ${latency} | Tps: ${tps}`
                        }
                    </p>
                    <Tooltip title={isAdvancedPerfDataAvailable ? "Click here to open the performance graph" : "Insufficient data to provide detailed estimations"}>
                        <p className={"more"} onClick={onClickPerformance}>{"Show More →"}</p>
                    </Tooltip>
                </div>
            )
        }
    }

    const functionBody = (
        <div className={"lowcode-diagram"}>
            {performanceBar()}
            <FunctionProvider overlayId={overlayId} overlayNode={overlayNode} functionNode={model}>
                <PanAndZoom>
                    <div ref={overlayRef} id={overlayId} className={classes.OverlayContainer} />
                    <Canvas h={model.viewState.bBox.h} w={model.viewState.bBox.w}>
                        {component}
                    </Canvas>
                </PanAndZoom>
            </FunctionProvider>
        </div>
    );

    const onClickRun = async () => {
        run([]);
    }

    function renderButtons() {
        if (model.isRunnable) {
            return <div className={"action-container"}><p className={"action-text"} onClick={onClickRun}>Run</p></div>
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
        >
            {STKindChecker.isResourceAccessorDefinition(model) ? (
                <ResourceHeader
                    isExpanded={diagramExpanded}
                    model={model}
                    onExpandClick={onExpandClick}
                />
            ) : (
                <div >
                    {renderButtons()}
                    <FunctionHeader
                        isExpanded={diagramExpanded}
                        model={model}
                        onExpandClick={onExpandClick}
                    />
                </div>
            )}
            {diagramExpanded && functionBody}
        </div>
    );
}
