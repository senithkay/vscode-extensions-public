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

export const COLLAPSE_SVG_WIDTH_WITH_SHADOW = 79;
export const COLLAPSE_SVG_HEIGHT_WITH_SHADOW = 41;
export const COLLAPSE_SVG_HEIGHT = 40;
export const COLLAPSE_SVG_WIDTH = 78;

export function CollapseSVG(props: { x: number, y: number }) {
    const { ...xyProps } = props;
    return (
        <svg {...xyProps} width={COLLAPSE_SVG_WIDTH_WITH_SHADOW} height={COLLAPSE_SVG_HEIGHT_WITH_SHADOW}>
            <defs>
                <linearGradient id="CollapseLinearGradient" x1="0.5" y1="0.004" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fff" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="CollapseButtonFilter" x="41.5" y="4.5" width="34" height="34" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#9a9eac" floodOpacity="0.302" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="CollapseGroup" transform="translate(-677 -732)">
                <g id="CollapseRectangle" transform="translate(677 732)" fill="#f7f8fb" stroke="#5567d5" strokeMiterlimit="10" strokeWidth="1">
                    <rect width="79" height="41" rx="7" stroke="none" />
                    <rect x="0.5" y="0.5" width="78" height="40" rx="6.5" fill="none" />
                </g>
                <g id="CollapseIconDots" transform="translate(691 744)">
                    <path id="Dots"  d="M14,1.5A1.5,1.5,0,1,1,15.5,3,1.5,1.5,0,0,1,14,1.5Zm-7,0A1.5,1.5,0,1,1,8.5,3,1.5,1.5,0,0,1,7,1.5Zm-7,0A1.5,1.5,0,1,1,1.5,3,1.5,1.5,0,0,1,0,1.5Z" transform="translate(0 7)" fill="#f7f8fb" stroke="#757785" strokeMiterlimit="10" strokeWidth="1" />
                </g>
                <g id="CollapseUnfold" className="collapse-unfold" transform="translate(723 740)">
                    <g transform="matrix(1, 0, 0, 1, -46, -8)" filter="url(#CollapseButtonFilter)">
                        <g id="UnfoldRectangle" transform="translate(46 8)">
                            <rect width="25" height="25" rx="4" stroke="none" />
                            <rect x="0.5" y="0.5" width="24" height="24" rx="3.5" fill="none" />
                        </g>
                    </g>
                    <path id="UnfoldArrow" d="M3.038,12.884a.5.5,0,0,1-.147-.363L.147,9.775a.5.5,0,0,1,.707-.707L3,11.215V8.482a.5.5,0,0,1,1,0v2.733L6.147,9.068a.5.5,0,1,1,.707.707L4.109,12.521a.5.5,0,0,1-.5.509.484.484,0,0,1-.108-.012.5.5,0,0,1-.462-.134ZM3,4.518V1.785L.853,3.932a.5.5,0,0,1-.707-.707L2.892.479a.5.5,0,0,1,.608-.5A.484.484,0,0,1,3.608-.03a.5.5,0,0,1,.5.508L6.854,3.225a.5.5,0,0,1-.707.707L4,1.786V4.518a.5.5,0,0,1-1,0Z" transform="translate(8.996 6)" fill="#36b475" />
                </g>
            </g>
        </svg>
    )
}


