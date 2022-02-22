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

export const SHOW_FUNCTION_SVG_WIDTH_WITH_SHADOW = 20;
export const SHOW_FUNCTION_SVG_HEIGHT_WITH_SHADOW = 20;
export const DELETE_SVG_WIDTH = 25;
export const DELETE_SVG_HEIGHT = 25;
export const DELETE_SVG_OFFSET = 16;
export const DELETE_SHADOW_OFFSET = SHOW_FUNCTION_SVG_HEIGHT_WITH_SHADOW - DELETE_SVG_HEIGHT;

export function HideFunctionSVG(props: { x: number, y: number, toolTipTitle?: string, ref?: any }) {
    const { toolTipTitle, ...xyProps } = props;

    return (
        <svg  {...xyProps} width={SHOW_FUNCTION_SVG_WIDTH_WITH_SHADOW} height={SHOW_FUNCTION_SVG_HEIGHT_WITH_SHADOW}>
        <g>
            <g transform="rotate(-90, 8.5, 9.5)" className="expand-circle expand-click" id="Edit-Button">
            <g id="svg_1" transform="matrix(1, 0, 0, 1, -7.5, -6.5)">
                <g id="EditGroup">
                <rect id="svg_2" fill="none" rx="10" height="14" width="14" y="9" x="9"/>
                </g>
            </g>
            <path fill="#36b475" d="m3.71967,4.71967c0.26627,-0.26627 0.68293,-0.29047 0.97654,-0.07262l0.08412,0.07262l3.96967,3.96933l3.96967,-3.96933c0.26627,-0.26627 0.68293,-0.29047 0.97654,-0.07262l0.08412,0.07262c0.26627,0.26627 0.29047,0.68293 0.07262,0.97654l-0.07262,0.08412l-5.03033,5.03033l-5.03033,-5.03033c-0.29289,-0.29289 -0.29289,-0.76777 0,-1.06066z" className="expand-icon" id="Icon-Path"/>
            </g>
        </g>
    </svg>
    )
}
