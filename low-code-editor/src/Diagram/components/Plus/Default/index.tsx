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

export const SMALLPLUS_SVG_WIDTH_WITH_SHADOW = 28;
export const SMALLPLUS_SVG_HEIGHT_WITH_SHADOW = 25;
export const SMALLPLUS_RADIUS = 6.5;
export const SMALLPLUS_SVG_HEIGHT = SMALLPLUS_RADIUS * 2;
export const SMALLPLUS_SVG_WIDTH = SMALLPLUS_RADIUS * 2;

export function SmallPlusSVG(props: { x: number, y: number }) {
    const { ...xyProps } = props;
    return (
        <svg {...xyProps} width={SMALLPLUS_SVG_WIDTH_WITH_SHADOW} height={SMALLPLUS_SVG_HEIGHT_WITH_SHADOW} className="plus-holder" >
            <defs>
                <filter
                    id="SmallPlusFilter"
                    x="0"
                    y="0"
                    width={SMALLPLUS_SVG_WIDTH_WITH_SHADOW}
                    height={SMALLPLUS_SVG_HEIGHT_WITH_SHADOW}
                    filterUnits="userSpaceOnUse"
                >
                    <feOffset dy="2" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feFlood floodColor="#9a9eac" floodOpacity="0.502" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="SmallPlus" transform="translate(7.5 5.5)">
                <g transform="matrix(1, 0, 0, 1, -7.5, -5.5)" filter="url(#SmallPlusFilter)">
                    <g
                        id="PlusOval"
                        className="product-tour-small-plus"
                        transform="translate(7.5 5.5)"
                        fill="#36b475"
                        stroke="#2fa86c"
                        strokeMiterlimit="10"
                        strokeWidth="1"
                    >
                        <circle cx="6.5" cy="6.5" r="6.5" stroke="none" />
                        <circle cx="6.5" cy="6.5" r="6" fill="none" />
                    </g>
                </g>
                <path
                    id="SmallPlusCombinedShape"
                    d="M2,4.5V3H.5a.5.5,0,1,1,0-1H2V.5a.5.5,0,1,1,1,0V2H4.5a.5.5,0,1,1,0,1H3V4.5a.5.5,0,1,1-1,0Z"
                    transform="translate(4 4)"
                    fill="#fff"
                />
            </g>
        </svg>
    )
}
