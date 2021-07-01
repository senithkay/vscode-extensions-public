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
// tslint:disable: jsx-no-multiline-js align  jsx-wrap-multiline
import React from "react";
import { useLocation } from "react-router-dom";

import { ControlFlowLineState } from "../../view-state";

import { ControlFlowLineSVG } from "./ControlFlowLineSVG";
import "./style.scss";

export interface ControlFlowProps {
    controlFlowViewState?: ControlFlowLineState;
}

export function ControlFlowLine(props: ControlFlowProps) {
    const { controlFlowViewState } = props;
    const { h, x, y } = controlFlowViewState;

    const location = useLocation();
    const enableControlFlow = new URLSearchParams(location.search).get("enableControlFlow") === "true";
    if (!enableControlFlow) {
        return null;
    }

    return (
        <g className="control-flow-line">
            <ControlFlowLineSVG
                x1={x}
                y1={y}
                x2={x}
                y2={y + h}
            />
        </g>
    );
}
