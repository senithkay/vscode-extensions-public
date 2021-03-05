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
import React, { useContext } from "react";

import { FunctionBodyBlock, FunctionDefinition } from "@ballerina/syntax-tree";

import { Context as DiagramContext } from "../../../Contexts/Diagram";
import { BlockViewState, FunctionViewState } from "../../view-state";
import { End } from "../End";
import { StartButton } from "../Start";
import {TriggerParams} from "../TriggerParams";
import { WorkerBody } from "../WorkerBody";
import { WorkerLine } from "../WorkerLine";

export interface FunctionProps {
    model: FunctionDefinition;
    isWaitingOnWorkspace: boolean;
    isCodeEditorActive: boolean;
}

export function Function(props: FunctionProps) {
    const { state } = useContext(DiagramContext);
    const { isWaitingOnWorkspace, isCodeEditorActive, isReadOnly } = state;

    const { model } = props;
    const viewState: FunctionViewState = model.viewState;
    const isInitPlusAvailable: boolean = viewState.initPlus !== undefined;
    const block: FunctionBodyBlock = model.functionBody as FunctionBodyBlock;
    const isStatementsAvailable: boolean = block.statements.length > 0;
    const bodyViewState: BlockViewState = block.viewState;
    const isTriggerParamsAvailable: boolean = viewState.triggerParams.visible;

    return (
        <g>
            <>
                {(!isReadOnly && isInitPlusAvailable && !isCodeEditorActive && !isWaitingOnWorkspace && !viewState.initPlus.isTriggerDropdown) && (<WorkerLine viewState={viewState} />)}
            </>

            {isInitPlusAvailable && isTriggerParamsAvailable &&  <TriggerParams model={model} />}
            {!isInitPlusAvailable && isTriggerParamsAvailable && <TriggerParams model={model} />}
            {!isInitPlusAvailable && <WorkerLine viewState={viewState} />}
            {isInitPlusAvailable && <StartButton model={model} />}
            {!isInitPlusAvailable && <StartButton model={model} />}
            {!isInitPlusAvailable && <WorkerBody model={block} viewState={block.viewState} />}
            {!isInitPlusAvailable && isStatementsAvailable && (!bodyViewState?.isEndComponentInMain ||
                bodyViewState?.collapseView) && <End viewState={viewState.end} />}
        </g>
    );
}
