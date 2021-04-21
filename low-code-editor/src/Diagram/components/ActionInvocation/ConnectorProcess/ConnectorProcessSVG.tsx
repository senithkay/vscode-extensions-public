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
import * as React from "react";

export const CONNECTOR_PROCESS_SVG_WIDTH_WITH_SHADOW = 65;
export const CONNECTOR_PROCESS_SVG_HEIGHT_WITH_SHADOW = 65;
export const CONNECTOR_PROCESS_SVG_WIDTH = 55;
export const CONNECTOR_PROCESS_SVG_HEIGHT = 55;

export function ConnectorProcessSVG(props: { x: number, y: number }) {
    const { ...xyProps } = props;
    return (
        <svg {...xyProps} width={CONNECTOR_PROCESS_SVG_WIDTH} height={CONNECTOR_PROCESS_SVG_HEIGHT}>
            <defs>
                <linearGradient id="default-linear-gradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="default-filter" x="0" y="0" width="62" height="62" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="Group_2_Copy_2" transform="translate(5 1)">
                <g transform="matrix(1, 0, 0, 1, -3, -5.5)" filter="url(#default-filter)">
                    <g id="Rectangle_Copy_17-2" transform="translate(1 5.5)" stroke="#5567d5" stroke-miterlimit="10" stroke-width="1" fill="url(#linear-gradient)">
                        <rect width="48" height="48" rx="4" stroke="none" />
                        <rect x="-0.5" y="-0.5" width="49" height="49" rx="4.5" fill="none" />
                    </g>
                </g>
                <text id="new" transform="translate(12 27.5)" fill="#5567d5" font-size="12" font-family="GilmerMedium, Gilmer Medium">
                    <tspan x="0" y="0">new</tspan>
                </text>
            </g>
        </svg>
    )
}
