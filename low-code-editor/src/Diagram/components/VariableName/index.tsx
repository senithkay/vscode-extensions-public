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
import { DefaultConfig } from "../../visitors/default";

import "./style.scss";

export let VARIABLE_NAME_WIDTH = 150;

export function VariableName(props: { x: number, y: number, variableName: string, processType: string, }) {
    const { processType, variableName, ...xyProps } = props;
    const ICON_SVG_WRAPPER_WIDTH = 30;
    const textWidth = variableName.length * 8;
    let textX = 0;

    // tslint:disable-next-line: prefer-conditional-expression
    if (variableName.length >= 15) {
        textX = 0 + ICON_SVG_WRAPPER_WIDTH;
    } else {
        textX = (VARIABLE_NAME_WIDTH - textWidth);
    }
    const variableMaxWidth = variableName.length >= 15;

    const iconX = variableMaxWidth ? 1 : VARIABLE_NAME_WIDTH - (textWidth + ICON_SVG_WRAPPER_WIDTH);

    return (
        <svg {...xyProps}>
            <defs>
                <filter id="VariableName_Filter" x="0" y="0" width="150" height="33" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#aaacb8" floodOpacity="0.302" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="Variable_Name">
                <text id="getResponse" className="variable-name" >
                    <tspan id="getResponseName" width="150" textAnchor={variableMaxWidth ? "start" : ""} x={textX} y="15">{variableMaxWidth ? variableName.slice(0, 14) + "..." : variableName}</tspan>
                </text>
                <g filter="url(#VariableName_Filter)">
                    <g id="Reactangle_wrapper" fill="#fff" stroke="#ccd1f2" strokeMiterlimit="10" strokeWidth="1" >
                        <rect width="24" x={iconX} height="24" rx="4" stroke="none" />
                        <rect x={iconX} y="0.5" width="23" height="23" rx="3.5" fill="none" />
                    </g>
                </g>
                <g id="Variable_icon">
                    {(processType === "Variable" || processType === "Action") && <PropertyIcon height={16} width={16} x={iconX + DefaultConfig.dotGap / 2} y={4} />}
                    {processType === "Custom" && <CustomStatementIcon height={16} width={15.251} x={iconX + DefaultConfig.dotGap / 2} y={4} />}
                </g>
            </g>
        </svg>
    );
}
