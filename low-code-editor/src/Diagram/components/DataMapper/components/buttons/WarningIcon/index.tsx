/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from 'react';

export interface WarningIcon {
    x: number,
    y: number,
    disabled?: boolean,
    onClick?: () => void
}

export function WarningIcon(props: WarningIcon) {
    const { disabled, ...xyProps } = props;

    return (
        <svg {...xyProps} width="20px" height="18px" viewBox="0 0 20 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <defs>
                <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-1">
                    <stop stop-color="#EA4C4D" offset="0%"/>
                    <stop stop-color="#FF9D52" offset="100%"/>
                </linearGradient>
                <path d="M17.6736475,12.46875 L11.0222737,1.15625 C10.5871371,0.4375 9.84118858,0 9.00199655,0 C8.16280451,0 7.41685604,0.4375 6.98171943,1.15625 L0.330345551,12.46875 C-0.104791059,13.1875 -0.104791059,14.09375 0.299264364,14.8125 C0.734400973,15.5625 1.48034945,16 2.31954148,16 L15.6533704,16 C16.4925625,16 17.2695921,15.5625 17.6736475,14.8125 C18.1087842,14.09375 18.1087842,13.1875 17.6736475,12.46875 Z" id="path-2"/>
                <filter x="-11.1%" y="-6.2%" width="122.2%" height="125.0%" filterUnits="objectBoundingBox" id="filter-3">
                    <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"/>
                    <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"/>
                    <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.15 0" type="matrix" in="shadowBlurOuter1"/>
                </filter>
            </defs>
            <g id="Develop" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="develop-UI-kit" transform="translate(-721.000000, -788.000000)">
                    <g id="Input/48/Default-Copy" transform="translate(721.000000, 697.000000)">
                        <g id="Icon/Alerts/Warning" transform="translate(1.000000, 91.000000)">
                            <g id="Shape" fillRule="nonzero">
                                <use fill="black" fill-opacity="1" filter="url(#filter-3)" xlinkHref="#path-2"/>
                                <use fill="#FF9D52" xlinkHref="#path-2"/>
                            </g>
                            <path d="M9,12 C9.55228475,12 10,12.4477153 10,13 C10,13.5522847 9.55228475,14 9,14 C8.44771525,14 8,13.5522847 8,13 C8,12.4477153 8.44771525,12 9,12 Z M9,4 C9.55228475,4 10,4.44771525 10,5 L10,9 C10,9.55228475 9.55228475,10 9,10 C8.44771525,10 8,9.55228475 8,9 L8,5 C8,4.44771525 8.44771525,4 9,4 Z" id="Combined-Shape" fill="#FFFFFF"/>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    )
}
