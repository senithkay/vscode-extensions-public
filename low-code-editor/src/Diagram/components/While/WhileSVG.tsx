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
// tslint:disable: jsx-no-multiline-js
import * as React from "react";

export const WHILE_SVG_WIDTH_WITH_SHADOW = 113.824;
export const WHILE_SVG_HEIGHT_WITH_SHADOW = 113.822;
export const WHILE_SVG_WIDTH = 96.2;
export const WHILE_SVG_HEIGHT = 96.2;
export const WHILE_SHADOW_OFFSET = WHILE_SVG_HEIGHT_WITH_SHADOW - WHILE_SVG_HEIGHT;

// export function WhileSVG(props: { x: number, y: number, text: string }) {
//     const { text, ...xyProps } = props;
//     return (
//         <svg {...xyProps} width={WHILE_SVG_WIDTH_WITH_SHADOW} height={WHILE_SVG_HEIGHT_WITH_SHADOW}>
//             <defs>
//                 <linearGradient id="ForeachLinearGradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
//                     <stop offset="0" stopColor="#fcfcfd" />
//                     <stop offset="1" stopColor="#f7f8fb" />
//                 </linearGradient>
//                 <filter id="ForeachFilterDefault" x="-20" y="-20" width="113.824" height="113.822" filterUnits="userSpaceOnUse">
//                     <feOffset dy="1" in="SourceAlpha" />
//                     <feGaussianBlur stdDeviation="2" result="blur" />
//                     <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
//                     <feComposite operator="in" in2="blur" />
//                     <feComposite in="SourceGraphic" />
//                 </filter>
//                 <filter id="ForeachFilterHover" x="-20" y="-20" width="146.824" height="146.822" filterUnits="userSpaceOnUse">
//                     <feOffset dy="1" in="SourceAlpha" />
//                     <feGaussianBlur stdDeviation="7.5" result="blur" />
//                     <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
//                     <feComposite operator="in" in2="blur" />
//                     <feComposite in="SourceGraphic" />
//                 </filter>
//             </defs>
//             <g id="Foreach" className="foreach-group" transform="translate(56.912 6.414) rotate(45)">
//                 <g transform="matrix(0.71, -0.71, 0.71, 0.71, -44.78, 35.71)" >
//                     <g id="ForeachPolygon" transform="translate(56.91 6.41) rotate(45)">
//                         <rect width="71" height="71" rx="6.5" stroke="none" />
//                         <rect x="0" y="0" width="71" height="71" rx="6.5" fill="none" className="click-effect" />
//                     </g>
//                 </g>
//                 <text className="foreach-text" id="ForeachText" transform="translate(3.889 49.851) rotate(-45)">
//                     <tspan x="32.75" y="10" >{text}</tspan>
//                 </text>
//             </g>
//         </svg>
//     )
// }

export function WhileSVG(props: { x: number, y: number, text: string }) {
    const { text, ...xyProps } = props;
    return (
        <svg {...xyProps} width={WHILE_SVG_WIDTH_WITH_SHADOW} height={WHILE_SVG_HEIGHT_WITH_SHADOW}>
            <defs>
                <linearGradient id="IfElseLinearGradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="IfElseFilterDefault" x="-20" y="-20" width="113.824" height="113.822" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="IfElseFilterHover" x="-20" y="-20" width="146.824" height="146.822" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="7.5" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="IfElse" className="if-else-group if-else-group-active" transform="translate(7 6)">
                <g transform="matrix(1, 0, 0, 1, -7, -6)" >
                    <g id="IfElsePolygon" transform="translate(56.91 6.41) rotate(45)">
                        <rect className="if-else-rect" width="71" height="71" rx="6.5" stroke="none" />
                        <rect className="if-else-rect click-effect" x="0" y="0" width="71" height="71" rx="6.5" fill="none" />
                    </g>
                </g>
                <text className="condition-text" id="IfElseText" >
                    <tspan x={"45%"} y="50%" width="71" textAnchor="middle" data-testid={"condition"} >
                        {text}
                    </tspan>
                </text>
                <g id="Develop" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="develop-UI-kit" transform="translate(-576.000000, -2682.000000)" fill-rule="nonzero">
                        <g id="Logo/Plus/For-each" transform="translate(618.000000, 2696.000000)">
                            <path
                                d="M19,12 C19.5522847,12 20,12.4477153 20,13 C20,13.5128358 19.6139598,13.9355072 19.1166211,13.9932723 L19,14 L11,14 C10.4477153,14 10,13.5522847 10,13 C10,12.4871642 10.3860402,12.0644928 10.8833789,12.0067277 L11,12 L19,12 Z"
                                id="Path-23" fill="#5567D5"></path>
                            <path
                                d="M8,-2.38742359e-12 C12.418278,-2.38661197e-12 16,3.581722 16,8 L15.994,8.09 L18.2928932,5.79289322 C18.6834175,5.40236893 19.3165825,5.40236893 19.7071068,5.79289322 C20.0675907,6.15337718 20.0953203,6.72060824 19.7902954,7.11289944 L19.7071068,7.20710678 L15.0006268,11.9135867 L10.2935206,7.2148224 C9.90265013,6.82464462 9.90208859,6.19147989 10.2922664,5.8006094 C10.6524305,5.43980587 11.2196367,5.41157328 11.6121983,5.71625013 L11.7064794,5.79935516 L14.0044334,8.0947841 C14.0015,8.0635841 14,8.03196722 14,8 C14,4.6862915 11.3137085,2 8,2 C4.6862915,2 2,4.6862915 2,8 C2,11.3137085 4.6862915,14 8,14 C8.55228475,14 9,14.4477153 9,15 C9,15.5522847 8.55228475,16 8,16 C3.581722,16 -3.55271368e-15,12.418278 0,8 C0,3.581722 3.581722,-2.38823522e-12 8,-2.38742359e-12 Z"
                                id="Combined-Shape" fill="#CCD1F2"></path>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    )
}
