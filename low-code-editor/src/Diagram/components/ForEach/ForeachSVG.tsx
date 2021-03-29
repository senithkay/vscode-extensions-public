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

export const FOREACH_SVG_WIDTH_WITH_SHADOW = 113.824;
export const FOREACH_SVG_HEIGHT_WITH_SHADOW = 113.822;
export const FOREACH_SVG_WIDTH = 96.2;
export const FOREACH_SVG_HEIGHT = 96.2;
export const FOREACH_SHADOW_OFFSET = FOREACH_SVG_HEIGHT_WITH_SHADOW - FOREACH_SVG_HEIGHT;

export function ForeachSVG(props: { x: number, y: number, text: string }) {
    const { text, ...xyProps } = props;
    return (
        <svg {...xyProps} width={FOREACH_SVG_WIDTH_WITH_SHADOW} height={FOREACH_SVG_HEIGHT_WITH_SHADOW}>
            <defs>
                <linearGradient id="ForeachLinearGradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="ForeachFilterDefault" x="-20" y="-20" width="113.824" height="113.822" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="ForeachFilterHover" x="-20" y="-20" width="146.824" height="146.822" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="7.5" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="Foreach" className="foreach-group" transform="translate(56.912 6.414) rotate(45)">
                <g transform="matrix(0.71, -0.71, 0.71, 0.71, -44.78, 35.71)" >
                    <g id="ForeachPolygon" transform="translate(56.91 6.41) rotate(45)">
                        <rect width="71" height="71" rx="6.5" stroke="none" />
                        <rect x="0" y="0" width="71" height="71" rx="6.5" fill="none" className="click-effect" />
                    </g>
                </g>
            <text className="foreach-text" id="ForeachText" transform="translate(3.889 49.851) rotate(-45)">
                <tspan x="32.75" y="10" >For</tspan>
                <tspan x="31.80" y="22">Each</tspan>
            </text>
            </g>
        </svg>
    )
}
