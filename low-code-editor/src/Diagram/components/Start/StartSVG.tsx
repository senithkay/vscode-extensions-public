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
// tslint:disable: jsx-wrap-multiline
import React from "react";

export const START_SVG_WIDTH_WITH_SHADOW = 94;
export const START_SVG_HEIGHT_WITH_SHADOW = 52;
export const START_HOVER_SVG_WIDTH_WITH_SHADOW = 94;
export const START_HOVER_SVG_HEIGHT_WITH_SHADOW = 52;
export const START_SVG_WIDTH = 82;
export const START_SVG_HEIGHT = 40;
export const START_SVG_SHADOW_OFFSET = START_SVG_HEIGHT_WITH_SHADOW - START_SVG_HEIGHT;

export function StartSVG(props: { x: number, y: number, text: string}) {
    const { text, ...xyProps } = props;

    return (
        <svg {...xyProps} width={START_HOVER_SVG_WIDTH_WITH_SHADOW} height={START_HOVER_SVG_HEIGHT_WITH_SHADOW}>
            <defs>
                <filter id="StartFilterDefault" x="0" y="0" width="94" height="52" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <linearGradient id="linear-gradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
            </defs>
            <g id="Start" className="start-button" >
                <g className="start-button-rect">
                    <rect id="StartRectangle" width={START_SVG_WIDTH} height={START_SVG_HEIGHT} rx="24.5" />
                </g>
                <text id="StartText" x="44" y="24" >
                    <tspan className="start-text"> {text}  </tspan>
                </text>
            </g>
        </svg>
    )
}
