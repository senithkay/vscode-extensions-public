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

import { FunctionBodyBlock, FunctionDefinition, STKindChecker } from "@ballerina/syntax-tree";
import classNames from "classnames";
import { v4 as uuid } from 'uuid';

import { Context } from "../../../Contexts/Diagram";
import { Provider as FunctionProvider } from "../../../Contexts/Function";
import { useStyles } from "../../styles";
import { isFunctionSelected } from "../../utils/diagram-util";
import { BlockViewState, FunctionViewState } from "../../view-state";
import { Canvas } from "../Canvas";
import { End } from "../End";
import { StartButton } from "../Start";
import { WorkerBody } from "../WorkerBody";
import { WorkerLine } from "../WorkerLine";

import { FunctionSignature } from "./FunctionSignature";
import PanAndZoom from "./PanAndZoom";
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
        props: {
            isWaitingOnWorkspace,
            isReadOnly,
            isCodeEditorActive,
            selectedPosition
        }
    } = useContext(Context);

    const { model } = props;

    const viewState: FunctionViewState = model.viewState;
    const isInitPlusAvailable: boolean = viewState.initPlus !== undefined;
    const isExpressionFuncBody: boolean = STKindChecker.isExpressionFunctionBody(model.functionBody);

    const [diagramExpanded, setDiagramExpanded] = useState(isFunctionSelected(selectedPosition, model));

    const containerRef = useRef(null);

    const onExpandClick = () => {
        setDiagramExpanded(!diagramExpanded);
    }

    React.useEffect(() => {
        const isSelected = isFunctionSelected(selectedPosition, model);
        setDiagramExpanded(isSelected);
        if (isSelected) {
            containerRef.current.scrollIntoView();
        }
    }, [selectedPosition])

    let component: JSX.Element;

    if (isExpressionFuncBody) {
        component = (
            <g>
                <StartButton model={model} />
                <WorkerLine viewState={viewState} />
                <End model={model.functionBody} viewState={viewState.end} isExpressionFunction={true} />
            </g>
        );
    } else {
        const block: FunctionBodyBlock = model.functionBody as FunctionBodyBlock;
        const isStatementsAvailable: boolean = block.statements.length > 0;
        const bodyViewState: BlockViewState = block.viewState;

        component = (
            <g>
                <>
                    {(!isReadOnly && isInitPlusAvailable && !isCodeEditorActive && !isWaitingOnWorkspace && !viewState.initPlus.isTriggerDropdown) && (<WorkerLine viewState={viewState} />)}
                    {/* <FunctionSignature model={model} onExpandClick={onExpandClick} /> */}
                </>

                {!isInitPlusAvailable && <WorkerLine viewState={viewState} />}
                {isInitPlusAvailable && <StartButton model={model} />}
                {!isInitPlusAvailable && <StartButton model={model} />}
                {!isInitPlusAvailable && <WorkerBody model={block} viewState={block.viewState} />}
                {!isInitPlusAvailable && isStatementsAvailable && (!bodyViewState?.isEndComponentInMain ||
                    bodyViewState?.collapseView) && <End viewState={viewState.end} />}
            </g>
        );
    }

    const functionBody = (
        <div className={'lowcode-diagram'}>
            <FunctionProvider overlayId={overlayId} >
                <PanAndZoom >
                    <div id={overlayId} className={classes.OverlayContainer} />
                    <Canvas h={model.viewState.bBox.h} w={model.viewState.bBox.w} >
                        {component}
                    </Canvas>
                </PanAndZoom>
            </FunctionProvider >
        </div>
    )

    return (
        <div
            ref={containerRef}
            className={
                classNames(
                    {
                        'function-box': STKindChecker.isResourceAccessorDefinition(model)
                            || STKindChecker.isObjectMethodDefinition(model),
                        'module-level-function': STKindChecker.isFunctionDefinition(model),
                        expanded: diagramExpanded
                    },
                    STKindChecker.isResourceAccessorDefinition(model) ? model.functionName.value : '',
                )
            }
        >
            <FunctionSignature isExpanded={diagramExpanded} model={model} onExpandClick={onExpandClick} />
            {diagramExpanded && functionBody}
        </div>
    );
}
