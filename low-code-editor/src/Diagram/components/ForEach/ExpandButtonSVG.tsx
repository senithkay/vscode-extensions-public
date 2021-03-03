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

export const EXPAND_SVG_WIDTH_WITH_SHADOW = 40;
export const EXPAND_SVG_HEIGHT_WITH_SHADOW = 40;
export const EXPAND_SVG_WIDTH = 25;
export const EXPAND_SVG_HEIGHT = 25;
export const EXPAND_SHADOW_OFFSET = EXPAND_SVG_WIDTH_WITH_SHADOW - EXPAND_SVG_HEIGHT;

export function ExpandButtonSVG(props: { x: number, y: number, onClick: () => void }) {
    const { onClick, ...xyProps } = props;
    return (
        <svg {...xyProps} width={EXPAND_SVG_WIDTH}  height={EXPAND_SVG_HEIGHT} className="expand" onClick={onClick}>
            <g id="UnfoldRectangle" fill="#f7f8fb" stroke="#05a26b" strokeMiterlimit="10" strokeWidth="1">
                <rect width={EXPAND_SVG_WIDTH} height={EXPAND_SVG_HEIGHT} rx="4" stroke="none" />
                <rect x="0.5" y="0.5" width="24" height="24" rx="3.5" fill="none" />
            </g>
            <path
                id="ExpandIcon"
                className="expand-icon"
                d="M3.038,12.884a.5.5,0,0,1-.147-.363L.147,9.775a.5.5,0,0,1,.707-.707L3,11.215V8.482a.5.5,0,0,1,
                1,0v2.733L6.147,9.068a.5.5,0,1,1,.707.707L4.109,12.521a.5.5,0,0,1-.5.509.484.484,0,0,1-.108-.012.5.5,
                0,0,1-.462-.134ZM3,4.518V1.785L.853,3.932a.5.5,0,0,1-.707-.707L2.892.479a.5.5,0,0,1,
                .608-.5A.484.484,0,0,1,3.608-.03a.5.5,0,0,1,.5.508L6.854,3.225a.5.5,0,0,1-.707.707L4,
                1.786V4.518a.5.5,0,0,1-1,0Z"
                transform="translate(8.996 6)"
                fill="#36b475"
            />
        </svg>
    )
}
