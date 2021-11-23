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

export function ShowFunctionSVG(props: { x: number, y: number, toolTipTitle?: string, ref?: any }) {
    const { toolTipTitle, ...xyProps } = props;

    return (
        <svg  {...xyProps} width={SHOW_FUNCTION_SVG_WIDTH_WITH_SHADOW} height={SHOW_FUNCTION_SVG_HEIGHT_WITH_SHADOW}>
        <g id="Edit-Button" className="expand-circle expand-click" transform="translate(3.5 4.5)">
            <g transform="matrix(1, 0, 0, 1, -7.5, -6.5)">
                <g id="EditGroup" transform="translate(4.5 3.5)" >
                    <rect x="1" y="1" width="14" height="14" rx="10" fill="none" />
                </g>
            </g>
            <path
                id="Icon-Path"
                className="expand-icon"
                d="M0.219669914,0.219669914 C0.485936477,-0.0465966484 0.902600159,-0.0708026996 1.19621165,0.147051761 L1.28033009,0.219669914 L5.25,4.189 L9.21966991,0.219669914 C9.48593648,-0.0465966484 9.90260016,-0.0708026996 10.1962117,0.147051761 L10.2803301,0.219669914 C10.5465966,0.485936477 10.5708027,0.902600159 10.3529482,1.19621165 L10.2803301,1.28033009 L5.25,6.31066017 L0.219669914,1.28033009 C-0.0732233047,0.987436867 -0.0732233047,0.512563133 0.219669914,0.219669914 Z"
                fill="#36b475"
            />

        </g>
    </svg>
    )
}
