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

import {TooltipCodeSnippet} from "../Portals/ConfigForm/Elements/Tooltip";

export const STOP_SVG_HEIGHT_WITH_SHADOW = 59;
export const STOP_SVG_WIDTH_WITH_SHADOW = 83;
export const STOP_STROKE_HEIGHT = 1;
export const STOP_SVG_HEIGHT = 41 + STOP_STROKE_HEIGHT;
export const STOP_SVG_WIDTH = 65;
export const STOP_SVG_SHADOW_OFFSET = STOP_SVG_HEIGHT_WITH_SHADOW - STOP_SVG_HEIGHT;

export function StopSVG(props: { x: number, y: number, text: string, codeSnippet?: string, openInCodeView?: () => void }) {
    const { text, codeSnippet, openInCodeView, ...xyProps } = props;
    return (
        <svg {...xyProps} height={STOP_SVG_HEIGHT_WITH_SHADOW} width={STOP_SVG_WIDTH_WITH_SHADOW} >
            <defs>
                <filter id="StopFilter" x="0" y="0" width="83" height="59" filterUnits="userSpaceOnUse">
                    <feOffset dy="2" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.722" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <TooltipCodeSnippet openInCodeView={openInCodeView} content={codeSnippet} placement="right" arrow={true}>
                <g id="Stop" transform="translate(9 7)">
                    <g transform="matrix(1, 0, 0, 1, -9, -7)" filter="url(#StopFilter)">
                        <rect id="StopRectangle" width="65" height="41" rx="20.5" transform="translate(9 7)" />
                    </g>
                    <text
                        id="Stop_text"
                        transform="translate(32.5 24)"
                        className="end-text"
                    >
                        <tspan
                            x="0"
                            y="0"
                            textAnchor="middle"
                            data-testid="end-text-block"
                        >
                            {text}
                        </tspan>
                    </text>
                </g>
            </TooltipCodeSnippet>
        </svg>
    )
}
