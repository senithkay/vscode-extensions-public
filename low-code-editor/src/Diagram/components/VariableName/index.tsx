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

import { CustomStatementIcon, LogIcon, PropertyIcon } from "../../../../src/assets/icons";

import "./style.scss";

export const VARIABLE_NAME_WIDTH = 125;

export function VariableName(props: { x: number, y: number, variableName: string, processType: string, }) {
    const {processType, variableName, ...xyProps } = props;

    return (
        <svg {...xyProps}>
            <defs>
                <filter id="Rectangle_Copy" x="0" y="0" width="33" height="33" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#aaacb8" floodOpacity="0.302" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="Variable_Name" transform="translate(-107 -298)">
                <text id="getResponse" className="variable-name" transform="translate(136 316)">
                    <tspan x="0" y="0">{variableName}</tspan>
                </text>
                <g transform="matrix(1, 0, 0, 1, 103, 298)" filter="url(#Rectangle_Copy)">
                    <g id="Reactangle_wrapper" transform="translate(4.5 3)" fill="#fff" stroke="#ccd1f2" stroke-miterlimit="10" stroke-width="1">
                        <rect width="24" height="24" rx="4" stroke="none" />
                        <rect x="0.5" y="0.5" width="23" height="23" rx="3.5" fill="none" />
                    </g>
                </g>
                <g id="Variable_icon" transform="matrix(1, 0, 0, 1, 110.5, 304)">
                    {processType === "Log" && <LogIcon height={16} width={15.251} x={1} y={1} />}
                    {processType === "Variable" && <PropertyIcon height={16} width={16} x={1} y={1} />}
                    {processType === "Custom" && <CustomStatementIcon height={16} width={15.251} x={1} y={1} />}
                </g>
            </g>
        </svg>
    );
}
