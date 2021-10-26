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

export const DROPDOWN_SVG_WIDTH_WITH_SHADOW = 34;
export const DROPDOWN_SVG_HEIGHT_WITH_SHADOW = 34;
export const DROPDOWN_SVG_WIDTH = 25;
export const DROPDOWN_SVG_HEIGHT = 25;
export const DROPDOWN_SHADOW_OFFSET = DROPDOWN_SVG_HEIGHT_WITH_SHADOW - DROPDOWN_SVG_HEIGHT;

export function DropDownSVG(props: { x: number, y: number }) {
    const { ...xyProps } = props;
    return (
        <svg id="DropDown" {...xyProps} width={DROPDOWN_SVG_WIDTH_WITH_SHADOW} height={DROPDOWN_SVG_HEIGHT_WITH_SHADOW}>
            <defs>
                <linearGradient id="DropDownLinearGradient" x1="0.5" y1="0.004" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fff" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="DropDownFilter" x="0" y="0" width="34" height="34" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#9a9eac" floodOpacity="0.502" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="DropDownFilter" x="0" y="0" width="40" height="40" filterUnits="userSpaceOnUse">
                    <feOffset dy="2" in="SourceAlpha"/>
                    <feGaussianBlur stdDeviation="2.5" result="blur"/>
                    <feFlood floodColor="#9a9eac" floodOpacity="0.502"/>
                    <feComposite operator="in" in2="blur"/>
                    <feComposite in="SourceGraphic"/>
                </filter>
                <filter id="DropDownFilter" x="0" y="0" width="40" height="40" filterUnits="userSpaceOnUse">
                    <feOffset dy="2" in="SourceAlpha"/>
                    <feGaussianBlur stdDeviation="2.5" result="blur"/>
                    <feFlood floodColor="#9a9eac" floodOpacity="0.502"/>
                    <feComposite operator="in" in2="blur"/>
                    <feComposite in="SourceGraphic"/>
                </filter>
            </defs>
            <g className="dropdown-circle dropdown-click" id="DropDown" transform="translate(4.5 3.5)">
                <g transform="matrix(1, 0, 0, 1, -4.5, -3.5)" filter="url(#DropDownFilter)">
                    <g id="DropDownGroup" transform="translate(4.5 3.5)">
                        <rect width="25" height="25" rx="12.5" stroke="none" />
                        <rect x="0.5" y="0.5" width="24" height="24" rx="12" fill="none" />
                    </g>
                </g>
                <path
                    id="DropDownArrow"
                    d="M3.5,0,7,5H0Z"
                    transform="translate(16 16) rotate(-180)"
                    className="dropdown-arrow-icon"
                />
            </g>
        </svg>
    )
}
