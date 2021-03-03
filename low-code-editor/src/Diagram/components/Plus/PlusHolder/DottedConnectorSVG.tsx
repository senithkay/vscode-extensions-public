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

export const DOTTED_CONNECTOR_SVG_WIDTH_WITH_SHADOW = 102;
export const DOTTED_CONNECTOR_SVG_HEIGHT_WITH_SHADOW = 102;
export const DOTTED_CONNECTOR_SVG_WIDTH = 56;
export const DOTTED_CONNECTOR_SVG_HEIGHT = 56;

export function DottedConnectorSVG(props: { x: number, y: number, text: string }) {
    const { text, ...xyProps } = props;
    return (
        <svg {...xyProps} width={DOTTED_CONNECTOR_SVG_WIDTH_WITH_SHADOW} height={DOTTED_CONNECTOR_SVG_HEIGHT_WITH_SHADOW}>
            <defs>
                <linearGradient id="DottedConnectorLinearGradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="DottedConnectorFilterDefault" x="-20" y="-20" width="102" height="102" filterUnits="userSpaceOnUse">
                    <feOffset dy="4" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="7.5" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.314" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="DottedConnectorFilterHover" x="-20" y="-20" width="102" height="102" filterUnits="userSpaceOnUse">
                    <feOffset dy="4" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="7.5" result="blur" />
                    <feFlood floodColor="#717dc6" floodOpacity="0.4" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="DottedConnectorFilterClick" x="-20" y="-20" width="102" height="102" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#717dc6" floodOpacity="0.4" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="DottedConnector" transform="translate(14.5 19.5)">
                <g className="dotted-connector" transform="matrix(1, 0, 0, 1, -14.5, -19.5)">
                    <g id="DottedConnectorCircle" transform="translate(23.5 19.5)">
                        <rect className="dotted-connector-circle" width="55" height="55" rx="27.5" stroke="none" />
                        <rect className="dotted-connector-circle" x="-0.5" y="-0.5" width="56" height="56" rx="28" fill="none" />
                    </g>
                </g>
                <text id="DottedConnectorText" transform="translate(36 78)">
                    <tspan className="dotted-title" x="-34.424" y="0">{text}</tspan>
                </text>
            </g>
        </svg>
    )
}
