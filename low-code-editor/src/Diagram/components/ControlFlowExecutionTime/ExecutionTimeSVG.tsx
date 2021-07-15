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
// tslint:disable: jsx-no-multiline-js
import * as React from "react";

export const EXECUTION_LABEL_SVG_WIDTH = 76;
export const EXECUTION_LABEL_SVG_HEIGHT = 31;

const units = ['ns', 'μs', 'ms', 's'];
const formatTimeRange = (timeRange: number) => {
    const sizeFactor = Math.floor(timeRange).toString().length - 1;
    const unitId = sizeFactor > 9 ? 3 : Math.floor(sizeFactor / 3);
    const unit = units[unitId];
    const time = (timeRange / Math.pow(10, (unitId) * 3)).toFixed(1);
    return [time, unit];
}

export function ExecutionTimeSVG(props: { x: number, y: number, text: number }) {
    const { text, ...xyProps } = props;
    xyProps.x = xyProps.x - EXECUTION_LABEL_SVG_WIDTH;
    const [time, unit] = formatTimeRange(text);
    return (
        <svg {...xyProps} width={EXECUTION_LABEL_SVG_WIDTH} height={EXECUTION_LABEL_SVG_HEIGHT} className="plus-holder" >
            <defs>
                <linearGradient
                    id="ExecutionTimeLinearGradient"
                    x1="0.5"
                    y1="-3.921"
                    x2="0.5"
                    y2="1.283"
                    gradientUnits="objectBoundingBox"
                >
                    <stop offset="0" stopColor="#8d91a3" />
                    <stop offset="1" stopColor="#32324d" />
                </linearGradient>
                <filter id="ExecutionTimeFilter" x="0" y="0" width={EXECUTION_LABEL_SVG_WIDTH} height={EXECUTION_LABEL_SVG_HEIGHT} filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feFlood floodColor="#8a92ab" floodOpacity="0.373" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="ExecutionTime" transform="translate(3 2)">
                <g transform="matrix(1, 0, 0, 1, -3, -2) scale(1.3, 1)" filter="url(#ExecutionTimeFilter)">
                    <path
                        id="ExecutionTimeRectangle"
                        d="M0,3A3,3,0,0,1,3,0H37a3,3,0,0,1,3,3V8c0,2.072,4.055,3.5,4.055,3.5S40,12.983,40,16v4a3,3,0,0,
                1-3,3H3a3,3,0,0,1-3-3Z"
                        transform="translate(10 2)"
                        fill="url(#ExecutionTimeLinearGradient)"
                    />
                </g>
                <text
                    id="ExecutionTimeText"
                    transform="translate(26 14)"
                    fill="#fff"
                    fontSize="11"
                    fontFamily="GilmerMedium, Gilmer Medium"
                >
                    <tspan x="-8.501" y="0">{time} {unit}</tspan>
                </text>
            </g>
        </svg>
    );
}
