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

export const DOTTED_CONDITION_SVG_WIDTH_WITH_SHADOW = 102;
export const DOTTED_CONDITION_SVG_HEIGHT_WITH_SHADOW = 102;
export const DOTTED_CONDITION_SVG_WIDTH = 56;
export const DOTTED_CONDITION_SVG_HEIGHT = 40;

export function DottedConditionSVG(props: { x: number, y: number, text: string }) {
    const { text, ...xyProps } = props;
    return (
        <svg  {...xyProps} width={DOTTED_CONDITION_SVG_WIDTH_WITH_SHADOW} height={DOTTED_CONDITION_SVG_HEIGHT_WITH_SHADOW}>
            <defs>
                <linearGradient
                    id="DottedConnectorLinearGradient"
                    x1="0.5"
                    x2="0.5"
                    y2="1"
                    gradientUnits="objectBoundingBox"
                >
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="DottedConditonFilterDefault" x="-20" y="-20" width="102.982" height="102.982" filterUnits="userSpaceOnUse">
                    <feOffset dy="4" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="7.5" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.314" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="DottedConditonFilterHover" x="-20" y="-20" width="102.982" height="102.982" filterUnits="userSpaceOnUse">
                    <feOffset dy="4" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="7.5" result="blur" />
                    <feFlood floodColor="#717dc6" floodOpacity="0.4" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="DottedConditonFilterClick" x="-20" y="-20" width="102.982" height="102.982" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#717dc6" floodOpacity="0.4" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="DottedConditon" transform="translate(14.991 19.992)">
                <g className="dotted-condition" transform="matrix(1, 0, 0, 1, -14.99, -19.99)" >
                    <g id="#DottedProcessRectangle" transform="translate(51.49 19.92) rotate(45)" >
                        <rect className="dotted-condition-rect" width="39" height="39" stroke="none" />
                        <rect className="dotted-condition-rect" x="-0.5" y="-0.5" width="40" height="40" fill="none" />
                    </g>
                </g>
                <text id="DottedConditonText" transform="translate(36.5 78)">
                    <tspan className="dotted-title" x="-30.804" y="0">{text}</tspan>
                </text>
            </g>
        </svg>
    )
}
