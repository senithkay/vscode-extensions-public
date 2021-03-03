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

export const EDIT_SVG_WIDTH_WITH_SHADOW = 34;
export const EDIT_SVG_HEIGHT_WITH_SHADOW = 34;
export const EDIT_SVG_WIDTH = 25;
export const EDIT_SVG_HEIGHT = 25;
export const EDIT_SVG_OFFSET = 16;
export const EDIT_SHADOW_OFFSET = EDIT_SVG_HEIGHT_WITH_SHADOW - EDIT_SVG_HEIGHT;

export function EditSVG(props: { x: number, y: number }) {
    const { ...xyProps } = props;
    return (
        <svg  {...xyProps} width={EDIT_SVG_WIDTH_WITH_SHADOW} height={EDIT_SVG_HEIGHT_WITH_SHADOW}>
            <defs>
                <linearGradient id="EditLinearGradient" x1="0.5" y1="0.004" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fff" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="EditFilter" x="0" y="0" width="34" height="34" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#9a9eac" floodOpacity="0.502" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="Edit-Button" className="edit-circle edit-click" transform="translate(4.5 3.5)">
                <g transform="matrix(1, 0, 0, 1, -4.5, -3.5)">
                    <g id="EditGroup" transform="translate(4.5 3.5)" >
                        <rect width="25" height="25" rx="12.5" stroke="none" />
                        <rect x="0.5" y="0.5" width="24" height="24" rx="12" fill="none" />
                    </g>
                </g>
                <g id="EditIcon" >
                    <path
                        id="Icon-Path"
                        className="edit-icon"
                        d="M.2,12a.2.2,0,0,1-.2-.2v-1.54A1.176,1.176,0,0,1,.281,9.5L2.5,11.719A1.179,1.179,0,0,1,
                        1.736,12ZM3.034,10.93l0,0-.242.234ZM.833,8.8,9.455.331a1.194,1.194,0,0,1,1.651,
                        0l.551.534a1.106,1.106,0,0,1,0,1.6L3.034,10.93Z"
                        transform="translate(7 7)"
                    />
                </g>
            </g>
        </svg>
    )
}
