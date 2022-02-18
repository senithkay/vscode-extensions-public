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

export const ERROR_LABEL_SVG_WIDTH_WITH_SHADOW = 95;
export const ERROR_LABEL_SVG_HEIGHT_WITH_SHADOW = 31;
export const ERROR_LABEL_SVG_WIDTH = 89;
export const ERROR_LABEL_SVG_HEIGHT = 25;
export const ERROR_LABEL_SHADOW_OFFSET = ERROR_LABEL_SVG_HEIGHT_WITH_SHADOW - ERROR_LABEL_SVG_HEIGHT;

export function ErrorSVG(props: { x: number, y: number, text: string }) {
    const { text, ...xyProps } = props;
    return (
        <svg {...xyProps} width={ERROR_LABEL_SVG_WIDTH_WITH_SHADOW} height={ERROR_LABEL_SVG_HEIGHT_WITH_SHADOW}>
            <defs>
                <filter
                    id="ErrorFilter"
                    x="0"
                    y="0"
                    width={ERROR_LABEL_SVG_WIDTH_WITH_SHADOW}
                    height={ERROR_LABEL_SVG_HEIGHT_WITH_SHADOW}
                    filterUnits="userSpaceOnUse"
                >
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feFlood floodColor="#8a92ab" floodOpacity="0.373" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="Error" transform="translate(3 2)">
                <g transform="matrix(1, 0, 0, 1, -3, -2)" filter="url(#ErrorFilter)">
                    <rect
                        id="ErrorRect"
                        width={ERROR_LABEL_SVG_WIDTH}
                        height={ERROR_LABEL_SVG_HEIGHT}
                        rx="4"
                        transform="translate(3 2)"
                        fill="#ea4c4d"
                    />
                </g>
                <text
                    className="metrics-text"
                    id="_80_Error"
                    transform="translate(45.5 16)"
                >
                    <tspan x="0" y="0" textAnchor="middle">
                        {text}
                    </tspan>
                </text>
            </g>
        </svg>
    )
}
