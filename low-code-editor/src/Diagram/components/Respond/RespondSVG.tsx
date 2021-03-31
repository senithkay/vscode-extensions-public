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

import { TooltipCodeSnippet } from "../../../components/Tooltip";

export const RESPOND_SVG_HEIGHT_WITH_SHADOW = 67;
export const RESPOND_SVG_WIDTH_WITH_SHADOW = 116;
export const RESPOND_STROKE_HEIGHT = 1;
export const RESPOND_SVG_HEIGHT = 49 + RESPOND_STROKE_HEIGHT;
export const RESPOND_SVG_WIDTH = 98;
export const RESPOND_SVG_SHADOW_OFFSET = RESPOND_SVG_HEIGHT_WITH_SHADOW - RESPOND_SVG_HEIGHT;

export function RespondSVG(props: { x: number, y: number, text: string, sourceSnippet?: string, openInCodeView?: () => void }) {
    const { text, sourceSnippet, openInCodeView, ...xyProps } = props;
    return (
        <svg {...xyProps} height={RESPOND_SVG_HEIGHT_WITH_SHADOW} width={RESPOND_SVG_WIDTH_WITH_SHADOW} >
            <defs>
                <filter id="RespondFilter" x="0" y="0" width="116" height="67" filterUnits="userSpaceOnUse">
                    <feOffset dy="2" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.722" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <TooltipCodeSnippet openInCodeView={openInCodeView} content={sourceSnippet} placement="right" arrow={true}>
                <g id="Respond" transform="translate(9 7)">
                    <g transform="matrix(1, 0, 0, 1, -9, -7)" filter="url(#RespondFilter)">
                        <rect id="RespondRectangle" width="98" height="49" rx="24.5" transform="translate(9 7)" />
                    </g>
                    <text id="RespondText" transform="translate(49 28)" >
                        <tspan x="0" y="0" textAnchor="middle" >
                            {text}
                        </tspan>
                    </text>
                </g>
            </TooltipCodeSnippet>
        </svg>
    )
}
