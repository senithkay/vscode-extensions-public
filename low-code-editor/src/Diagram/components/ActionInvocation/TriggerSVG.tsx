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

export const TRIGGER_SVG_WIDTH = 29;
export const TRIGGER_SVG_HEIGHT = 97;
export const TRIGGER_RECT_SVG_HEIGHT = 48;
export const TRIGGER_RECT_SVG_WIDTH = 16;

export function TriggerSVG(props: { x: number, y: number }) {
    const { ...xyProps } = props;
    return (
        <svg {...xyProps} width={TRIGGER_SVG_WIDTH} height={TRIGGER_SVG_HEIGHT} >
            <defs>
                <linearGradient id="TriggerLinearGradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="TriggerFilter" x="0" y="19" width="29" height="61" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <clipPath id="TriggerClipPath">
                    <rect id="Mask" width="13" height="45" rx="3" transform="translate(5 26)" fill="#fff" />
                </clipPath>
            </defs>
            <g id="Trigger" className="trigger-group" transform="translate(3)">
                <rect id="TriggerRectangleA" width="1" height="25" transform="translate(11)" fill="#32324d" />
                <rect id="TriggerRectangleB" width="1" height="25" transform="translate(11 72)" fill="#32324d" />
                <g transform="matrix(1, 0, 0, 1, -3, 0)" filter="url(#TriggerFilter)">
                    <g id="TriggerRectangleC" transform="translate(7 25)" className="trigger-rect">
                        <rect width="15" height="47" rx="1" stroke="none" />
                        <rect x="-0.5" y="-0.5"  width={TRIGGER_RECT_SVG_WIDTH} height={TRIGGER_RECT_SVG_HEIGHT} rx="1.5" fill="none" />
                    </g>
                </g>
                <g id="TriggerGroup" >
                    <rect id="TriggerMask" width="13" height="45" rx="3" transform="translate(5 26)" fill="#fff" />
                    <g id="Mask_Group_38" clipPath="url(#TriggerClipPath)">
                        <path id="TriggerCombinedShape" d="M0,85.35,13.436,69.862l.564.65L.564,86Zm0-3.676L13.436,66.185l.564.65L.564,82.323ZM0,78,13.436,62.508l.564.65L.564,78.646Zm0-3.676L13.436,58.831l.564.65L.564,74.969Zm0-3.677L13.436,55.154,14,55.8.564,71.292Zm0-3.676L13.436,51.477l.564.65L.564,67.615Zm0-3.677L13.436,47.8l.564.65L.564,63.938Zm0-3.677L13.436,44.123l.564.65L.564,60.261Zm0-3.677L13.436,40.446,14,41.1.564,56.584Zm0-3.676L13.436,36.77l.564.65L.564,52.907ZM0,48.58,13.436,33.092l.564.65L.564,49.23ZM0,44.9,13.436,29.416l.564.65L.564,45.554Zm0-3.677L13.436,25.738l.564.65L.564,41.876ZM0,37.55,13.436,22.062l.564.65L.564,38.2Zm0-3.677L13.436,18.384l.564.65L.564,34.522ZM0,30.2,13.436,14.708l.564.65L.564,30.846Zm0-3.677L13.436,11.03l.564.65L.564,27.168Zm0-3.677L13.436,7.354,14,8,.564,23.492Zm0-3.677L13.436,3.677l.564.65L.564,19.815Zm0-3.677L13.436,0,14,.65.564,16.139Z" transform="translate(4 4)" fill="#8d91a3" />
                    </g>
                </g>
            </g>
        </svg>
    )
}
