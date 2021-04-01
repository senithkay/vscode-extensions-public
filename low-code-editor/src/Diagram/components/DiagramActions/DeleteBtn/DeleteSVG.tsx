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

import Tooltip from "../../Portals/ConfigForm/Elements/Tooltip";

export const DELETE_SVG_WIDTH_WITH_SHADOW = 34;
export const DELETE_SVG_HEIGHT_WITH_SHADOW = 34;
export const DELETE_SVG_WIDTH = 25;
export const DELETE_SVG_HEIGHT = 25;
export const DELETE_SVG_OFFSET = 16;
export const DELETE_SHADOW_OFFSET = DELETE_SVG_HEIGHT_WITH_SHADOW - DELETE_SVG_HEIGHT;

export function DeleteSVG(props: { x: number, y: number, toolTipTitle?: string }) {
    const { toolTipTitle, ...xyProps } = props;
    const deleteSVGIcon = (
        <g id="DeleteGroup" className="delete-circle" transform="translate(4.5 3.5)">
            <g transform="matrix(1, 0, 0, 1, -4.5, -3.5)">
                <g id="Delete" transform="translate(4.5 3.5)">
                    <rect width="25" height="25" rx="12.5" stroke="none" />
                    <rect x="0.5" y="0.5" width="24" height="24" rx="12" fill="none" />
                </g>
            </g>
            <path
                id="DeleteIcon"
                className="delete-bin-icon"
                d="M2.706,11A1.368,1.368,0,0,1,1.324,9.711L1,3.224a.2.2,0,0,1,.051-.157A.207.207,0,0,1,1.209,
                    3H7.8a.2.2,0,0,1,.157.077A.174.174,0,0,1,8,3.224L7.674,9.711A1.369,1.369,0,0,1,6.291,11ZM5.219,
                    4.747V9.263a.369.369,0,0,0,.738,0V4.747a.369.369,0,0,0-.738,0Zm-2.166,0V9.263a.369.369,0,0,0,.737,
                    0V4.747a.369.369,0,0,0-.737,0ZM.457,2A.436.436,0,0,1,0,1.587V1.174A.437.437,0,0,1,
                    .457.761H2.864V.739A.775.775,0,0,1,3.682,0H5.318a.775.775,0,0,1,.818.739V.761H8.543A.437.437,0,0,1,
                    9,1.174v.413A.436.436,0,0,1,8.543,2Z"
                transform="translate(8 7)"
            />
        </g>
    );
    return (
        <svg  {...xyProps} width={DELETE_SVG_WIDTH_WITH_SHADOW} height={DELETE_SVG_HEIGHT_WITH_SHADOW}>
            <defs>
                <linearGradient id="DeleteLinearGradient" x1="0.5" y1="0.004" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fff" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="DeleteFilter" x="0" y="0" width="34" height="34" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#9a9eac" floodOpacity="0.502" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="DeleteFilter" x="0" y="0" width="40" height="40" filterUnits="userSpaceOnUse">
                    <feOffset dy="2" in="SourceAlpha"/>
                    <feGaussianBlur stdDeviation="2.5" result="blur"/>
                    <feFlood floodColor="#9a9eac" floodOpacity="0.502"/>
                    <feComposite operator="in" in2="blur"/>
                    <feComposite in="SourceGraphic"/>
                </filter>
                <filter id="DeleteFilter" x="0" y="0" width="40" height="40" filterUnits="userSpaceOnUse">
                    <feOffset dy="2" in="SourceAlpha"/>
                    <feGaussianBlur stdDeviation="2.5" result="blur"/>
                    <feFlood floodColor="#9a9eac" floodOpacity="0.502"/>
                    <feComposite operator="in" in2="blur"/>
                    <feComposite in="SourceGraphic"/>
                </filter>
            </defs>
            {props.toolTipTitle ? (
                <Tooltip title={toolTipTitle} placement={"left"} arrow={true}>
                    {deleteSVGIcon}
                </Tooltip>
            ) : (
                <g>
                    {deleteSVGIcon}
                </g>
            )
            }
        </svg>
    )
}
