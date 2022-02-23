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

import React from "react";

import { NamedWorkerDeclaration } from "@wso2-enterprise/syntax-tree";

import { WorkerDeclarationViewState } from "../../../../ViewState/worker-declaration";
import { StartSVG, START_SVG_HEIGHT, START_SVG_WIDTH } from "../../Start/StartSVG";

interface WorkerHeadProps {
    model: NamedWorkerDeclaration
}

export function WorkerHead(props: WorkerHeadProps) {
    const { model } = props;
    const viewState: WorkerDeclarationViewState = model.viewState;

    return (
        <StartSVG
            x={viewState.trigger.cx - (START_SVG_WIDTH / 2)}
            y={viewState.trigger.cy - (START_SVG_HEIGHT / 2)}
            text={model.workerName.value}
        />
    )
}
