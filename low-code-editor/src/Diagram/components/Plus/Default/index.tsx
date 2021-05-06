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

export function SmallPlusSVG(props: { x: number, y: number, handlePlusClick: () => void; }) {
    const {handlePlusClick, ...xyProps } = props;
    return (
        <svg {...xyProps} width={SMALLPLUS_SVG_WIDTH_WITH_SHADOW} height={SMALLPLUS_SVG_HEIGHT_WITH_SHADOW} className="plus-holder" >
            <defs>
                <linearGradient id="linear-gradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="Oval_Copy_15" x="0" y="0" width="26" height="26" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="SmallPlus" transform="translate(7.5 6.5)" onClick={handlePlusClick}>
                <g transform="matrix(1, 0, 0, 1, -7, -6)" className="product-tour-small-plus" filter="url(#Oval_Copy_15)">
                    <g id="Oval_Copy_15-2" transform="translate(7 6)" stroke="#5567d5" strokeMiterlimit="10" strokeWidth="1" fill="url(#linear-gradient)">
                        <circle cx="6" cy="6" r="6" stroke="none" />
                        <circle cx="6" cy="6" r="6.5" fill="none" />
                    </g>
                </g>
                <path id="Combined_Shape_Copy_5" d="M2,4.5V3H.5a.5.5,0,1,1,0-1H2V.5a.5.5,0,1,1,1,0V2H4.5a.5.5,0,1,1,0,1H3V4.5a.5.5,0,1,1-1,0Z" transform="translate(3.5 3.5)" fill="#5567d5" />
            </g>
        </svg>
    )
}
