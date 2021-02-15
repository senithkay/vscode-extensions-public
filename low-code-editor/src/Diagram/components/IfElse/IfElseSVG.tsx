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

export const IFELSE_SVG_WIDTH_WITH_SHADOW = 113.824;
export const IFELSE_SVG_HEIGHT_WITH_SHADOW = 113.822;
export const IFELSE_SVG_WIDTH = 96.2;
export const IFELSE_SVG_HEIGHT = 96.2;
export const IFELSE_SHADOW_OFFSET = IFELSE_SVG_HEIGHT_WITH_SHADOW - IFELSE_SVG_HEIGHT;

export function IfElseSVG(props: { x: number, y: number, text: string }) {
    const { text, ...xyProps } = props;
    const ifXPosition = (text === "IF") ? "45%" : "44%";
    return (
        <svg {...xyProps} width={IFELSE_SVG_WIDTH_WITH_SHADOW} height={IFELSE_SVG_HEIGHT_WITH_SHADOW} >
            <defs>
                <linearGradient id="IfElseLinearGradient"  x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="IfElseFilterDefault" x="-20" y="-20" width="113.824" height="113.822" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="IfElseFilterHover" x="-20" y="-20" width="146.824" height="146.822" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="7.5" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="IfElse" className="if-else-group if-else-group-active" transform="translate(7 6)">
                <g transform="matrix(1, 0, 0, 1, -7, -6)" >
                    <g id="IfElsePolygon" transform="translate(56.91 6.41) rotate(45)">
                        <rect className="if-else-rect" width="71" height="71" rx="6.5" stroke="none" />
                        <rect className="if-else-rect click-effect" x="0" y="0" width="71" height="71" rx="6.5" fill="none" />
                    </g>
                </g>
                <text className="condition-text" id="IfElseText" >
                    <tspan x={ifXPosition} y="50%" width="71" textAnchor="middle" data-testid={"condition"} >
                        {text}
                    </tspan>
                </text>
            </g>
        </svg>
    )
}
