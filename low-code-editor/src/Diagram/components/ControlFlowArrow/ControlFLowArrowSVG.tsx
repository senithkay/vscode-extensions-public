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
// tslint:disable: jsx-no-multiline-js

import * as React from "react";

import { ARROW_HEIGHT, ARROW_WIDTH } from "../ArrowHead";

import './style.scss';

export function ControlFLowArrowSVG(props: { x1: number, y: number, x2: number, isDotted: boolean }) {
    const { isDotted, x1, x2, y } = props;
    const pointX = isDotted ? x2 : x1;

    const pointsR = `${pointX - ARROW_HEIGHT},${y - ARROW_WIDTH} ${pointX - ARROW_HEIGHT},${y + ARROW_WIDTH} ${pointX},${y}  `;
    const pointsL = `${pointX + ARROW_HEIGHT},${y - ARROW_WIDTH} ${pointX + ARROW_HEIGHT},${y + ARROW_WIDTH} ${pointX},${y}  `;
    const points = isDotted ? pointsL : pointsR;
    return (
        <svg>
            <defs>
                <filter id="control_flow_glowing_filter" {...props} filterUnits="userSpaceOnUse">
                    <feOffset in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feFlood flood-color="#36b475" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>

            <g className="arrow-head">
                <polygon points={points} filter="url(#control_flow_glowing_filter)" />
            </g>
            <g>
                <line className={isDotted ? "line-dashed" : "line"} filter="url(#control_flow_glowing_filter)" x1={x1} y1={y} x2={x2} y2={y} fill="none" stroke="#36b475" strokeMiterlimit="10" strokeWidth="1" />
            </g>
        </svg>
    );
}

