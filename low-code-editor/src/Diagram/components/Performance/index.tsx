/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import * as React from "react"

import { STNode } from "@ballerina/syntax-tree";

import { DefaultConfig } from "../../visitors/default";
import { TRIGGER_RECT_SVG_HEIGHT, TRIGGER_SVG_HEIGHT, TRIGGER_SVG_WIDTH } from "../ActionInvocation/TriggerSVG";
import { ResponseTimer } from "../Metrics/ResponseTImer";
import { COUNTERLEFT_SVG_HEIGHT } from "../Metrics/ResponseTImer/CounterLeftSVG";

import "./style.scss";
import { getPerformance } from "./Util";

export interface PerformanceProps {
    syntaxTree: STNode;
    triggerSVGX: number;
    triggerSVGY: number;
}

export function Performance(props: PerformanceProps) {
    const { syntaxTree, triggerSVGX, triggerSVGY } = props;
    const performance = getPerformance(syntaxTree);

    const responseTime = {
        x: triggerSVGX + TRIGGER_SVG_WIDTH + DefaultConfig.textLine.width + (2 * DefaultConfig.textLine.padding) + DefaultConfig.metrics.responseTimePadding,
        y: triggerSVGY + TRIGGER_SVG_HEIGHT / 2 - TRIGGER_RECT_SVG_HEIGHT / 2 + TRIGGER_RECT_SVG_HEIGHT / 2 - COUNTERLEFT_SVG_HEIGHT / 2
    };

    if (!performance?.latency) {
        return (<g/>);
    } else {
        const { latency } = performance;

        return (
            <g className={"performance"}>
                <ResponseTimer responseTime={latency} {...responseTime}/>
            </g>
        );

    }
}
