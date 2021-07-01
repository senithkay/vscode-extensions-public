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
// tslint:disable: jsx
import React from 'react'

import { IterationCountSVG } from './IterationCountSVG'

export const LOOP_CONTROL_FLOW_PROP_PADDING = 8.5;

export interface LoopControlFlowProp {
    x: number;
    y: number;
    count: number
}

export  function LoopControlFlow (props: LoopControlFlowProp) {
    const { x, y, count } = props;

    const getElement = () => {
        return (
            <g className={"loopControlFlow"}>
                <IterationCountSVG x={x} y={y} count={count} />
            </g>
        );

    };
    
    return (getElement())
}
