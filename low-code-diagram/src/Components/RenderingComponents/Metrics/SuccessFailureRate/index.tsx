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
import * as React from "react";

import "../style.scss"

import { ErrorSVG } from "./ErrorSVG";
import { SuccessSVG } from "./SuccessSVG";

export interface SuccessTextProps {
    x: number,
    y: number,
    successRate: number,
    failureRate: number
}

export function SuccessFailureC(props: SuccessTextProps) {
    const { x, y, successRate, failureRate } = props;
    if (failureRate > successRate){
        return (
            <g>
                <ErrorSVG x={x} y={y} failureRate={failureRate}/>
            </g>
        );
    }else{
        return (
            <g>
                <SuccessSVG x={x} y={y} successRate={successRate} />
            </g>
        );
    }
}

export const SuccesFailure = SuccessFailureC;
