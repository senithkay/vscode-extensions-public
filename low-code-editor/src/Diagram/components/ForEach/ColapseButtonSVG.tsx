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

export const COLLAPSE_SVG_WIDTH_WITH_SHADOW = 40;
export const COLLAPSE_SVG_HEIGHT_WITH_SHADOW = 40;
export const COLLAPSE_SVG_WIDTH = 25;
export const COLLAPSE_SVG_HEIGHT = 25;
export const COLLAPSE_SHADOW_OFFSET = COLLAPSE_SVG_WIDTH_WITH_SHADOW - COLLAPSE_SVG_HEIGHT;

export function ColapseButtonSVG(props: { x: number, y: number, onClick: () => void }) {
    const { onClick, ...xyProps } = props;
    return (
        <svg {...xyProps} id="UnfoldDefault" width={COLLAPSE_SVG_WIDTH} height={COLLAPSE_SVG_HEIGHT} onClick={onClick}>
            <g id="UnfoldRectangle" fill="#f7f8fb" stroke="#05a26b" strokeMiterlimit="10" strokeWidth="1">
                <rect width={COLLAPSE_SVG_WIDTH} height={COLLAPSE_SVG_HEIGHT} rx="4" stroke="none" />
                <rect x="0.5" y="0.5" width="24" height="24" rx="3.5" fill="none" />
            </g>
            <path
                id="UnfoldCombinedShape"
                d="M4,13V9.737l-1.15,1.15a.5.5,0,1,1-.707-.707l1.748-1.75a.5.5,0,0,1,.609-.5.5.5,0,0,1,
                    .463.135.5.5,0,0,1,.147.364l1.748,1.75a.5.5,0,1,1-.707.707L5,9.737V13ZM.5,7a.5.5,0,1,1,0-1h8a.5.5,
                    0,1,1,0,1ZM4.037,4.933a.5.5,0,0,1-.147-.364L2.143,2.82a.5.5,0,0,1,.707-.707L4,
                    3.263V0H5V3.263l1.15-1.15a.5.5,0,0,1,.707.707L5.109,4.569a.5.5,0,0,1-.5.51A.492.492,0,0,1,4.5,
                    5.068a.5.5,0,0,1-.463-.135Z"
                transform="translate(8 6.003)"
                fill="#039864"
            />
        </svg>
    )
}
