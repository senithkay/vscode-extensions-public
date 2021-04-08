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
import * as React from "react";

import { CustomStatementIcon, LogIcon, PropertyIcon } from "../../../../src/assets/icons";
import { ModelCodePosition } from "../../../api/models";
import { TooltipCodeSnippet } from "../Portals/ConfigForm/Elements/Tooltip"

import "./style.scss";

export const PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW = 142;
export const PROCESS_SVG_HEIGHT_WITH_HOVER_SHADOW = 94;
export const PROCESS_SVG_WIDTH_WITH_SHADOW = 109;
export const PROCESS_SVG_HEIGHT_WITH_SHADOW = 61;
export const PROCESS_SVG_WIDTH = 96;
export const PROCESS_STROKE_HEIGHT = 1;
export const PROCESS_SVG_HEIGHT = 48 + PROCESS_STROKE_HEIGHT;
export const PROCESS_SVG_SHADOW_OFFSET = PROCESS_SVG_HEIGHT_WITH_SHADOW - PROCESS_SVG_HEIGHT;


export function ProcessSVG(props: { x: number, y: number, varName: any, processType: string, sourceSnippet: any, position: ModelCodePosition, openInCodeView?: () => void}) {
    const { varName, processType, sourceSnippet, openInCodeView, ...xyProps } = props;

    return (
        <svg {...xyProps} width={PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW} height={PROCESS_SVG_HEIGHT_WITH_HOVER_SHADOW} className="process" >
            <defs>
                <linearGradient id="ProcessLinearGradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="ProcessFilterDefault" x="-25" y="-10" width="142" height="94" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="ProcessFilterHover" x="-20" y="-10" width="142" height="94" filterUnits="userSpaceOnUse">
                    <feOffset dy="3" dx="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <TooltipCodeSnippet openInCodeView={openInCodeView} content={sourceSnippet} placement="right" arrow={true}>
                <g id="Process" className="data-processor process-active" transform="translate(7 6)">
                    <g transform="matrix(1, 0, 0, 1, -7, -6)" >
                        <g id="ProcessRectangle" transform="translate(7 6)">
                            <rect width="95" height="48" rx="4" />
                            <rect x="0" y="0" width="96" height="48" rx="4.5" className="click-effect" />
                        </g>
                    </g>
                    <text className="process-text" id="ProcessText" transform="translate(16 14)">
                        <tspan data-testid="data-processor-text-block" dominantBaseline="central" x={PROCESS_SVG_WIDTH / 3} y="10">
                            {varName.length >= 9 && varName !== "New Variable" ? varName.slice(0, 8) + "..." : varName}
                        </tspan>
                    </text>
                    {processType === "Log" && <LogIcon height={18} width={18} x={1} y={1}/>}
                    {processType === "Variable" && <PropertyIcon height={17} width={17} x={3} y={3}/>}
                    {processType === "Custom" && <CustomStatementIcon height={17} width={17} x={3} y={3}/>}
                </g>
            </TooltipCodeSnippet>
        </svg>
    )
}
